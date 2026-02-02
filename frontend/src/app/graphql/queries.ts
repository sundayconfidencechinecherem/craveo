import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

// SIMPLE User fragment - only fields that definitely exist
export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    username
    email
    fullName
    avatar
    # REMOVED: bio, followerCount, followingCount, postCount, 
    # coverPhoto, website, location, isPrivate, lastLogin, dateOfBirth
    # (Add these back when your backend has them)
  }
`;

// SIMPLE Post fragment - only fields that definitely exist
export const POST_FRAGMENT = gql`
  fragment PostFragment on Post {
    id
    title
    content
    images
    likeCount
    commentCount
    # REMOVED: postType, privacy, tags, saveCount, shareCount, 
    # isLiked, isSaved, updatedAt (Add these back when your backend has them)
    createdAt
    author {
      id
      username
      fullName
      avatar
    }
  }
`;











// ==================== WORKING QUERIES ====================

// Health check
export const HEALTH_CHECK_QUERY = gql`
  query HealthCheck {
    health {
      status
      timestamp
      uptime
    }
  }
`;

// Get current user - SIMPLIFIED
export const GET_ME_QUERY = gql`
  query GetMe {
    me {
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
`;

// Get user by ID or username - SIMPLIFIED
export const GET_USER_QUERY = gql`
  query GetUser($id: ID, $username: String) {
    getUser(id: $id, username: $username) {
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
      savedPosts {
        id
        title
        content
        images
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
          isVerified
        }
      }
    }
  }
`;

// Get feed posts - SIMPLIFIED (THIS IS THE CRITICAL ONE)
// src/app/graphql/queries.ts - UPDATE GET_FEED_POSTS_QUERY
export const GET_FEED_POSTS_QUERY = gql`
  query GetFeedPosts($limit: Int = 20, $offset: Int = 0) {
    getFeed(limit: $limit, offset: $offset) {
      id
      title
      content
      images
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
        isVerified
      }
    }
  }
`;

// Get user posts - SIMPLIFIED
export const GET_USER_POSTS_QUERY = gql`
  query GetUserPosts($userId: ID!, $limit: Int = 10) {
    getUserPosts(userId: $userId, limit: $limit) {
      id
      title
      content
      images
      postType 
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
     recipeDetails {  # ← ADD THIS
    ingredients
    instructions
     prepTime
     cookTime
     servings
     difficulty
      }
    }
  }
`;

// Get single post - SIMPLIFIED
// In src/app/graphql/queries.ts
export const GET_POST_QUERY = gql`
  query GetPost($id: ID!) {
    getPost(id: $id) {
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
      updatedAt
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
        isVerified
      }
      # FIX: Properly fetch comments
      comments {
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
          isVerified
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


// Search users - SIMPLIFIED
export const SEARCH_USERS_QUERY = gql`
  query SearchUsers($query: String!, $limit: Int = 20) {
    searchUsers(query: $query, limit: $limit) {
      id
      username
      fullName
      avatar
    }
  }
`;

// Get followers - SIMPLIFIED
export const GET_FOLLOWERS_QUERY = gql`
  query GetFollowers($userId: ID!, $limit: Int = 20) {
    getFollowers(userId: $userId, limit: $limit) {
      id
      username
      fullName
      avatar
    }
  }
`;

// Get following - SIMPLIFIED
export const GET_FOLLOWING_QUERY = gql`
  query GetFollowing($userId: ID!, $limit: Int = 20) {
    getFollowing(userId: $userId, limit: $limit) {
      id
      username
      fullName
      avatar
    }
  }
`;

// Username availability
export const CHECK_USERNAME_AVAILABILITY_QUERY = gql`
  query CheckUsernameAvailability($username: String!) {
    checkUsernameAvailability(username: $username)
  }
`;

// Email availability
export const CHECK_EMAIL_AVAILABILITY_QUERY = gql`
  query CheckEmailAvailability($email: String!) {
    checkEmailAvailability(email: $email)
  }
`;

// Search posts - SIMPLIFIED
export const SEARCH_POSTS_QUERY = gql`
  query SearchPosts($query: String!, $limit: Int = 20) {
    searchPosts(query: $query, limit: $limit) {
      id
      title
      content
      images
      likeCount
      commentCount
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

// Trending posts - SIMPLIFIED
export const GET_TRENDING_POSTS_QUERY = gql`
  query GetTrendingPosts($limit: Int = 20) {
    getTrendingPosts(limit: $limit) {
      id
      title
      content
      images
      likeCount
      commentCount
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

// Recent posts - SIMPLIFIED
export const GET_RECENT_POSTS_QUERY = gql`
  query GetRecentPosts($limit: Int = 20) {
    getRecentPosts(limit: $limit) {
      id
      title
      content
      images
      likeCount
      commentCount
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

// Following posts - SIMPLIFIED
export const GET_FOLLOWING_POSTS_QUERY = gql`
  query GetFollowingPosts($limit: Int = 20) {
    getFollowingPosts(limit: $limit) {
      id
      title
      content
      images
      likeCount
      commentCount
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

// In src/app/graphql/queries.ts - ADD THIS QUERY
// In src/app/graphql/queries.ts - ADD THIS QUERY
// src/app/graphql/queries.ts - ADD THIS

export const GET_SAVED_POSTS_QUERY = gql`
  query GetSavedPosts($limit: Int = 20, $offset: Int = 0) {
    getSavedPosts(limit: $limit, offset: $offset) {
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
      isEdited
      location
      restaurant
      createdAt
      updatedAt
      author {
        id
        username
        fullName
        avatar
        isVerified
      }
      recipeDetails {
        ingredients
        instructions
        prepTime
        cookTime
        servings
        difficulty
      }
    }
  }
`;


export const GET_NOTIFICATIONS_QUERY = gql`
  query GetNotifications($limit: Int = 20, $offset: Int = 0) {
    getNotifications(limit: $limit, offset: $offset) {
      id
      type
      message
      isRead        
      createdAt
      sender {
        id
        username
        fullName
        avatar
      }
      post {
        id
        title
      }
    }
  }
`;


export const GET_LIKED_POSTS_QUERY = gql`
  query GetLikedPosts($userId: ID!, $limit: Int = 20) {
    getLikedPosts(userId: $userId, limit: $limit) {
      id
      title
      content
      images
      likeCount
      isLiked
      createdAt
      author {
        id
        username
        fullName
        avatar
        isVerified
      }
    }
  }
`;

export const GET_USER_RECIPES_QUERY = gql`
  query GetUserRecipes($userId: ID!, $limit: Int) {
    getUserRecipes(userId: $userId, limit: $limit) {
      id
      title
      content
      postType
      images
      recipeDetails {
        ingredients
        instructions
        prepTime
        cookTime
        servings
        difficulty
      }
    }
  }
`;





// ==================== OPTIONAL: ADVANCED QUERIES ====================
// (Use these when your backend has all the fields)

/*
export const ADVANCED_USER_FRAGMENT = gql`
  fragment AdvancedUserFragment on User {
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
`;

export const ADVANCED_POST_FRAGMENT = gql`
  fragment AdvancedPostFragment on Post {
    id
    title
    content
    images
    videos
    postType
    privacy
    tags
    likeCount
    commentCount
    saveCount
    shareCount
    isLiked
    isSaved
    isEdited
    createdAt
    updatedAt
    location
    restaurant
    recipeDetails {
      ingredients
      instructions
      prepTime
      cookTime
      servings
      difficulty
    }
    author {
      ...AdvancedUserFragment
    }
    likes {
      ...AdvancedUserFragment
    }
    saves {
      ...AdvancedUserFragment
    }
    shares {
      ...AdvancedUserFragment
    }
    comments {
      id
      content
      createdAt
      updatedAt
      author {
        ...AdvancedUserFragment
      }
    }
  }
  ${ADVANCED_USER_FRAGMENT}
`;
*/