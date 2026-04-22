import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      creatorEmail: user.email ?? null,
      creatorName: user.name ?? null,
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
    const { position, ...changes } = dto;
    let nextPosition = note.position;

    if (position !== undefined && position !== note.position) {
      const reorderedNotes = await this.reorderSingleNote(
        noteId,
        position,
        updatedAt,
      );

      nextPosition =
        reorderedNotes.find((item) => item.id === noteId)?.position ??
        note.position;
      this.notesGateway.emitNotesReordered(
        reorderedNotes.map(({ id, position, updatedAt }) => ({
          id,
          position,
          updatedAt,
        })),
      );
    }

    await this.notesRepository.update(noteId, {
      ...changes,
      position: nextPosition,
      updatedAt,
    });

    const updatedNote = {
      ...note,
      ...changes,
      position: nextPosition,
      updatedAt,
    };
    this.notesGateway.emitNoteUpdated(updatedNote);
    return updatedNote;
  }

  async reorder(noteIds: string[]): Promise<Note[]> {
    const notes = await this.notesRepository.findAll();
    const updatedAt = new Date().toISOString();
    const reorderedNotes = this.buildReorderedNotes(noteIds, notes, updatedAt);

    await this.notesRepository.reorder(
      reorderedNotes.map(({ id, position, updatedAt }) => ({
        id,
        position,
        updatedAt,
      })),
    );

    this.notesGateway.emitNotesReordered(
      reorderedNotes.map(({ id, position, updatedAt }) => ({
        id,
        position,
        updatedAt,
      })),
    );

    return reorderedNotes;
  }

  async remove(noteId: string): Promise<void> {
    await this.findOne(noteId);
    await this.notesRepository.delete(noteId);
    this.notesGateway.emitNoteDeleted(noteId);
  }

  private async reorderSingleNote(
    noteId: string,
    targetPosition: number,
    updatedAt: string,
  ): Promise<Note[]> {
    const notes = await this.notesRepository.findAll();
    const orderedIds = notes
      .map((note) => note.id)
      .filter((id) => id !== noteId);
    const clampedPosition = Math.max(
      0,
      Math.min(targetPosition, orderedIds.length),
    );

    orderedIds.splice(clampedPosition, 0, noteId);

    const reorderedNotes = this.buildReorderedNotes(
      orderedIds,
      notes,
      updatedAt,
    );

    await this.notesRepository.reorder(
      reorderedNotes.map(({ id, position, updatedAt }) => ({
        id,
        position,
        updatedAt,
      })),
    );

    return reorderedNotes;
  }

  private buildReorderedNotes(
    noteIds: string[],
    notes: Note[],
    updatedAt: string,
  ): Note[] {
    const uniqueIds = new Set(noteIds);

    if (uniqueIds.size !== noteIds.length) {
      throw new BadRequestException(
        'Reorder payload contains duplicate note ids',
      );
    }

    if (noteIds.length !== notes.length) {
      throw new BadRequestException(
        'Reorder payload must include every note on the board',
      );
    }

    const noteMap = new Map(notes.map((note) => [note.id, note]));

    noteIds.forEach((noteId) => {
      if (!noteMap.has(noteId)) {
        throw new BadRequestException(`Unknown note id: ${noteId}`);
      }
    });

    return noteIds.map((noteId, index) => ({
      ...noteMap.get(noteId)!,
      position: index,
      updatedAt,
    }));
  }
}
