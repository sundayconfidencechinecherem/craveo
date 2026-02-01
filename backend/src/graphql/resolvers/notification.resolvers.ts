// src/graphql/resolvers/notificationResolvers.ts
import { AuthenticationError } from 'apollo-server-express';
import NotificationModel, { INotification } from '../../models/Notification.model';
import PostModel from '../../models/Post.model';   // ✅ import PostModel
import { Context } from '../types';
import { Types } from 'mongoose';

const notificationResolvers = {
  Notification: {
    id: (parent: INotification) => {
      return parent._id ? parent._id.toString() : parent.id;
    },
    post: async (parent: INotification) => {
      if (!parent.post) return null;
      return await PostModel.findById(parent.post);
    },
  },

  Query: {
    getNotifications: async (_: any, { limit = 20, offset = 0 }, { user }: Context) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      const notifications = await NotificationModel.find({ recipient: user._id })
        .populate('sender')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean<INotification[]>();

      return notifications.map((n) => ({
        ...n,
        id: (n._id as Types.ObjectId).toString(),
        createdAt: n.createdAt.toISOString(),
      }));
    },
  },

  Mutation: {
    markNotificationAsRead: async (_: any, { notificationId }: { notificationId: string }, { user }: Context) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      const notification = await NotificationModel.findById(notificationId);
      if (!notification) throw new Error('Notification not found');

      notification.isRead = true;
      await notification.save();

      return {
        success: true,
        message: 'Notification marked as read',
        notification: {
          ...notification.toObject(),
          id: (notification._id as Types.ObjectId).toString(),
        },
      };
    },
    
    clearNotifications: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      await NotificationModel.deleteMany({ recipient: user._id });

      return { success: true, message: 'Notifications cleared' };
    },
  },
};

export default notificationResolvers;
