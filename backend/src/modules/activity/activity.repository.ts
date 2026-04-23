import { Injectable } from '@nestjs/common';
import { firestoreDb } from '../../firebase/firestore.provider';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityRepository {
  private db = firestoreDb;
  private collection = this.db.collection('activities');

  private mapDocToActivity(
    doc:
      | FirebaseFirestore.QueryDocumentSnapshot
      | FirebaseFirestore.DocumentSnapshot,
  ): Activity {
    const data = doc.data() as Omit<Activity, 'id'>;

    return {
      id: doc.id,
      type: data.type,
      noteId: data.noteId,
      noteTitle: data.noteTitle,
      userId: data.userId,
      userEmail: data.userEmail ?? null,
      userName: data.userName ?? null,
      createdAt: data.createdAt,
    };
  }

  async create(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const docRef = await this.collection.add(activity);
    return { id: docRef.id, ...activity };
  }

  async findLatest(limit: number): Promise<Activity[]> {
    const snapshot = await this.collection
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => this.mapDocToActivity(doc));
  }
}
