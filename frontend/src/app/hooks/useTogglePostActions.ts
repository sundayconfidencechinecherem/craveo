// src/app/hooks/useTogglePostActions.ts - CORRECTED VERSION
'use client';

import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { LIKE_POST_MUTATION, UNLIKE_POST_MUTATION, SAVE_POST_MUTATION } from '@/app/graphql/mutations';

export const useTogglePostActions = () => {
  const [likePostMutation] = useMutation(LIKE_POST_MUTATION);
  const [unlikePostMutation] = useMutation(UNLIKE_POST_MUTATION);
  const [savePostMutation] = useMutation(SAVE_POST_MUTATION);

  const toggleLike = useCallback(async (postId: string, isCurrentlyLiked: boolean) => {
    try {
      if (isCurrentlyLiked) {
        const { data } = await unlikePostMutation({
          variables: { postId }, // CORRECT: postId inside variables object
        });
        return data?.unlikePost;
      } else {
        const { data } = await likePostMutation({
          variables: { postId }, // CORRECT: postId inside variables object
        });
        return data?.likePost;
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      throw error;
    }
  }, [likePostMutation, unlikePostMutation]);

  const toggleSave = useCallback(async (postId: string) => {
    try {
      const { data } = await savePostMutation({
        variables: { postId }, // CORRECT: postId inside variables object
      });
      return data?.savePost;
    } catch (error) {
      console.error('Toggle save error:', error);
      throw error;
    }
  }, [savePostMutation]);

  return { toggleLike, toggleSave };
};