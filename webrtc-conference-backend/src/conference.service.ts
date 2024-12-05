import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ConferenceService {
  private rooms = {}; // Lưu trữ các phòng đã tạo

  constructor() {}

  createRoom(socket: Socket) {
    const roomId = this.generateRoomId();
    this.rooms[roomId] = [];
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
  }

  joinRoom(socket: Socket, roomId: string) {
    if (this.rooms[roomId]) {
      socket.join(roomId);
      this.rooms[roomId].push(socket.id);
    } else {
      socket.emit('error', 'Room does not exist');
    }
  }

  handleOffer(socket: Socket, offer: any) {
    socket.to(offer.to).emit('offer', offer);
  }

  handleAnswer(socket: Socket, answer: any) {
    socket.to(answer.to).emit('answer', answer);
  }

  handleIceCandidate(socket: Socket, candidate: any) {
    socket.to(candidate.to).emit('iceCandidate', candidate);
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8); // Tạo ID phòng ngẫu nhiên
  }
}
