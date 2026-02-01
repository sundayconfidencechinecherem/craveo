import { gql } from 'apollo-server-express';

const userTypeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    fullName: String!
    dateOfBirth: String
    avatar: String
    bio: String
    coverPhoto: String
    website: String
    location: String
    isVerified: Boolean
    isPrivate: Boolean
    lastLogin: String
    createdAt: String!
    updatedAt: String
    savedPosts: [Post]
    followers: [User]
    following: [User]
    followerCount: Int
    followingCount: Int
    postCount: Int
  }

  type AuthResponse {
    success: Boolean!
    message: String!
    accessToken: String
    refreshToken: String
    user: User
  }

  type ActionResponse {
    success: Boolean!
    message: String!
  }

  extend type Query {
    me: User
    getUser(id: ID!): User
    searchUsers(query: String!, limit: Int = 20): [User]
  }

  extend type Mutation {
    signup(
      username: String!
      email: String!
      fullName: String!
      password: String!
      confirmPassword: String!
      dateOfBirth: String
      bio: String
      website: String
      location: String
      avatar: String
    ): AuthResponse!

    login(identifier: String!, password: String!): AuthResponse!

    refreshToken(token: String!): AuthResponse!

    followUser(userId: ID!): ActionResponse!
    unfollowUser(userId: ID!): ActionResponse!
    
    updateProfile(
      username: String
      fullName: String
      email: String
      bio: String
      website: String
      location: String
      avatar: String
      coverPhoto: String
      isPrivate: Boolean
      dateOfBirth: String
    ): AuthResponse!
  }
`;

export default userTypeDefs;