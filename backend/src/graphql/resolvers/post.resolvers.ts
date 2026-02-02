// backend/src/graphql/resolvers/postResolvers.ts
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import PostModel, { IPost, PostType, PostPrivacy } from '../../models/Post.model';
import UserModel, { IUser } from '../../models/User.model';
import CommentModel from '../../models/Comment.model';
import { createLikeNotification } from '../../utils/notifications.utils';
import { Context, LeanPost, PostActionResponse } from '../types';
import { Types } from 'mongoose';
import Post from '../../models/Post.model';
const postResolvers = {
  // ==================== POST FIELD RESOLVERS ====================
  Post: {
    id: (parent: IPost | any) => {
      return parent._id ? parent._id.toString() : parent.id;
    },
    
    // Resolve author field
    author: async (parent: IPost | any) => {
      if (parent.author && typeof parent.author === 'object' && 'username' in parent.author) {
        return parent.author; // Already populated
      }
      const post = await PostModel.findById(parent.id || parent._id)
        .populate('author', 'id username fullName avatar isVerified bio');
      return post?.author;
    },
    
    // Resolve comments count
    commentCount: (parent: IPost | any) => {
      return parent.comments?.length || parent.commentCount || 0;
    },
    
    // Resolve like count
    likeCount: (parent: IPost | any) => {
      return parent.likes?.length || parent.likeCount || 0;
    },
    
    // Resolve save count
    saveCount: (parent: IPost | any) => {
      return parent.saves?.length || parent.saveCount || 0;
    },
    
    // Resolve share count
    shareCount: (parent: IPost | any) => {
      return parent.shares?.length || parent.shareCount || 0;
    },
    
    // Resolve isLiked
    isLiked: async (parent: IPost | any, _: any, { user }: Context) => {
      if (!user) return false;
      const userId = user._id.toString();
      
      if (parent.likes && Array.isArray(parent.likes)) {
        return parent.likes.some((like: any) => 
          like._id?.toString() === userId || like.toString() === userId
        );
      }
      
      const post = await PostModel.findById(parent.id || parent._id);
      return post?.likes?.some((like: any) => 
        like._id?.toString() === userId || like.toString() === userId
      ) || false;
    },
    
    // Resolve isSaved
    isSaved: async (parent: IPost | any, _: any, { user }: Context) => {
      if (!user) return false;
      const userId = user._id.toString();
      
      if (parent.saves && Array.isArray(parent.saves)) {
        return parent.saves.some((save: any) => 
          save._id?.toString() === userId || save.toString() === userId
        );
      }
      
      const post = await PostModel.findById(parent.id || parent._id);
      return post?.saves?.some((save: any) => 
        save._id?.toString() === userId || save.toString() === userId
      ) || false;
    },
    
    // Resolve recipeDetails
    recipeDetails: (parent: IPost | any) => {
      return parent.recipeDetails || null;
    },
    
    // Resolve comments
    comments: async (parent: IPost | any) => {
      if (parent.comments && Array.isArray(parent.comments)) {
        if (parent.comments.length > 0 && parent.comments[0].content) {
          return parent.comments;
        }
      }
      const comments = await CommentModel.find({ post: parent.id || parent._id })
        .populate('author', 'id username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(20);
      
      return comments.map((comment: any) => ({
        ...comment.toObject(),
        id: comment._id.toString(),
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt?.toISOString() || comment.createdAt.toISOString(),
      }));
    },
    
    // Resolve likes
    likes: async (parent: IPost | any) => {
      if (parent.likes && Array.isArray(parent.likes)) {
        if (parent.likes.length > 0 && parent.likes[0].username) {
          return parent.likes;
        }
      }
      const post = await PostModel.findById(parent.id || parent._id)
        .populate('likes', 'id username fullName avatar');
      return post?.likes || [];
    },
    
    // Resolve saves
    saves: async (parent: IPost | any) => {
      if (parent.saves && Array.isArray(parent.saves)) {
        if (parent.saves.length > 0 && parent.saves[0].username) {
          return parent.saves;
        }
      }
      const post = await PostModel.findById(parent.id || parent._id)
        .populate('saves', 'id username fullName avatar');
      return post?.saves || [];
    },
    
    // Format dates
    createdAt: (parent: IPost | any) => {
      if (parent.createdAt instanceof Date) {
        return parent.createdAt.toISOString();
      }
      return parent.createdAt?.toISOString?.() || parent.createdAt;
    },
    
    updatedAt: (parent: IPost | any) => {
      if (parent.updatedAt instanceof Date) {
        return parent.updatedAt.toISOString();
      }
      return parent.updatedAt?.toISOString?.() || parent.updatedAt || parent.createdAt;
    },
  },

  // ==================== QUERIES ====================
  Query: {
    getPost: async (_: any, { id }: { id: string }, { user }: Context) => {
      const post = await PostModel.findById(id)
        .populate('author', 'id username fullName avatar isVerified')
        .populate('likes', 'id username fullName avatar')
        .populate('saves', 'id username fullName avatar')
        .populate('shares', 'id username fullName avatar');

      if (!post) throw new UserInputError('Post not found');

      return {
        ...post.toObject(),
        id: (post._id as Types.ObjectId).toString(),
      };
    },

      getUserPosts: async (_: any, { userId, limit = 20 }: { userId: string; limit: number }) => {
      const posts = await PostModel.find({ author: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author', 'id username fullName avatar isVerified')
        .lean();

      return posts.map((post: any) => ({
        ...post,
        id: post._id.toString(),
        postType: post.postType || 'NORMAL', 
        recipeDetails: post.recipeDetails || null, 
        likeCount: post.likes?.length || 0,
        commentCount: post.comments?.length || 0,
        saveCount: post.saves?.length || 0,
        shareCount: post.shares?.length || 0,
      }));
    },

      



    getFeed: async (_: any, { limit = 20, offset = 0 }: { limit: number; offset: number }, { user }: Context) => {
      const posts = await PostModel.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('author', 'id username fullName avatar isVerified')
        .lean<LeanPost[]>();

      return posts.map((post) => ({
        ...post,
        id: (post._id as Types.ObjectId).toString(),
      }));
    },

getSavedPosts: async (_: any, { limit = 20, offset = 0 }: { limit: number; offset: number }, { user }: Context) => {
  if (!user) throw new AuthenticationError('You must be logged in');

  // Find posts where current user is in the saves array
  const posts = await Post.find({ saves: user._id })
    .populate({
      path: 'author',
      select: 'id username fullName avatar isVerified'
    })
    .skip(offset)
    .limit(limit)
    .lean();

  return posts.map((post: any) => ({
    ...post,
    id: (post._id as Types.ObjectId).toString(),
  }));
},

getLikedPosts: async (_: any, { userId, limit = 20 }: { userId: string; limit: number }) => {
  const posts = await PostModel.find({ likes: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'id username fullName avatar isVerified')
    .lean();

  return posts.map((post: any) => ({
    ...post,
    id: post._id.toString(),
  }));
},


    getTrendingPosts: async (_: any, { limit = 20 }: { limit: number }, { user }: Context) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const posts = await PostModel.find({ createdAt: { $gte: sevenDaysAgo } })
        .sort({ likeCount: -1, commentCount: -1, saveCount: -1, createdAt: -1 })
        .limit(limit)
        .populate('author', 'id username fullName avatar isVerified')
        .lean<LeanPost[]>();

      return posts.map((post) => ({
        ...post,
        id: (post._id as Types.ObjectId).toString(),
      }));
    },

    getFollowingPosts: async (_: any, { limit = 20 }: { limit: number }, { user }: Context) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const currentUser = await UserModel.findById(user._id).select('following');
      const followingIds = currentUser?.following || [];

      if (followingIds.length === 0) return [];

      const posts = await PostModel.find({ author: { $in: followingIds } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author', 'id username fullName avatar isVerified')
        .lean<LeanPost[]>();

      return posts.map((post) => ({
        ...post,
        id: (post._id as Types.ObjectId).toString(),
      }));
    },
  },


getUserRecipes: async (
  _: any,
  { userId, limit = 20 }: { userId: string; limit?: number }
) => {
  try {
    if (!userId) {
      console.error('getUserRecipes: userId is required');
      return []; // RETURN EMPTY ARRAY, NOT NULL
    }

    const posts = await PostModel.find({ 
      author: userId, 
      postType: PostType.RECIPE 
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'id username fullName avatar isVerified')
      .lean();

    console.log('getUserRecipes found:', posts.length, 'posts');

    // ALWAYS return an array, even if empty
    const result = posts.map((post: any) => ({
      ...post,
      id: post._id.toString(),
    }));
    
    console.log('getUserRecipes returning:', result.length, 'items');
    return result;

  } catch (error) {
    console.error('getUserRecipes error:', error);
    return []; // RETURN EMPTY ARRAY ON ERROR TOO
  }
},



  // ==================== MUTATIONS ====================
  Mutation: {
    createPost: async (
      _: any,
      { 
        title, 
        content, 
        images, 
        postType = PostType.NORMAL, 
        privacy = PostPrivacy.PUBLIC, 
        tags = [], 
        location, 
        restaurant, 
        recipeDetails 
      }: any,
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      
      // Validate recipe details for recipe posts
      if (postType === PostType.RECIPE && !recipeDetails) {
        throw new UserInputError("Recipe details are required for recipe posts");
      }
      
      if (postType === PostType.RECIPE && recipeDetails) {
        if (!recipeDetails.ingredients || recipeDetails.ingredients.length === 0) {
          throw new UserInputError("At least one ingredient is required for recipe posts");
        }
        if (!recipeDetails.instructions || recipeDetails.instructions.length === 0) {
          throw new UserInputError("At least one instruction is required for recipe posts");
        }
      }
      
      // Create post data
      const postData: any = {
        title,
        content,
        images,
        postType,
        privacy,
        tags: tags.map((tag: string) => tag.toLowerCase().trim()),
        author: user._id,
      };
      
      // Add optional fields if provided
      if (location) postData.location = location;
      if (restaurant) postData.restaurant = restaurant;
      if (recipeDetails) postData.recipeDetails = recipeDetails;
      
      const post = await PostModel.create(postData);
      
      // Populate author for response
      const populatedPost = await PostModel.findById(post._id)
        .populate('author', 'id username fullName avatar isVerified');
      
      return {
        success: true,
        message: postType === PostType.RECIPE ? "Recipe created successfully" : "Post created successfully",
        post: {
          ...populatedPost?.toObject(),
          id: (post._id as Types.ObjectId).toString(),
        },
      };
    },

    likePost: async (_: any, { postId }: { postId: string }, { user }: Context): Promise<PostActionResponse> => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const post = await PostModel.findById(postId);
      if (!post) throw new UserInputError('Post not found');

      const userId = user._id.toString();
      const alreadyLiked = post.likes.some((l: any) => l.toString() === userId);

      if (alreadyLiked) {
        await PostModel.findByIdAndUpdate(postId, {
          $pull: { likes: user._id },
          $inc: { likeCount: -1 },
        });
      } else {
        await PostModel.findByIdAndUpdate(postId, {
          $addToSet: { likes: user._id },
          $inc: { likeCount: 1 },
        });
        if (post.author.toString() !== userId) {
          await createLikeNotification(userId, postId, post.author.toString());
        }
      }

      const updated = await PostModel.findById(postId);

      return {
        success: true,
        message: alreadyLiked ? 'Post unliked' : 'Post liked',
        post: updated ? {
          ...updated.toObject(),
          id: (updated._id as Types.ObjectId).toString(),
        } : undefined,
      };
    },


        sharePost: async (_: any, { postId }: { postId: string }, { user }: Context) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const post = await Post.findById(postId);
      if (!post) throw new UserInputError('Post not found');

      // Add user to post.shares if not already present
      if (!post.shares.includes(user._id)) {
        post.shares.push(user._id);
        post.shareCount = post.shares.length;
        await post.save();
      }

      return {
        success: true,
        message: 'Post shared successfully',
        post: {
          ...post.toObject(),
          id: (post._id as Types.ObjectId).toString(),
        },
      };
    },

    savePost: async (_: any, { postId }: { postId: string }, { user }: Context): Promise<PostActionResponse> => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const post = await PostModel.findById(postId);
      if (!post) throw new UserInputError('Post not found');

      const userId = user._id.toString();
      const alreadySaved = post.saves.some((s: any) => s.toString() === userId);

      if (alreadySaved) {
        await PostModel.findByIdAndUpdate(postId, {
          $pull: { saves: user._id },
          $inc: { saveCount: -1 },
        });
      } else {
        await PostModel.findByIdAndUpdate(postId, {
          $addToSet: { saves: user._id },
          $inc: { saveCount: 1 },
        });
      }

      const updated = await PostModel.findById(postId);

      return {
        success: true,
        message: alreadySaved ? 'Post unsaved' : 'Post saved',
        post: updated ? {
          ...updated.toObject(),
          id: (updated._id as Types.ObjectId).toString(),
        } : undefined,
      };
    }
  }
};

export default postResolvers;