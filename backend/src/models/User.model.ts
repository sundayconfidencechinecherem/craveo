import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  username: string;
  fullName: string;
  dateOfBirth?: Date;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  website?: string;
  location?: string;
  isVerified: boolean;
  isPrivate: boolean;
  lastLogin?: Date;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  savedPosts: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFollowerCount(): number;
  getFollowingCount(): number;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: 100
  },
  dateOfBirth: {
    type: Date
  },
  avatar: {
    type: String,
    default: '/images/avatars/default.png'
  },
  coverPhoto: {
    type: String,
    default: '/images/covers/default.jpg'
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  website: {
    type: String,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please enter a valid URL']
  },
  location: {
    type: String,
    maxlength: 100
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  savedPosts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordStr = this.password as string; // Type assertion
    this.password = await bcrypt.hash(passwordStr, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get follower count
UserSchema.methods.getFollowerCount = function(): number {
  return this.followers?.length || 0;
};

// Get following count
UserSchema.methods.getFollowingCount = function(): number {
  return this.following?.length || 0;
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;