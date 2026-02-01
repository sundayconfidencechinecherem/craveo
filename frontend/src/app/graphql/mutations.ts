import { gql } from '@apollo/client';

// ==================== AUTH MUTATIONS ====================

export const LOGIN_MUTATION = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(identifier: $identifier, password: $password) {
      success
      message
      accessToken
      refreshToken
      user {
        id
        username
        email
        fullName
        avatar
        bio
        coverPhoto
        website
        location
        isVerified
        isPrivate
        lastLogin
        dateOfBirth
        followerCount
        followingCount
        postCount
        createdAt
        updatedAt
        followers {
          id
          username
          fullName
          avatar
        }
        following {
          id
          username
          fullName
          avatar
        }
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register(
    $username: String!
    $email: String!
    $fullName: String!
    $password: String!
    $confirmPassword: String!
    $dateOfBirth: String
    $bio: String
    $website: String
    $location: String
    $avatar: String
  ) {
    signup(
      username: $username
      email: $email
      fullName: $fullName
      password: $password
      confirmPassword: $confirmPassword
      dateOfBirth: $dateOfBirth
      bio: $bio
      website: $website
      location: $location
      avatar: $avatar
    ) {
      success
      message
      accessToken
      refreshToken
      user {
        id
        username
        email
        fullName
        avatar
        bio
        coverPhoto
        website
        location
        isVerified
        isPrivate
        lastLogin
        dateOfBirth
        followerCount
        followingCount
        postCount
        createdAt
        updatedAt
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

// src/app/graphql/mutations.ts - Add this if not present
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      success
      message
      accessToken
      refreshToken
      user {
        id
        username
        email
        fullName
        avatar
        bio
        coverPhoto
        website
        location
        isVerified
        isPrivate
        lastLogin
        dateOfBirth
        followerCount
        followingCount
        postCount
        createdAt
        updatedAt
      }
    }
  }
`;

// ==================== USER MUTATIONS ====================

export const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      success
      message
    }
  }
`;

export const UNFOLLOW_USER_MUTATION = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      success
      message
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile(
    $username: String
    $fullName: String
    $email: String
    $avatar: String
    $dateOfBirth: String
    $bio: String
    $website: String
    $location: String
    $coverPhoto: String
    $isPrivate: Boolean
  ) {
    updateProfile(
      username: $username
      fullName: $fullName
      email: $email
      avatar: $avatar
      dateOfBirth: $dateOfBirth
      bio: $bio
      website: $website
      location: $location
      coverPhoto: $coverPhoto
      isPrivate: $isPrivate
    ) {
      success
      message
      user {
        id
        username
        email
        fullName
        avatar
        bio
        coverPhoto
        website
        location
        isVerified
        isPrivate
        lastLogin
        dateOfBirth
        followerCount
        followingCount
        postCount
        createdAt
        updatedAt
      }
    }
  }
`;

// ==================== POST MUTATIONS ====================

// In your mutations.ts - VERIFY CREATE_POST_MUTATION
export const CREATE_POST_MUTATION = gql`
  mutation CreatePost(
    $title: String!
    $content: String!
    $images: [String!]!
    $postType: String = "NORMAL"
    $privacy: String = "PUBLIC"
    $tags: [String]
    $location: String
    $restaurant: String
    $recipeDetails: RecipeDetailsInput
  ) {
    createPost(
      title: $title
      content: $content
      images: $images
      postType: $postType
      privacy: $privacy
      tags: $tags
      location: $location
      restaurant: $restaurant
      recipeDetails: $recipeDetails
    ) {
      success
      message
      post {
        id
        title
        content
        images
        postType
        privacy
        tags
        location
        restaurant
        likeCount
        commentCount
        saveCount
        shareCount
        isLiked
        isSaved
        createdAt
        recipeDetails {
          ingredients
          instructions
          prepTime
          cookTime
          servings
          difficulty
        }
        author {
          id
          username
          fullName
          avatar
        }
      }
    }
  }
`;

export const RECIPE_DETAILS_INPUT = gql`
  input RecipeDetailsInput {
    ingredients: [String]!
    instructions: [String]!
    prepTime: Int
    cookTime: Int
    servings: Int
    difficulty: String
  }
`;

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost(
    $id: ID!
    $title: String
    $content: String
    $images: [String]
    $privacy: String
    $tags: [String]
  ) {
    updatePost(
      id: $id
      title: $title
      content: $content
      images: $images
      privacy: $privacy
      tags: $tags
    ) {
      success
      message
      post {
        id
        title
        content
        images
        postType
        privacy
        tags
        likeCount
        commentCount
        saveCount
        shareCount
        isLiked
        isSaved
        createdAt
        author {
          id
          username
          fullName
          avatar
        }
      }
    }
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      success
      message
    }
  }
`;

// src/app/graphql/mutations.ts - UPDATE THE LIKE/UNLIKE MUTATIONS
export const LIKE_POST_MUTATION = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      success
      message
      post {
        id
        isLiked
        likeCount
      }
    }
  }
`;


export const SAVE_POST_MUTATION = gql`
  mutation SavePost($postId: ID!) {
    savePost(postId: $postId) {
      success
      message
      post {
        id
        saveCount
        isSaved
      }
    }
  }
`;

export const SHARE_POST_MUTATION = gql`
  mutation SharePost($postId: ID!) {
    sharePost(postId: $postId) {
      success
      message
      post {
        id
        shareCount
      }
    }
  }
`;

// ==================== COMMENT MUTATIONS ====================

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    postId   
    content
    createdAt
    updatedAt
    author {
      id
      username
      fullName
      avatar
    }
    replies {
      id
      content
      createdAt
      author {
        id
        username
        fullName
        avatar
      }
    }
  }
`;


export const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($postId: ID!, $content: String!, $parentCommentId: ID) {
    addComment(postId: $postId, content: $content, parentCommentId: $parentCommentId) {
      success
      message
      comment {
        id
        postId
        content
        createdAt
        updatedAt
        author {
          id
          username
          fullName
          avatar
        }
        replies {
          id
          content
          createdAt
          author {
            id
            username
            fullName
            avatar
          }
        }
      }
    }
  }
`;



export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      success
      message
      comment {
        ...CommentFragment
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      success
      message
      comment { id }
    }
  }
`;


export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;


export const UPLOAD_IMAGE_MUTATION = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
      success
      message
      url
    }
  }
`;

export const UPLOAD_MULTIPLE_IMAGES_MUTATION = gql`
  mutation UploadMultipleImages($files: [Upload!]!) {
    uploadMultipleImages(files: $files) {
      success
      message
      urls
    }
  }
`;