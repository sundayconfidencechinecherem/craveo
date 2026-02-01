// src/app/types/post.ts
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  name?: string; // Add name as optional for backward compatibility
  avatar: string;
  bio?: string;
  isVerified: boolean;
  followers: number;
  following: number;
  posts: number;
  createdAt: Date | string;
}

export type PrivacySetting = 'public' | 'friends' | 'private';

// Unified Post interface that handles both content and recipe posts
export interface Post {
  id: string;
  user: User;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date | string;
  tags: string[];
  
  // Basic post properties (for both content and recipe posts)
  location?: string;
  cuisine?: string;
  prepTime?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  calories?: number;
  servings?: number;
  
  // New properties for enhanced features
  privacy?: PrivacySetting;
  music?: string;
  title?: string;
  
  // Type indicator for distinguishing between content and recipe
  type?: 'content' | 'recipe';
  
  // Recipe-specific properties (only present for recipe posts)
  recipeCategory?: string;
  ingredients?: string[];
  instructions?: string[];
}

// Helper type guards
export function isRecipePost(post: Post): boolean {
  return post.type === 'recipe' || 
         (!!post.cuisine && !!post.prepTime && !!post.difficulty && !!post.servings);
}

export function isContentPost(post: Post): boolean {
  return !isRecipePost(post);
}

// For backward compatibility, export old types as aliases
export type { User as PostUser, Post as PostType };