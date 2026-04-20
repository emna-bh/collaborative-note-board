import { Module } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { NotesGateway } from './notes.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [RealtimeService, NotesGateway],
  exports: [NotesGateway],
})
export class RealtimeModule {}
