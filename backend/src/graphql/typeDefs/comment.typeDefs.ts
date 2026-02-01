import { gql } from 'apollo-server-express';

const commentTypeDefs = gql`
  type Comment {
    id: ID!
    postId: ID!
    author: User!
    content: String!
    replies: [Comment]
    createdAt: String!
    updatedAt: String
  }

  type CommentResponse {
    success: Boolean!
    message: String!
    comment: Comment
  }

  extend type Query {
    getComments(postId: ID!, limit: Int): [Comment]
  }

  extend type Mutation {
    addComment(postId: ID!, content: String!, parentCommentId: ID): CommentResponse!
    deleteComment(commentId: ID!): CommentResponse!
  }
`;

export default commentTypeDefs;
