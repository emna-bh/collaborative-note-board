import { Module } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { BoardGateway } from './board/board.gateway';

@Module({
  providers: [RealtimeService, BoardGateway]
})
export class RealtimeModule {}
