import { Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { CurrentUser } from '../auth/interfaces/current-user.interface';
import { Note } from './entities/note.entity';
import { NotesGateway } from '../realtime/notes.gateway';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly notesGateway: NotesGateway,
  ) {}

  async create(dto: CreateNoteDto, user: CurrentUser): Promise<Note> {
    const now = new Date().toISOString();
    const existingNotes = await this.notesRepository.findAll();
    const nextPosition = dto.position ?? existingNotes.length;

    const note = await this.notesRepository.create({
      title: dto.title,
      content: dto.content,
      color: dto.color ?? null,
      creatorId: user.uid,
      position: nextPosition,
      createdAt: now,
      updatedAt: now,
    });
    this.notesGateway.emitNoteCreated(note);
    return note;
  }

  async findAll(query: QueryNotesDto): Promise<Note[]> {
    return this.notesRepository.findAll(query?.color);
  }

  async findOne(noteId: string): Promise<Note> {
    const note = await this.notesRepository.findById(noteId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(noteId: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(noteId);
    const updatedAt = new Date().toISOString();

    await this.notesRepository.update(noteId, {
      ...dto,
      updatedAt,
    });

    const updatedNote = {
      ...note,
      ...dto,
      updatedAt,
    };
    this.notesGateway.emitNoteUpdated(updatedNote);
    return updatedNote;
  }

  async remove(noteId: string): Promise<void> {
    await this.findOne(noteId);
    await this.notesRepository.delete(noteId);
    this.notesGateway.emitNoteDeleted(noteId);
  }
}
