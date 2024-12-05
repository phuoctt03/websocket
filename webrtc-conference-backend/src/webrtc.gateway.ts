import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3000, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: { [key: string]: string } = {}; // Lưu trữ ID phòng cho mỗi client

  // Kết nối client
  handleConnection(client: Socket) {
    console.log('Client connected: ', client.id);
  }

  // Ngắt kết nối client
  handleDisconnect(client: Socket) {
    console.log('Client disconnected: ', client.id);
    const roomId = this.clients[client.id];
    if (roomId) {
      // Xóa client khỏi phòng
      client.leave(roomId);
      delete this.clients[client.id];
    }
  }

  // Tạo phòng mới
  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket) {
    const roomId = this.generateRoomId();
    this.clients[client.id] = roomId; // Gán phòng cho client
    client.join(roomId); // Thêm client vào phòng
    client.emit('roomCreated', roomId); // Trả về roomId cho client
    console.log(`Room created: ${roomId} by client ${client.id}`);
  }

  // Tham gia phòng
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    if (!client?.id) {
      console.error('Client is not connected or client.id is undefined');
      return;
    }

    console.log(`Attempting to join room: ${roomId}, client: ${client.id}`);

    if (!roomId || !this.isRoomExist(roomId)) {
      console.error('Room does not exist or invalid roomId:', roomId);
      client.emit('error', { message: 'Room does not exist' });
      return;
    }

    // Gán phòng cho client
    this.clients[client.id] = roomId;
    client.join(roomId); // Tham gia phòng
    console.log(`Client ${client.id} joined room: ${roomId}`);

    // Gửi phản hồi cho client
    client.emit('joinedRoom', { message: 'Successfully joined room', roomId });
  }

  // Gửi tin nhắn
  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @MessageBody() data: { roomId: string; content: string; sender: string },
  ) {
    const { roomId, content, sender } = data;
    console.log(`Message received from ${sender} in room ${roomId}: `, content);
    if (!roomId || !this.isRoomExist(roomId)) {
      console.error('Room does not exist or invalid room ID');
      return;
    }

    const message = {
      content,
      sender,
      timestamp: new Date().toISOString(),
    };

    // Gửi tin nhắn đến tất cả client trong phòng
    console.log(this.server.to(roomId));
    this.server.to(roomId).emit('receiveMessage', message);
    console.log(`Message sent to room ${roomId}: `, message);
  }

  // Kiểm tra phòng có tồn tại không
  private isRoomExist(roomId: string): boolean {
    return Object.values(this.clients).includes(roomId);
  }

  // Tạo room ID ngẫu nhiên
  private generateRoomId(): string {
    return Math.random().toString(36).substring(7);
  }
}
