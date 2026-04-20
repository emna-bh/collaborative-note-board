import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotesController } from './notes.controller';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';
import { NotesGateway } from '../realtime/notes.gateway';

@Module({
  imports: [AuthModule],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository, NotesGateway],
  exports: [NotesService],
})
export class NotesModule {}
