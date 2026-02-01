import { gql } from 'apollo-server-express';
import userTypeDefs from './user.typeDefs';
import postTypeDefs from './post.typeDefs';
import commentTypeDefs from './comment.typeDefs';
import notificationTypeDefs from './notification.typeDefs';

const baseTypeDefs = gql`
  type Query
  type Mutation
`;

const typeDefs = [
  baseTypeDefs,
  userTypeDefs,
  postTypeDefs,
  commentTypeDefs,
  notificationTypeDefs
];

export default typeDefs;
