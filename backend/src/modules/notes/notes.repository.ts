import { Injectable } from '@nestjs/common';
import { firestoreDb } from '../../firebase/firestore.provider';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesRepository {
  private db = firestoreDb;
  private collection = this.db.collection('notes');

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

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Note, 'id'>),
    }));
  }

  async findById(noteId: string): Promise<Note | null> {
    const doc = await this.collection.doc(noteId).get();

    if (!doc.exists) return null;

    return {
      id: doc.id,
      ...(doc.data() as Omit<Note, 'id'>),
    };
  }

  async update(noteId: string, data: Partial<Note>): Promise<void> {
    await this.collection.doc(noteId).update(data);
  }

  async delete(noteId: string): Promise<void> {
    await this.collection.doc(noteId).delete();
  }
}
