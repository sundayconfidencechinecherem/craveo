import mongoose, { Schema, Document, Types } from 'mongoose';

export enum PostType {
  NORMAL = 'NORMAL',    // UPPERCASE
  RECIPE = 'RECIPE'     // UPPERCASE
}

export enum PostPrivacy {
  PUBLIC = 'PUBLIC',    // UPPERCASE
  FRIENDS = 'FRIENDS',  // UPPERCASE
  PRIVATE = 'PRIVATE'   // UPPERCASE
}

export interface IPost extends Document {
  title: string;
  content: string;
  images: string[];
  videos?: string[];
  postType: PostType;
  privacy: PostPrivacy;
  tags: string[];
  author: Types.ObjectId;
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  saves: Types.ObjectId[];
  shares: Types.ObjectId[];
  recipeDetails?: {
    ingredients: string[];
    instructions: string[];
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
  location?: string;
  restaurant?: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: 5000
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  videos: [{
    type: String
  }],
 postType: {
  type: String,
  enum: Object.values(PostType),
  default: PostType.NORMAL
},
privacy: {
  type: String,
  enum: Object.values(PostPrivacy), 
  default: PostPrivacy.PUBLIC
},
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  saves: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  shares: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  recipeDetails: {
    ingredients: [{
      type: String,
      trim: true
    }],
    instructions: [{
      type: String,
      trim: true
    }],
    prepTime: Number,
    cookTime: Number,
    servings: Number,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    }
  },
  location: {
    type: String,
    trim: true
  },
  restaurant: {
    type: String,
    trim: true
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  saveCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update counts when arrays change
PostSchema.pre('save', function(this: any, next) {
  if (this.isModified('likes')) this.likeCount = this.likes.length;
  if (this.isModified('comments')) this.commentCount = this.comments.length;
  if (this.isModified('saves')) this.saveCount = this.saves.length;
  if (this.isModified('shares')) this.shareCount = this.shares.length;
  next();
});

const Post = mongoose.model<IPost>('Post', PostSchema);
export default Post;