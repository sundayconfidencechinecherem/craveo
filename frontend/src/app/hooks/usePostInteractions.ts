'use client';

import { useLikePost, useSavePost, useSharePost, updatePostInCache } from './useGraphQL';

export const usePostInteractions = () => {
  const { likePost } = useLikePost();
  const { savePost } = useSavePost();
  const { sharePost } = useSharePost();

  const handleToggleLike = async (
    postId: string,
    currentIsLiked: boolean,
    currentLikeCount: number
  ) => {
    try {
      const newIsLiked = !currentIsLiked;
      const newLikeCount = newIsLiked
        ? currentLikeCount + 1
        : Math.max(0, currentLikeCount - 1);

      // Optimistic UI update
      updatePostInCache(postId, {
        isLiked: newIsLiked,
        likeCount: newLikeCount,
      });

      // ✅ Only call likePost — backend decides whether to like or unlike
      await likePost(postId);

      return newIsLiked;
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      updatePostInCache(postId, {
        isLiked: currentIsLiked,
        likeCount: currentLikeCount,
      });
      throw error;
    }
  };

  const handleToggleSave = async (
    postId: string,
    currentIsSaved: boolean,
    currentSaveCount: number
  ) => {
    try {
      const newIsSaved = !currentIsSaved;
      const newSaveCount = newIsSaved
        ? currentSaveCount + 1
        : Math.max(0, currentSaveCount - 1);

      updatePostInCache(postId, {
        isSaved: newIsSaved,
        saveCount: newSaveCount,
      });

      await savePost(postId);

      return newIsSaved;
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
      updatePostInCache(postId, {
        isSaved: currentIsSaved,
        saveCount: currentSaveCount,
      });
      throw error;
    }
  };

  const handleShare = async (postId: string, currentShareCount: number) => {
    try {
      const newShareCount = currentShareCount + 1;

      updatePostInCache(postId, {
        shareCount: newShareCount,
      });

      const result = await sharePost(postId);

      if (result?.success) {
        return result;
      }

      throw new Error('Failed to share post');
    } catch (error) {
      console.error('Error sharing post:', error);
      updatePostInCache(postId, {
        shareCount: currentShareCount,
      });
      throw error;
    }
  };

  return {
    handleToggleLike,
    handleToggleSave,
    handleShare,
  };
};
