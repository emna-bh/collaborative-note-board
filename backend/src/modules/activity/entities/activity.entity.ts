export type ActivityType = 'created' | 'edited' | 'deleted';

export interface Activity {
  id: string;
  type: ActivityType;
  noteId: string;
  noteTitle: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  createdAt: string;
}
