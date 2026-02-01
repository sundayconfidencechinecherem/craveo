import { User } from './post';

export interface Comment {
  id: string;
  user: User;
  content: string;
  likes: number;
  isLiked: boolean;
  replies: number;
  createdAt: Date | string;
  repliesList?: Comment[];  
}
