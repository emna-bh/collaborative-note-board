import { Module } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { NotesGateway } from './notes.gateway';

@Module({
  providers: [RealtimeService, NotesGateway],
  exports: [NotesGateway],
})
export class RealtimeModule {}
