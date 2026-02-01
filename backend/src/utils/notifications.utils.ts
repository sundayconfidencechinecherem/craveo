import NotificationModel, { NotificationType } from '../models/Notification.model';
import UserModel from '../models/User.model';

interface CreateNotificationParams {
  type: NotificationType;
  senderId: string;
  receiverId: string;
  postId?: string;
  commentId?: string;
  message: string;
}

export const createNotification = async ({
  type,
  senderId,
  receiverId,
  postId,
  commentId,
  message,
}: CreateNotificationParams) => {
  try {
    if (senderId === receiverId) return null;

    const notification = await NotificationModel.create({
      type,
      sender: senderId,
      recipient: receiverId, // corrected field name
      post: postId,
      comment: commentId,
      message,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

export const createFollowNotification = async (followerId: string, followingId: string) => {
  try {
    const follower = await UserModel.findById(followerId).select('username fullName');
    if (!follower) return null;

    return await createNotification({
      type: NotificationType.FOLLOW,
      senderId: followerId,
      receiverId: followingId,
      message: `${follower.username} started following you`,
    });
  } catch (error) {
    console.error('Error creating follow notification:', error);
    return null;
  }
};

export const createLikeNotification = async (likerId: string, postId: string, postAuthorId: string) => {
  try {
    const liker = await UserModel.findById(likerId).select('username fullName');
    if (!liker) return null;

    return await createNotification({
      type: NotificationType.LIKE,
      senderId: likerId,
      receiverId: postAuthorId,
      postId,
      message: `${liker.username} liked your post`,
    });
  } catch (error) {
    console.error('Error creating like notification:', error);
    return null;
  }
};

export const createCommentNotification = async (
  commenterId: string,
  postId: string,
  commentId: string,
  postAuthorId: string
) => {
  try {
    const commenter = await UserModel.findById(commenterId).select('username fullName');
    if (!commenter) return null;

    return await createNotification({
      type: NotificationType.COMMENT,
      senderId: commenterId,
      receiverId: postAuthorId,
      postId,
      commentId,
      message: `${commenter.username} commented on your post`,
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
    return null;
  }
};

export const createMentionNotification = async (
  mentionedUserId: string,
  mentionerId: string,
  postId?: string,
  commentId?: string
) => {
  try {
    const mentioner = await UserModel.findById(mentionerId).select('username fullName');
    if (!mentioner) return null;

    return await createNotification({
      type: NotificationType.MENTION,
      senderId: mentionerId,
      receiverId: mentionedUserId,
      postId,
      commentId,
      message: `${mentioner.username} mentioned you`,
    });
  } catch (error) {
    console.error('Error creating mention notification:', error);
    return null;
  }
};
