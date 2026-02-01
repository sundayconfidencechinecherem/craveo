// src/models/Notification.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MENTION = 'MENTION',
}

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  post?: Types.ObjectId;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' }, // ✅ new field
    type: { type: String, enum: Object.values(NotificationType), required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NotificationModel = model<INotification>('Notification', notificationSchema);
export default NotificationModel;
