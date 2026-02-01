import { gql } from '@apollo/client';

export const INPUT_TYPES = gql`
  input LoginInput {
    emailOrUsername: String!
    password: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    confirmPassword: String!
    username: String!
    fullName: String!
    dateOfBirth: String
    avatar: String
  }

  input UpdateProfileInput {
    username: String
    fullName: String
    email: String
    bio: String
    website: String
    location: String
    avatar: String
    coverPhoto: String
    dateOfBirth: String
  }

  input CreatePostInput {
    title: String!
    content: String!
    images: [String!]!
    videos: [String!]
    postType: PostType = NORMAL
    privacy: PostPrivacy = PUBLIC
    tags: [String!]
    recipeDetails: RecipeDetailsInput
    location: String
    restaurant: String
  }

  input UpdatePostInput {
    title: String
    content: String
    images: [String!]
    videos: [String!]
    privacy: PostPrivacy
    tags: [String!]
    recipeDetails: RecipeDetailsInput
    location: String
    restaurant: String
  }

  input RecipeDetailsInput {
    ingredients: [String!]!
    instructions: [String!]!
    prepTime: Int
    cookTime: Int
    servings: Int
    difficulty: String
  }
`;