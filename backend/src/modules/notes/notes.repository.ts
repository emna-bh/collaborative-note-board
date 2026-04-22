import { Injectable } from '@nestjs/common';
import { firestoreDb } from '../../firebase/firestore.provider';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesRepository {
  private db = firestoreDb;
  private collection = this.db.collection('notes');

  private mapDocToNote(
    doc:
      | FirebaseFirestore.QueryDocumentSnapshot
      | FirebaseFirestore.DocumentSnapshot,
  ): Note {
    const data = doc.data() as Omit<Note, 'id'>;

    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      color: data.color ?? null,
      creatorId: data.creatorId,
      creatorEmail: data.creatorEmail ?? null,
      creatorName: data.creatorName ?? null,
      position: data.position,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async create(note: Omit<Note, 'id'>): Promise<Note> {
    const docRef = await this.collection.add(note);
    return { id: docRef.id, ...note };
  }

  async findAll(color?: string): Promise<Note[]> {
    let query: FirebaseFirestore.Query = this.collection.orderBy(
      'position',
      'asc',
    );

    if (color) {
      query = this.collection
        .where('color', '==', color)
        .orderBy('position', 'asc');
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => this.mapDocToNote(doc));
  }

  async findById(noteId: string): Promise<Note | null> {
    const doc = await this.collection.doc(noteId).get();

    if (!doc.exists) return null;

    return this.mapDocToNote(doc);
  }

  async update(noteId: string, data: Partial<Note>): Promise<void> {
    await this.collection.doc(noteId).update(data);
  }

  async reorder(
    notes: Array<Pick<Note, 'id' | 'position' | 'updatedAt'>>,
  ): Promise<void> {
    const batch = this.db.batch();

    notes.forEach((note) => {
      batch.update(this.collection.doc(note.id), {
        position: note.position,
        updatedAt: note.updatedAt,
      });
    });

    await batch.commit();
  }

  async delete(noteId: string): Promise<void> {
    await this.collection.doc(noteId).delete();
  }
}
