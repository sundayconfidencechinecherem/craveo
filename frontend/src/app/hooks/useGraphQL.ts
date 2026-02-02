// src/app/hooks/useGraphQL.ts - COMPLETE FIXED VERSION WITH PROPER TYPES
'use client';

import { useQuery, useMutation, gql, Reference, StoreObject } from '@apollo/client';
import { apolloClient } from '@/app/services/apollo-client';
import { useEffect } from 'react';

// Import all your existing queries
import {
  GET_ME_QUERY,
  GET_FEED_POSTS_QUERY,
  GET_USER_POSTS_QUERY,
  GET_USER_QUERY,
  GET_POST_QUERY,
  GET_FOLLOWERS_QUERY,
  GET_FOLLOWING_QUERY,
  SEARCH_USERS_QUERY,
  GET_SAVED_POSTS_QUERY,
  GET_TRENDING_POSTS_QUERY,
  GET_RECENT_POSTS_QUERY,
  SEARCH_POSTS_QUERY,
  GET_FOLLOWING_POSTS_QUERY,
  HEALTH_CHECK_QUERY,
  CHECK_USERNAME_AVAILABILITY_QUERY,
  CHECK_EMAIL_AVAILABILITY_QUERY,
  GET_NOTIFICATIONS_QUERY,
  GET_LIKED_POSTS_QUERY,
  GET_USER_RECIPES_QUERY
} from '@/app/graphql/queries';

import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
  UPDATE_PROFILE_MUTATION,
  CREATE_POST_MUTATION,
  LIKE_POST_MUTATION,
  FOLLOW_USER_MUTATION,
  SAVE_POST_MUTATION,
  ADD_COMMENT_MUTATION,
  DELETE_POST_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  DELETE_COMMENT_MUTATION,
  UPDATE_COMMENT_MUTATION,
  SHARE_POST_MUTATION,
  UNFOLLOW_USER_MUTATION,
  UPLOAD_IMAGE_MUTATION,
  UPLOAD_MULTIPLE_IMAGES_MUTATION
} from '@/app/graphql/mutations';

// ==================== AUTH HOOKS ====================

export const useCurrentUser = () => {
  const { data, loading, error, refetch } = useQuery(GET_ME_QUERY, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching current user:', error.message);
    }
  }, [error]);

  return {
    user: data?.me || null,
    loading,
    error,
    refetch,
  };
};

export const useLogin = () => {
  const [mutate, { loading, error }] = useMutation(LOGIN_MUTATION);
  
  const login = async (identifier: string, password: string) => {
    return mutate({ variables: { identifier, password } });
  };
  
  return { login, loading, error };
};

export const useRegister = () => {
  const [mutate, { loading, error }] = useMutation(REGISTER_MUTATION);
  
  const register = async (variables: { 
    username: string;
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    dateOfBirth?: string;
    avatar?: string;
    bio?: string;
    website?: string;
    location?: string;
  }) => {
    return mutate({ variables });
  };
  
  return { register, loading, error };
};

export const useLogout = () => {
  const [mutate, { loading, error }] = useMutation(LOGOUT_MUTATION);
  
  const logout = async () => {
    return mutate();
  };
  
  return { logout, loading, error };
};

// ==================== POST HOOKS ====================

export const useFeedPosts = (limit = 20, offset = 0) => {
  const { data, loading, error, fetchMore } = useQuery(GET_FEED_POSTS_QUERY, {
    variables: { limit, offset },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching feed posts:', error.message);
    }
  }, [error]);

  const loadMore = async () => {
    if (fetchMore) {
      try {
        await fetchMore({
          variables: {
            offset: data?.getFeed?.length || 0,
            limit,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              getFeed: [...prev.getFeed, ...fetchMoreResult.getFeed],
            };
          },
        });
      } catch (err) {
        //console.error('Error loading more posts:', err);
      }
    }
  };

  return {
    posts: data?.getFeed || [],
    loading,
    error,
    loadMore,
    hasMore: data?.getFeed ? data.getFeed.length >= limit : false,
  };
};

export const useSavedPosts = (limit = 20, offset = 0) => {
  const { data, loading, error, refetch } = useQuery(GET_SAVED_POSTS_QUERY, {
    variables: { limit, offset },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching saved posts:', error.message);
    }
  }, [error]);

  return {
    posts: data?.getSavedPosts || [],
    loading,
    error,
    refetch,
  };
};

export const useUserPosts = (userId: string, limit = 10) => {
  const { data, loading, error, refetch } = useQuery(GET_USER_POSTS_QUERY, {
    variables: { userId, limit },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching user posts:', error.message);
    }
  }, [error]);

  return {
    posts: data?.getUserPosts || [],
    loading,
    error,
    refetch,
  };
};

export const useGetPost = (postId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_POST_QUERY, {
    variables: { id: postId },
    skip: !postId,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching post:', error.message);
    }
  }, [error]);

  return {
    post: data?.getPost || null,
    loading,
    error,
    refetch,
  };
};

export const useCreatePost = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_POST_MUTATION, {
    update: (cache, { data }) => {
      if (data?.createPost?.post) {
        // Invalidate the feed query to refetch
        cache.evict({ fieldName: 'getFeed' });
        cache.gc();
      }
    },
  });
  
  const createPost = async (variables: { 
    title: string;
    content: string;
    images: string[];
    postType?: string;
    privacy?: string;
    tags?: string[];
    location?: string;
    restaurant?: string;
    recipeDetails?: {
      ingredients: string[];
      instructions: string[];
      prepTime?: number;
      cookTime?: number;
      servings?: number;
      difficulty?: string;
    };
  }) => {
    return mutate({ variables });
  };
  
  return { createPost, loading, error };
};

export const useDeletePost = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_POST_MUTATION, {
    update: (cache, { data }) => {
      if (data?.deletePost?.success) {
        const postId = data.deletePost.postId;
        
        // Invalidate all post queries
        cache.evict({ fieldName: 'getFeed' });
        cache.evict({ fieldName: 'getUserPosts' });
        cache.evict({ fieldName: 'getSavedPosts' });
        
        // Evict the specific post from cache
        cache.evict({ id: `Post:${postId}` });
        cache.gc();
      }
    },
  });
  
  const deletePost = async (id: string) => {
    return mutate({ variables: { id } });
  };
  
  return { deletePost, loading, error };
};

// ==================== POST INTERACTION HOOKS ====================

export const useLikePost = () => {
  const [mutate, { loading, error }] = useMutation(LIKE_POST_MUTATION, {
    optimisticResponse: (variables) => ({
      likePost: {
        __typename: "Post",
        id: variables.postId,
        isLiked: true,
        likeCount: 1, // Will be incremented on server
      }
    }),
    update: (cache, { data }) => {
      if (!data?.likePost?.post) return;
      
      const postId = data.likePost.post.id;
      const isLiked = data.likePost.post.isLiked;
      const likeCount = data.likePost.post.likeCount;
      
      try {
        // Update the post in cache
        cache.modify({
          id: cache.identify({ __typename: 'Post', id: postId }),
          fields: {
            isLiked: () => isLiked,
            likeCount: () => likeCount,
          },
        });
      } catch (cacheError) {
        //console.error('Cache update error:', cacheError);
      }
    },
  });
  
  const likePost = async (postId: string) => {
    return mutate({ 
      variables: { postId } 
    });
  };
  
  return { likePost, loading, error };
};




export const useSavePost = () => {
  const [mutate, { loading, error }] = useMutation(SAVE_POST_MUTATION, {
    update: (cache, { data }) => {
      if (data?.savePost?.post) {
        const postId = data.savePost.post.id;
        const isSaved = data.savePost.post.isSaved;
        const saveCount = data.savePost.post.saveCount;
        
        // Update the post's saved status in cache
        cache.modify({
          id: cache.identify({ __typename: 'Post', id: postId }),
          fields: {
            isSaved: () => isSaved,
            saveCount: () => saveCount,
          },
        });
        
        // Invalidate saved posts query
        if (isSaved) {
          cache.evict({ fieldName: 'getSavedPosts' });
        }
      }
    },
  });
  
  const savePost = async (postId: string) => {
    return mutate({ variables: { postId } });
  };
  
  return { savePost, loading, error };
};

export const useSharePost = () => {
  const [mutate, { loading, error }] = useMutation(SHARE_POST_MUTATION, {
    update: (cache, { data }) => {
      if (data?.sharePost?.post) {
        const postId = data.sharePost.post.id;
        const shareCount = data.sharePost.post.shareCount;
        
        // Update shares count in cache
        cache.modify({
          id: cache.identify({ __typename: 'Post', id: postId }),
          fields: {
            shareCount: () => shareCount,
          },
        });
      }
    },
  });
  
  const sharePost = async (postId: string) => {
    const { data } = await mutate({ variables: { postId } });
    return data?.sharePost;
  };
  
  return { sharePost, loading, error };
};

// ==================== NOTIFICATION HOOKS ====================

const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationAsRead(notificationId: $notificationId) {
      success
      message
      notification {
        id
        isRead
      }
    }
  }
`;

export const useNotifications = (limit = 20, offset = 0) => {
  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS_QUERY, {
    variables: { limit, offset },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching notifications:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError
      });
    }
  }, [error]);

  return {
    notifications: data?.getNotifications || [],
    loading,
    error,
    refetch,
  };
};

export const useMarkNotificationRead = () => {
  const [mutate, { loading, error }] = useMutation(MARK_NOTIFICATION_READ_MUTATION, {
    update: (cache, { data }) => {
      if (data?.markNotificationAsRead?.notification) {
        const notificationId = data.markNotificationAsRead.notification.id;
        
        // Update notification in cache
        cache.modify({
          id: cache.identify({ __typename: 'Notification', id: notificationId }),
          fields: {
            isRead: () => true,
          },
        });
      }
    },
  });

  const markNotificationRead = async (notificationId: string) => {
    try {
      return await mutate({ 
        variables: { notificationId }
      });
    } catch (err) {
     //console.error('Failed to mark notification as read:', err);
      throw err;
    }
  };

  return {
    markNotificationRead,
    loading,
    error,
  };
};

// ==================== USER HOOKS ====================

export const useGetUser = (id?: string, username?: string) => {
  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { id, username },
    skip: !id && !username,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching user:', error.message);
    }
  }, [error]);

  return {
    user: data?.getUser || null,
    loading,
    error,
  };
};

export const useSearchUsers = (query: string, limit = 20) => {
  const { data, loading, error } = useQuery(SEARCH_USERS_QUERY, {
    variables: { query, limit },
    skip: !query,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error searching users:', error.message);
    }
  }, [error]);

  return {
    users: data?.searchUsers || [],
    loading,
    error,
  };
};

export const useGetFollowers = (userId: string, limit = 20) => {
  const { data, loading, error } = useQuery(GET_FOLLOWERS_QUERY, {
    variables: { userId, limit },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching followers:', error.message);
    }
  }, [error]);

  return {
    followers: data?.getFollowers || [],
    loading,
    error,
  };
};

export const useGetFollowing = (userId: string, limit = 20) => {
  const { data, loading, error } = useQuery(GET_FOLLOWING_QUERY, {
    variables: { userId, limit },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching following:', error.message);
    }
  }, [error]);

  return {
    following: data?.getFollowing || [],
    loading,
    error,
  };
};

// ==================== COMMENT HOOKS ====================

// Comments query
const GET_COMMENTS_QUERY = gql`
  query GetComments($postId: ID!, $limit: Int = 20) {
    getComments(postId: $postId, limit: $limit) {
      id
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
`;

export const useGetComments = (postId: string, limit = 20) => {
  const { data, loading, error, refetch } = useQuery(GET_COMMENTS_QUERY, {
    variables: { postId, limit },
    skip: !postId,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching comments:', error.message);
    }
  }, [error]);

  return {
    comments: data?.getComments || [],
    loading,
    error,
    refetch,
  };
};

// In your useAddComment hook
export const useAddComment = () => {
  const [mutate, { loading, error }] = useMutation(ADD_COMMENT_MUTATION, {
    update: (cache, { data }) => {
      const newComment = data?.addComment?.comment;
      if (!newComment) return;

      const postId = newComment.postId;

      // Read the existing comments from cache
      try {
        const existingComments = cache.readQuery<{ getComments: any[] }>({
          query: GET_COMMENTS_QUERY,
          variables: { postId, limit: 20 },
        });

        // Update cache with the new comment
        if (existingComments) {
          cache.writeQuery({
            query: GET_COMMENTS_QUERY,
            variables: { postId, limit: 20 },
            data: {
              getComments: [newComment, ...existingComments.getComments],
            },
          });
        }
      } catch {
        // If the query doesn't exist in cache, we don't need to do anything
        // The component will refetch when it remounts or re-renders
      }

      // Update the post's comment count
      cache.modify({
        id: cache.identify({ __typename: 'Post', id: postId }),
        fields: {
          commentCount: (existing: number = 0) => existing + 1,
        },
      });
    },
  });

  const addComment = async (postId: string, content: string) => {
    return mutate({ 
      variables: { postId, content },
      optimisticResponse: {
        addComment: {
          __typename: "CommentResponse",
          success: true,
          message: "Comment added",
          comment: {
            __typename: "Comment",
            id: `temp-${Date.now()}`,
            postId,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: {
              __typename: "User",
              id: "temp-author",
              username: "You",
              fullName: "You",
              avatar: "",
            },
            replies: [],
          },
        },
      },
    });
  };

  return { addComment, loading, error };
};




export const useUpdateComment = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_COMMENT_MUTATION, {
    update: (cache, { data }) => {
      if (data?.updateComment?.comment) {
        const updatedComment = data.updateComment.comment;
        
        // Update the comment in cache
        cache.modify({
          id: cache.identify({ __typename: 'Comment', id: updatedComment.id }),
          fields: {
            content: () => updatedComment.content,
            updatedAt: () => updatedComment.updatedAt,
          },
        });
      }
    },
  });
  
  const updateComment = async (id: string, content: string) => {
    return mutate({ variables: { id, content } });
  };
  
  return { updateComment, loading, error };
};

export const useDeleteComment = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_COMMENT_MUTATION, {
    update: (cache, { data }) => {
      if (data?.deleteComment?.success) {
        const { commentId, postId } = data.deleteComment;
        
        // Remove comment from cache
        cache.evict({ id: cache.identify({ __typename: 'Comment', id: commentId }) });
        
        // Decrement comments count on the post
        cache.modify({
          id: cache.identify({ __typename: 'Post', id: postId }),
          fields: {
            commentCount: (existing: number = 0) => Math.max(0, existing - 1),
          },
        });
        
        cache.gc();
      }
    },
  });
  
  const deleteComment = async (commentId: string) => {
    return mutate({ variables: { commentId } });
  };
  
  return { deleteComment, loading, error };
};

// ==================== PROFILE HOOKS ====================

export const useUpdateProfile = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_PROFILE_MUTATION, {
    update: (cache, { data }) => {
      if (data?.updateProfile?.user) {
        const updatedUser = data.updateProfile.user;

        cache.modify({
          id: cache.identify({ __typename: 'User', id: updatedUser.id }),
          fields: {
            username: () => updatedUser.username,
            fullName: () => updatedUser.fullName,
            email: () => updatedUser.email,
            bio: () => updatedUser.bio,
            website: () => updatedUser.website,
            location: () => updatedUser.location,
            avatar: () => updatedUser.avatar,
            coverPhoto: () => updatedUser.coverPhoto,
            followerCount: () => updatedUser.followerCount,
            followingCount: () => updatedUser.followingCount,
            postCount: () => updatedUser.postCount,
          },
        });
      }
    },
  });

  const updateProfile = async (variables: {
    username?: string;
    fullName?: string;
    email?: string;
    bio?: string;
    website?: string;
    location?: string;
    avatar?: string;
    coverPhoto?: string;
    dateOfBirth?: string;
  }) => {
    const { data } = await mutate({ variables });
    return data?.updateProfile?.user;
  };

  return { updateProfile, loading, error };
};

export const useChangePassword = () => {
  const [mutate, { loading, error }] = useMutation(CHANGE_PASSWORD_MUTATION);
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    return mutate({ variables: { currentPassword, newPassword } });
  };
  
  return { changePassword, loading, error };
};

// ==================== SEARCH & DISCOVER HOOKS ====================

export const useSearchPosts = () => {
  const { data, loading, error } = useQuery(SEARCH_POSTS_QUERY, {
    skip: true,
  });

  useEffect(() => {
    if (error) {
      //console.error('Error in search posts:', error.message);
    }
  }, [error]);

  const searchPosts = async (query: string, limit = 20) => {
    try {
      const { data: searchData } = await apolloClient.query({
        query: SEARCH_POSTS_QUERY,
        variables: { query, limit },
        fetchPolicy: 'network-only',
      });
      return searchData?.searchPosts || [];
    } catch (err: any) {
      //console.error('Search error:', err.message);
      return [];
    }
  };

  return {
    searchPosts,
    loading,
    error,
    posts: data?.searchPosts || [],
  };
};

export const useTrendingPosts = (limit = 20) => {
  const { data, loading, error } = useQuery(GET_TRENDING_POSTS_QUERY, {
    variables: { limit },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching trending posts:', error.message);
    }
  }, [error]);

  return {
    posts: data?.getTrendingPosts || [],
    loading,
    error,
  };
};

export const useRecentPosts = (limit = 20) => {
  const { data, loading, error } = useQuery(GET_RECENT_POSTS_QUERY, {
    variables: { limit },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching recent posts:', error.message);
    }
  }, [error]);

  return {
    posts: data?.getRecentPosts || [],
    loading,
    error,
  };
};



export const useUserRecipes = (userId: string, limit = 20) => {
  const { data, loading, error, refetch } = useQuery(GET_USER_RECIPES_QUERY, {
    variables: { userId, limit },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    recipes: data?.getUserRecipes || [],
    loading,
    error,
    refetch,
  };
};

export const useFollowingPosts = (limit = 20) => {
  const { data, loading, error } = useQuery(GET_FOLLOWING_POSTS_QUERY, {
    variables: { limit },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error fetching following posts:', error.message);
    }
  }, [error]);

  return {
    posts: data?.getFollowingPosts || [],
    loading,
    error,
  };
};

// ==================== FOLLOW HOOKS ====================

export const useFollowUser = () => {
  const [mutate, { loading, error }] = useMutation(FOLLOW_USER_MUTATION, {
    update: (cache, { data }) => {
      if (data?.followUser) {
        const userId = data.followUser.userId;
        
        // Invalidate user queries
        cache.evict({ fieldName: 'getUser' });
        cache.evict({ fieldName: 'getFollowers' });
        cache.evict({ fieldName: 'getFollowing' });
        cache.gc();
      }
    },
  });
  
  const followUser = async (userId: string) => {
    return mutate({ variables: { userId } });
  };
  
  return { followUser, loading, error };
};

export const useUnfollowUser = () => {
  const [mutate, { loading, error }] = useMutation(UNFOLLOW_USER_MUTATION, {
    update: (cache, { data }) => {
      if (data?.unfollowUser) {
        const userId = data.unfollowUser.userId;
        
        // Invalidate user queries
        cache.evict({ fieldName: 'getUser' });
        cache.evict({ fieldName: 'getFollowers' });
        cache.evict({ fieldName: 'getFollowing' });
        cache.gc();
      }
    },
  });
  
  const unfollowUser = async (userId: string) => {
    return mutate({ variables: { userId } });
  };
  
  return { unfollowUser, loading, error };
};

// ==================== HEALTH CHECK ====================

export const useHealthCheck = () => {
  const { data, loading, error } = useQuery(HEALTH_CHECK_QUERY, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (error) {
      //console.error('Error checking health:', error.message);
    }
  }, [error]);

  return {
    health: data?.health,
    loading,
    error,
  };
};


export const useLikedPosts = (userId: string, limit = 20) => {
  const { data, loading, error, refetch } = useQuery(GET_LIKED_POSTS_QUERY, {
    variables: { userId, limit },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    posts: data?.getLikedPosts || [],
    loading,
    error,
    refetch,
  };
};


// ==================== AVAILABILITY CHECKS ====================

export const useCheckUsernameAvailability = () => {
  const [mutate, { loading, error }] = useMutation(CHECK_USERNAME_AVAILABILITY_QUERY);

  useEffect(() => {
    if (error) {
      //console.error('Error checking username availability:', error.message);
    }
  }, [error]);

  const checkUsernameAvailability = async (username: string) => {
    try {
      const result = await mutate({
        variables: { username },
      });
      return result.data?.checkUsernameAvailability || false;
    } catch {
      return false;
    }
  };

  return { checkUsernameAvailability, loading, error };
};

export const useCheckEmailAvailability = () => {
  const [mutate, { loading, error }] = useMutation(CHECK_EMAIL_AVAILABILITY_QUERY);

  useEffect(() => {
    if (error) {
      //console.error('Error checking email availability:', error.message);
    }
  }, [error]);

  const checkEmailAvailability = async (email: string) => {
    try {
      const result = await mutate({
        variables: { email },
      });
      return result.data?.checkEmailAvailability || false;
    } catch {
      return false;
    }
  };

  return { checkEmailAvailability, loading, error };
};

// ==================== CACHE HELPER FUNCTIONS ====================

export const updatePostInCache = (postId: string, updatedData: any) => {
  if (!postId) {
    //console.error('Cannot update cache: postId is empty');
    return;
  }

 // console.log('🔄 Updating cache for post:', postId, updatedData);
  
  try {
    // Update post in cache
    apolloClient.cache.modify({
      id: apolloClient.cache.identify({ __typename: 'Post', id: postId }),
      fields: {
        isLiked: () => updatedData.isLiked !== undefined ? updatedData.isLiked : undefined,
        likeCount: () => updatedData.likeCount !== undefined ? updatedData.likeCount : undefined,
        isSaved: () => updatedData.isSaved !== undefined ? updatedData.isSaved : undefined,
        saveCount: () => updatedData.saveCount !== undefined ? updatedData.saveCount : undefined,
        shareCount: () => updatedData.shareCount !== undefined ? updatedData.shareCount : undefined,
        commentCount: () => updatedData.commentCount !== undefined ? updatedData.commentCount : undefined,
      },
    });
    
   // console.log('✅ Post cache updated successfully');
  } catch (error: any) {
   // console.error('❌ Error updating post cache:', error.message);
  }
};

// ==================== HELPER FUNCTIONS ====================

export const refreshSavedPosts = async () => {
  try {
    await apolloClient.refetchQueries({
      include: [GET_SAVED_POSTS_QUERY],
    });
  } catch (error) {
    //console.error('Error refreshing saved posts:', error);
  }
};

export const refreshFeedPosts = async () => {
  try {
    await apolloClient.refetchQueries({
      include: [GET_FEED_POSTS_QUERY],
    });
  } catch (error) {
    //console.error('Error refreshing feed posts:', error);
  }
};

export const refreshUserData = async () => {
  try {
    await apolloClient.refetchQueries({
      include: [GET_ME_QUERY],
    });
  } catch (error) {
    //console.error('Error refreshing user data:', error);
  }
};

export const refreshNotifications = async () => {
  try {
    await apolloClient.refetchQueries({
      include: [GET_NOTIFICATIONS_QUERY],
    });
  } catch (error) {
   // console.error('Error refreshing notifications:', error);
  }
};

export const clearApolloCache = async () => {
  try {
    await apolloClient.clearStore();
  } catch (error) {
   // console.error('Error clearing Apollo cache:', error);
  }
};

// ==================== IMAGE UPLOAD HOOKS ====================

export const useUploadImage = () => {
  const [mutate, { loading, error }] = useMutation(UPLOAD_IMAGE_MUTATION);
  
  const uploadImage = async (file: File) => {
    return mutate({ variables: { file } });
  };
  
  return { uploadImage, loading, error };
};

export const useUploadMultipleImages = () => {
  const [mutate, { loading, error }] = useMutation(UPLOAD_MULTIPLE_IMAGES_MUTATION);
  
  const uploadMultipleImages = async (files: File[]) => {
    return mutate({ variables: { files } });
  };
  
  return { uploadMultipleImages, loading, error };
};

// ==================== ALIASES FOR BACKWARD COMPATIBILITY ====================

export const useCreateComment = useAddComment;