import { Module } from '@nestjs/common';
import { WebrtcModule } from './webrtc.module';

@Module({
  imports: [WebrtcModule],
})
export class AppModule {}
