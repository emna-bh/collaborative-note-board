export interface Note {
  id: string;
  title: string;
  content?: string;
  color?: string | null;
  position: number;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}
