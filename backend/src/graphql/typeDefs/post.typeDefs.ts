import { gql } from 'apollo-server-express';

const postTypeDefs = gql`
  type Post {
    id: ID!
    title: String!
    author: User!
    content: String!
    images: [String]!
    videos: [String]
    postType: String!
    privacy: String!
    tags: [String]
    likes: [User]
    saves: [User]
    shares: [User]
    comments: [Comment]
    isLiked: Boolean
    isSaved: Boolean
    likeCount: Int
    saveCount: Int
    shareCount: Int
    commentCount: Int
    isEdited: Boolean
    location: String
    restaurant: String
    recipeDetails: RecipeDetails
    createdAt: String!
    updatedAt: String
  }

  type RecipeDetails {
    ingredients: [String]!
    instructions: [String]!
    prepTime: Int
    cookTime: Int
    servings: Int
    difficulty: String
  }

  input RecipeDetailsInput {
    ingredients: [String]!
    instructions: [String]!
    prepTime: Int
    cookTime: Int
    servings: Int
    difficulty: String
  }

  type PostActionResponse {
    success: Boolean!
    message: String!
    post: Post
  }

  type Query {
    getPost(id: ID!): Post
    getFeed(limit: Int, offset: Int): [Post]
    getTrendingPosts(limit: Int): [Post]
    getFollowingPosts(limit: Int): [Post]
    getSavedPosts(limit: Int, offset: Int): [Post]
  }

  extend type Mutation {
    createPost(
      title: String!
      content: String!
      images: [String!]!
      postType: String = "NORMAL"
      privacy: String = "PUBLIC"
      tags: [String]
      location: String
      restaurant: String
      recipeDetails: RecipeDetailsInput
    ): PostActionResponse!
    likePost(postId: ID!): PostActionResponse!
    savePost(postId: ID!): PostActionResponse!
    sharePost(postId: ID!): PostActionResponse!
  }
`;

export default postTypeDefs;
