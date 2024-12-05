import { Module } from '@nestjs/common';
import { ChatGateway } from './webrtc.gateway';

@Module({
  providers: [ChatGateway],
})
export class WebrtcModule {}
