import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS cho API và WebSocket
  app.enableCors({
    origin: 'http://localhost:3005', // Cho phép frontend React
    methods: 'GET,POST,PUT,DELETE', // Phương thức HTTP
    allowedHeaders: 'Content-Type, Authorization', // Header được phép
  });

  // Cấu hình WebSocket adapter cho Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable validation pipe nếu cần
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001); // Backend chạy trên cổng 3000
}
bootstrap();
