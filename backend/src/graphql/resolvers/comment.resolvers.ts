import { AuthenticationError, UserInputError } from 'apollo-server-express';
import CommentModel, { IComment } from '../../models/Comment.model';
import { Context } from '../types';
import { Types } from 'mongoose';
import UserModel from '../../models/User.model';

// Type guard to check if author is populated
function isAuthorPopulated(author: any): author is {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  avatar?: string;
  isVerified?: boolean;
} {
  return author && typeof author === 'object' && 'username' in author;
}

const commentResolvers = {
  Comment: {
    id: (parent: IComment) => parent._id ? String(parent._id) : parent.id,
    postId: (parent: IComment) => String(parent.post),
    replies: async (parent: IComment) => {
      const replyIds = parent.replies ?? [];
      if (replyIds.length === 0) return [];
      
      const replies = await CommentModel.find({ _id: { $in: replyIds } })
        .populate('author', 'username fullName avatar isVerified')
        .lean();
      
      return replies.map((r: any) => ({
        id: String(r._id),
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        author: {
          id: String(r.author._id),
          username: r.author.username,
          fullName: r.author.fullName,
          avatar: r.author.avatar || '',
          isVerified: r.author.isVerified || false
        }
      }));
    },
  },

  Query: {
    getComments: async (_: any, { postId, limit = 20 }: { postId: string; limit?: number }) => {
      const comments = await CommentModel.find({ post: postId })
        .populate('author', 'username fullName avatar isVerified')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return comments.map((c: any) => {
        const author = c.author;
        
        // Ensure author data exists
        if (!isAuthorPopulated(author)) {
          throw new Error('Author not populated properly');
        }

        return {
          id: String(c._id),
          postId: String(c.post),
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt?.toISOString() || c.createdAt.toISOString(),
          author: {
            id: String(author._id),
            username: author.username,
            fullName: author.fullName,
            avatar: author.avatar || '',
            isVerified: author.isVerified || false
          },
          replies: []
        };
      });
    },
  },

  Mutation: {
    addComment: async (
      _: any,
      { postId, content, parentCommentId }: { postId: string; content: string; parentCommentId?: string },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      // Get user data first
      const userData = await UserModel.findById(user._id);
      if (!userData) throw new AuthenticationError('User not found');

      const comment = await CommentModel.create({
        post: postId,
        author: user._id,
        content,
      });

      if (parentCommentId) {
        const parent = await CommentModel.findById(parentCommentId);
        if (!parent) throw new UserInputError('Parent comment not found');
        parent.replies = parent.replies ?? [];
        parent.replies.push(comment._id as Types.ObjectId);
        await parent.save();
      }

      // Get the post ID properly - it should be string, not "undefined"
      const commentPostId = comment.post ? String(comment.post) : postId;

      // Return the comment with author data
      return {
        success: true,
        message: 'Comment added',
        comment: {
          id: String(comment._id),
          postId: commentPostId, // Fixed: Use properly extracted postId
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt?.toISOString() || comment.createdAt.toISOString(),
          author: {
            id: String(userData._id),
            username: userData.username,
            fullName: userData.fullName,
            avatar: userData.avatar || '',
            isVerified: userData.isVerified || false
          },
          replies: []
        },
      };
    },

    deleteComment: async (_: any, { commentId }: { commentId: string }, { user }: Context) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const comment = await CommentModel.findById(commentId)
        .populate('author', 'username fullName avatar isVerified');

      if (!comment) throw new UserInputError('Comment not found');

      // Check if author is populated
      if (!isAuthorPopulated(comment.author)) {
        throw new Error('Author not populated properly');
      }

      if (String(comment.author._id) !== String(user._id)) {
        throw new AuthenticationError('You can only delete your own comments');
      }

      await comment.deleteOne();

      return {
        success: true,
        message: 'Comment deleted',
        comment: {
          id: String(comment._id),
          postId: String(comment.post),
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt?.toISOString() || comment.createdAt.toISOString(),
          author: {
            id: String(comment.author._id),
            username: comment.author.username,
            fullName: comment.author.fullName,
            avatar: comment.author.avatar || '',
            isVerified: comment.author.isVerified || false
          },
          replies: []
        },
      };
    },
  },
};

export default commentResolvers;