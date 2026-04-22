import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { AuthModule } from '../auth/auth.module';
import { NotesController } from './notes.controller';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';
import { NotesGateway } from '../realtime/notes.gateway';

@Module({
  imports: [AuthModule, ActivityModule],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository, NotesGateway],
  exports: [NotesService],
})
export class NotesModule {}
