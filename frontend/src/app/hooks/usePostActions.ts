// src/app/hooks/usePostInteractions.ts - SIMPLIFIED VERSION
'use client';

import { useCallback } from 'react';
import { useLikePost, useUnlikePost, useSavePost } from './useGraphQL';
import { apolloClient } from '@/app/services/apollo-client';
import { GET_FEED_POSTS_QUERY, GET_POST_QUERY } from '@/app/graphql/queries';

export const usePostInteractions = () => {
  const { likePost, loading: likeLoading } = useLikePost();
  const { unlikePost, loading: unlikeLoading } = useUnlikePost();
  const { savePost, loading: saveLoading } = useSavePost();

  // Helper to update cache for specific post
  const updatePostInCache = useCallback((postId: string, updates: any) => {
    try {
      // 1. Update single post query if it exists
      try {
        const postQuery = apolloClient.readQuery({
          query: GET_POST_QUERY,
          variables: { id: postId }
        });

        if (postQuery?.getPost) {
          apolloClient.writeQuery({
            query: GET_POST_QUERY,
            variables: { id: postId },
            data: {
              getPost: {
                ...postQuery.getPost,
                ...updates
              }
            }
          });
        }
      } catch (error) {
        // Query might not be in cache yet
      }

      // 2. Update feed posts
      try {
        const feedQuery = apolloClient.readQuery({
          query: GET_FEED_POSTS_QUERY,
          variables: { limit: 20, offset: 0 }
        });

        if (feedQuery?.getFeed) {
          const updatedFeed = feedQuery.getFeed.map((post: any) => {
            if (post.id === postId) {
              return {
                ...post,
                ...updates
              };
            }
            return post;
          });

          apolloClient.writeQuery({
            query: GET_FEED_POSTS_QUERY,
            variables: { limit: 20, offset: 0 },
            data: {
              getFeed: updatedFeed
            }
          });
        }
      } catch (error) {
        // Feed query might not be in cache yet
      }
    } catch (error) {
      console.error('Cache update error:', error);
    }
  }, []);

  const toggleLike = useCallback(async (postId: string, currentIsLiked: boolean, currentLikeCount: number) => {
    // Optimistic update
    const newIsLiked = !currentIsLiked;
    const newLikeCount = newIsLiked ? currentLikeCount + 1 : Math.max(0, currentLikeCount - 1);
    
    updatePostInCache(postId, {
      isLiked: newIsLiked,
      likeCount: newLikeCount
    });

    try {
      const options = {
        variables: { postId },
        update: (cache: any, { data }: any) => {
          // This runs after the mutation succeeds
          const updatedPost = data?.likePost?.post || data?.unlikePost?.post;
          if (updatedPost) {
            // Update cache with server response
            updatePostInCache(postId, updatedPost);
          }
        }
      };

      const result = currentIsLiked 
        ? await unlikePost(options)
        : await likePost(options);

      return result;
    } catch (error) {
      console.error('Toggle like failed:', error);
      // Revert optimistic update on error
      updatePostInCache(postId, {
        isLiked: currentIsLiked,
        likeCount: currentLikeCount
      });
      throw error;
    }
  }, [likePost, unlikePost, updatePostInCache]);

  const toggleSave = useCallback(async (postId: string, currentIsSaved: boolean, currentSaveCount: number) => {
    // Optimistic update
    const newIsSaved = !currentIsSaved;
    const newSaveCount = newIsSaved ? currentSaveCount + 1 : Math.max(0, currentSaveCount - 1);
    
    updatePostInCache(postId, {
      isSaved: newIsSaved,
      saveCount: newSaveCount
    });

    try {
      const result = await savePost({
        variables: { postId },
        update: (cache: any, { data }: any) => {
          const updatedPost = data?.savePost?.post;
          if (updatedPost) {
            updatePostInCache(postId, updatedPost);
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Toggle save failed:', error);
      // Revert optimistic update on error
      updatePostInCache(postId, {
        isSaved: currentIsSaved,
        saveCount: currentSaveCount
      });
      throw error;
    }
  }, [savePost, updatePostInCache]);

  return {
    toggleLike,
    toggleSave,
    loading: likeLoading || unlikeLoading || saveLoading
  };
};