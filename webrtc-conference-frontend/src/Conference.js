import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Kết nối tới backend

const ChatRoom = () => {
  const [room, setRoom] = useState('');
  const [join, setJoin] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // Lưu trữ danh sách tin nhắn

  useEffect(() => {
    // Lắng nghe sự kiện nhận tin nhắn từ backend
    socket.on('receiveMessage', (data) => {
      console.log('Received message:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  // Tạo phòng mới
  const createRoom = () => {
    socket.emit('createRoom');
    socket.on('roomCreated', (roomId) => {
      setRoom(roomId); // Cập nhật roomId sau khi phòng được tạo
    });
    setJoin(true); // Hiển thị giao diện tham gia phòng
  };

  // Tham gia phòng
  const joinRoom = () => {
    const roomId = room;
    if (room.trim()) {
      console.log('socket: ', socket);
      socket.emit('joinRoom', roomId);
      console.log(`Joining room: ${room}, ${socket.id}`);
      setJoin(true); // Hiển thị giao diện tham gia phòng
    } else {
      alert('Please enter a valid room ID.');
    }
  };

  // Gửi tin nhắn
  const sendMessage = () => {
    console.log(`Sending room: ${room}`);
    if (message.trim()) {
      const messageData = {
        roomId: room,
        content: message,
        sender: socket.id, // Hoặc sử dụng username nếu có
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit('sendMessage', messageData); // Gửi tin nhắn tới backend
      setMessage(''); // Xóa nội dung ô nhập sau khi gửi
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Chat Room</h1>
      {!join && (
        <div>
          <button onClick={createRoom}>Create Room</button>
          <input
            type="text"
            placeholder="Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
          <button onClick={joinRoom} disabled={!room} style={{ marginLeft: '10px', padding: '5px' }}>
            Join Room
          </button>
        </div>
      )}
      {join && (
        <div>
          <h2>Room ID: {room}</h2>
          <div
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px',
              height: '300px',
              overflowY: 'scroll',
            }}
          >
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <strong>{msg.sender}:</strong> {msg.content}{' '}
                <span style={{ fontSize: '0.8em', color: '#999' }}>({msg.timestamp})</span>
              </div>
            ))}
          </div>
          <div>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '70%', padding: '5px' }}
            />
            <button onClick={sendMessage} style={{ marginLeft: '10px', padding: '5px' }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
