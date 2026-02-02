'use client';

import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { LIKE_POST_MUTATION, SAVE_POST_MUTATION } from '@/app/graphql/mutations';

export const useTogglePostActions = () => {
  const [likePostMutation] = useMutation(LIKE_POST_MUTATION);
  const [savePostMutation] = useMutation(SAVE_POST_MUTATION);

  // Toggle like/unlike
  const toggleLike = useCallback(
    async (postId: string) => {
      try {
        const { data } = await likePostMutation({
          variables: { postId },
        });
        return data?.likePost; // backend handles both like and unlike
      } catch (error) {
        //console.error('Toggle like error:', error);
        throw error;
      }
    },
    [likePostMutation]
  );

  // Toggle save/unsave
  const toggleSave = useCallback(
    async (postId: string) => {
      try {
        const { data } = await savePostMutation({
          variables: { postId },
        });
        return data?.savePost; // backend handles both save and unsave
      } catch (error) {
        //console.error('Toggle save error:', error);
        throw error;
      }
    },
    [savePostMutation]
  );

  return { toggleLike, toggleSave };
};
