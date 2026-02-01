import userResolvers from './user.resolvers';
import postResolvers from './post.resolvers';
import commentResolvers from './comment.resolvers';
import notificationResolvers from './notification.resolvers';

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...notificationResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...notificationResolvers.Mutation,
  },
  User: userResolvers.User,
  Post: postResolvers.Post,
  Comment: commentResolvers.Comment,
  Notification: notificationResolvers.Notification,
};

export default resolvers;