export interface Note {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
    owner: string;
  }