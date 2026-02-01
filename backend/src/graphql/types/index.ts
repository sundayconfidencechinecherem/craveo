import { IUser } from '../../models/User.model';
import { IPost } from '../../models/Post.model';
import { IComment } from '../../models/Comment.model';
import { INotification } from '../../models/Notification.model';
import { Types } from 'mongoose';

export interface Context {
  user?: IUser;
}

export interface LeanPost extends Omit<IPost, '_id'> {
  _id: Types.ObjectId;
}

export interface LeanUser extends Omit<IUser, '_id'> {
  _id: Types.ObjectId;
}

export interface LeanComment extends Omit<IComment, '_id'> {
  _id: Types.ObjectId;
}

export interface LeanNotification extends Omit<INotification, '_id'> {
  _id: Types.ObjectId;
}

export interface PostActionResponse {
  success: boolean;
  message: string;
  post?: any;
}