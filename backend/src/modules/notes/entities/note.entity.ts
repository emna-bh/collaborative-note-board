export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string | null;
  position: number;
  creatorId: string;
  creatorEmail?: string | null;
  creatorName?: string | null;
  createdAt: string;
  updatedAt: string;
}
