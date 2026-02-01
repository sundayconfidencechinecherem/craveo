import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  replies: Types.ObjectId[];   // ✅ add this
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: 500
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  timestamps: true
});

const Comment = mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;
