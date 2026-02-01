// src/graphql/typeDefs/notificationTypeDefs.ts
import { gql } from 'apollo-server-express';

const notificationTypeDefs = gql`
  type Notification {
    id: ID!
    recipient: User!
    sender: User
    type: String!
    message: String!
    isRead: Boolean!
    createdAt: String!
    post: Post
  }

  type NotificationResponse {
    success: Boolean!
    message: String!
    notification: Notification
  }

  extend type Query {
    getNotifications(limit: Int, offset: Int): [Notification] 
  }

  extend type Mutation {
    markNotificationAsRead(notificationId: ID!): NotificationResponse!
    clearNotifications: NotificationResponse!
  }
`;

export default notificationTypeDefs;
