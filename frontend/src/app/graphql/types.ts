// src/app/graphql/types.ts - COMPLETE SAFE VERSION
// Exact types matching your GraphQL schema with null safety


// Base types
export interface MutationResponse {
  success: boolean;
  message: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
}

// Enums matching GraphQL schema
export enum PostType {
  NORMAL = 'NORMAL',
  RECIPE = 'RECIPE'
}

export enum PostPrivacy {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE'
}

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MENTION = 'MENTION',
  SHARE = 'SHARE',
  SYSTEM = 'SYSTEM'
}

// User type - EXACT MATCH to GraphQL schema
export interface User {
  id: string;
  email?: string;
  username: string;
  fullName: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  website?: string;
  location?: string;
  isVerified: boolean;
  isPrivate: boolean;
  lastLogin?: string;
  followers: User[];
  following: User[];
  savedPosts: Post[];
  followerCount: number;
  followingCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

// RecipeDetails type - EXACT MATCH to GraphQL schema
export interface RecipeDetails {
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
}

// Post type - SAFE VERSION with optional arrays
export interface Post {
  id: string;
  title?: string;
  content?: string;
  images?: string[];
  videos?: string[];
  postType?: 'NORMAL' | 'RECIPE';
  privacy?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  tags?: string[];
  author?: User;
  likes?: User[];
  comments?: Comment[];
  saves?: User[];
  shares?: User[];
  recipeDetails?: RecipeDetails;
  location?: string;
  restaurant?: string;
  likeCount?: number;
  commentCount?: number;
  saveCount?: number;
  shareCount?: number;
  isEdited?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isLiked?: boolean;
  isSaved?: boolean;
}




// Comment type - EXACT MATCH to GraphQL schema
export interface Comment {
  id: string;
  content: string;
  author: User;
  post: Post;
  createdAt: string;
  updatedAt: string;
}

// Notification type - EXACT MATCH to GraphQL schema
export interface Notification {
  id: string;
  type: NotificationType;
  sender?: User;
  receiver: User;
  post?: Post;
  comment?: Comment;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface NotificationCount {
  total: number;
  unread: number;
}

// Mutation response types
export interface LikePostResponse {
  success: boolean;
  message: string;
  post: Post;
  isLiked?: boolean;
}

export interface UnlikePostResponse {
  success: boolean;
  message: string;
  post: Post;
  isLiked?: boolean;
}

export interface SavePostResponse {
  success: boolean;
  message: string;
  post: Post;
  isSaved?: boolean;
}

export interface SharePostResponse {
  success: boolean;
  message: string;
  post: Post;
  isShared?: boolean;
}

// Auth types
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

// Input types - EXACT MATCH to GraphQL schema
export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName: string;
  dateOfBirth?: string;
  avatar?: string;
}

export interface UpdateProfileInput {
  username?: string;
  fullName?: string;
  email?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatar?: string;
  coverPhoto?: string;
  dateOfBirth?: string;
}

export interface RecipeDetailsInput {
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  images: string[];
  videos?: string[];
  postType?: PostType;
  privacy?: PostPrivacy;
  tags?: string[];
  recipeDetails?: RecipeDetailsInput;
  location?: string;
  restaurant?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  images?: string[];
  videos?: string[];
  privacy?: PostPrivacy;
  tags?: string[];
  recipeDetails?: RecipeDetailsInput;
  location?: string;
  restaurant?: string;
}

export interface CreateNotificationInput {
  type: NotificationType;
  receiverId: string;
  postId?: string;
  commentId?: string;
  message: string;
}



// UI Helper types
export interface PostWithUI {
  id: string;
  title: string;
  content: string;
  images: string[];
  videos: string[];
  postType: 'NORMAL' | 'RECIPE';
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  tags: string[];
  author: User;
  likes: User[];
  comments: Comment[];
  saves: User[];
  shares: User[];
  recipeDetails?: RecipeDetails;
  location?: string;
  restaurant?: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  isSaved: boolean;
  // UI-only fields
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  cuisine?: string;
  prepTime?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  calories?: number;
  servings?: number;
}

export interface CommentWithUI extends Comment {
  likes: number;
  isLiked: boolean;
  replies: number;
  repliesList: Comment[];
}

// SAFE Helper function to convert GraphQL Post to UI Post
export function convertPostForUI(post: any): PostWithUI | null {
  if (!post || typeof post !== 'object') {
    return null;
  }

  // Create safe defaults for all fields
  const safePost: PostWithUI = {
    id: post.id || '',
    title: post.title || '',
    content: post.content || '',
    images: Array.isArray(post.images) ? post.images : [],
    videos: Array.isArray(post.videos) ? post.videos : [],
    postType: post.postType === 'RECIPE' ? 'RECIPE' : 'NORMAL',
    privacy: post.privacy === 'PRIVATE' ? 'PRIVATE' : post.privacy === 'FRIENDS' ? 'FRIENDS' : 'PUBLIC',
    tags: Array.isArray(post.tags) ? post.tags : [],
    author: post.author || { 
      id: '', 
      username: 'Unknown', 
      fullName: 'Unknown User',
      avatar: '',
      isVerified: false,
      isPrivate: false,
      followers: [],
      following: [],
      savedPosts: [],
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      createdAt: '',
      updatedAt: ''
    },
    likes: Array.isArray(post.likes) ? post.likes : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    saves: Array.isArray(post.saves) ? post.saves : [],
    shares: Array.isArray(post.shares) ? post.shares : [],
    recipeDetails: post.recipeDetails,
    location: post.location || '',
    restaurant: post.restaurant || '',
    likeCount: typeof post.likeCount === 'number' ? post.likeCount : 0,
    commentCount: typeof post.commentCount === 'number' ? post.commentCount : 0,
    saveCount: typeof post.saveCount === 'number' ? post.saveCount : 0,
    shareCount: typeof post.shareCount === 'number' ? post.shareCount : 0,
    isEdited: Boolean(post.isEdited),
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: post.updatedAt || new Date().toISOString(),
    isLiked: Boolean(post.isLiked),
    isSaved: Boolean(post.isSaved),
    // UI fields
    imageUrl: Array.isArray(post.images) && post.images[0] ? post.images[0] : '',
    likesCount: typeof post.likeCount === 'number' ? post.likeCount : 0,
    commentsCount: typeof post.commentCount === 'number' ? post.commentCount : 0,
    sharesCount: typeof post.shareCount === 'number' ? post.shareCount : 0,
    cuisine: Array.isArray(post.tags) 
      ? post.tags.find((tag: string) => 
          ['Italian', 'Japanese', 'Mexican', 'American', 'Thai', 'Indian', 'French'].includes(tag)
        ) 
      : undefined,
    prepTime: post.recipeDetails?.prepTime ? `${post.recipeDetails.prepTime} mins` : undefined,
    difficulty: post.recipeDetails?.difficulty 
      ? (post.recipeDetails.difficulty.charAt(0).toUpperCase() + post.recipeDetails.difficulty.slice(1)) as 'Easy' | 'Medium' | 'Hard'
      : undefined,
    servings: post.recipeDetails?.servings,
  };

  return safePost;
}

// SAFE Helper function to convert GraphQL Comment to UI Comment
export function convertCommentForUI(comment: any): CommentWithUI {
  if (!comment) {
    return {
      id: '',
      content: '',
      author: {
        id: '',
        username: 'Unknown',
        fullName: 'Unknown User',
        avatar: '',
        isVerified: false,
        isPrivate: false,
        followers: [],
        following: [],
        savedPosts: [],
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        createdAt: '',
        updatedAt: ''
      },
      post: {} as Post,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: 0,
      repliesList: []
    };
  }

  return {
    id: comment.id || '',
    content: comment.content || '',
    author: comment.author || { 
      id: '', 
      username: 'Unknown', 
      fullName: 'Unknown User',
      avatar: '',
      isVerified: false,
      isPrivate: false,
      followers: [],
      following: [],
      savedPosts: [],
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      createdAt: '',
      updatedAt: ''
    },
    post: comment.post || {} as Post,
    createdAt: comment.createdAt || new Date().toISOString(),
    updatedAt: comment.updatedAt || new Date().toISOString(),
    likes: 0,
    isLiked: false,
    replies: 0,
    repliesList: []
  };
}

// Type guard for Post
export function isPost(obj: any): obj is Post {
  return obj && typeof obj === 'object' && 'id' in obj;
}

// Type guard for PostWithUI
export function isPostWithUI(obj: any): obj is PostWithUI {
  return obj && typeof obj === 'object' && 'id' in obj && 'imageUrl' in obj;
}

export interface GetSavedPostsResponse {
  getSavedPosts: Post[];
}

export interface GetUserResponse {
  getUser: User;
}

export interface GetMeResponse {
  me: User;
}

export interface GetFeedPostsResponse {
  getFeed: Post[];
}