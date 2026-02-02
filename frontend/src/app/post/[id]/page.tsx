// src/app/post/[id]/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaBookmark, 
  FaArrowLeft,
  FaUtensils,
  FaClock,
  FaFire,
  FaMapMarkerAlt,
  FaPrint,
  FaFlag,
  FaRegHeart,
  FaRegBookmark,
  FaChevronLeft,
  FaTimes
} from 'react-icons/fa';
import Link from 'next/link';
import Button from '@/app/components/Button';
import { 
  useGetPost, 
  useCurrentUser,
  updatePostInCache,
  useAddComment
} from '@/app/hooks/useGraphQL';
import { usePostInteractions } from '@/app/hooks/usePostInteractions';
import { formatDistanceToNow } from 'date-fns';
import Comments from '@/app/components/Comments';

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const { post, loading: postLoading, error: postError, refetch: refetchPost } = useGetPost(postId);
  const { user: currentUser } = useCurrentUser();
  const { handleToggleLike: likePost, handleToggleSave: savePost } = usePostInteractions();
  const { addComment } = useAddComment();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setIsLiked(post.isLiked || false);
      setIsSaved(post.isSaved || false);
    }
  }, [post]);

  const handleLike = async () => {
    if (!post) return;
    
    try {
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked 
        ? (post.likeCount || 0) + 1 
        : Math.max(0, (post.likeCount || 0) - 1);
      
      // Optimistic update
      setIsLiked(newIsLiked);
      updatePostInCache(postId, {
        isLiked: newIsLiked,
        likeCount: newLikeCount
      });
      
      // Call API
      await likePost(postId, isLiked, post.likeCount || 0);
      
      // Refetch to get updated data
      await refetchPost();
    } catch (error) {
     // console.error('Failed to like/unlike post:', error);
      // Revert on error
      setIsLiked(isLiked);
    }
  };

  const handleSave = async () => {
    if (!post) return;
    
    try {
      const newIsSaved = !isSaved;
      const newSaveCount = newIsSaved 
        ? (post.saveCount || 0) + 1 
        : Math.max(0, (post.saveCount || 0) - 1);
      
      // Optimistic update
      setIsSaved(newIsSaved);
      updatePostInCache(postId, {
        isSaved: newIsSaved,
        saveCount: newSaveCount
      });
      
      // Call API
      await savePost(postId, isSaved, post.saveCount || 0);
      
      // Refetch to get updated data
      await refetchPost();
    } catch (error) {
      //console.error('Failed to save post:', error);
      // Revert on error
      setIsSaved(isSaved);
    }
  };

  const handleShare = () => {
    if (!post) return;
    
    if (navigator.share) {
      navigator.share({
        title: post.title || 'Check out this post',
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !currentUser || commentsLoading) return;
    
    setCommentsLoading(true);
    try {
      const result = await addComment(postId, commentText.trim());
      //console.log('Comment result:', result);
      
      if (result?.data?.addComment?.success) {
        setCommentText('');
        // Refetch post to update comments
        await refetchPost();
      } else {
        const errorMsg = result?.data?.addComment?.message || 'Failed to post comment';
        alert(errorMsg);
      }
    } catch (error: any) {
      //console.error('Failed to post comment:', error);
     // console.error('GraphQL Errors:', error.graphQLErrors);
     // console.error('Network Error:', error.networkError);
      alert('An error occurred while posting comment');
    } finally {
      setCommentsLoading(false);
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-app-bg pt-16 lg:pt-0 lg:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-24 bg-gray-300 rounded" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-300 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-gray-300 rounded" />
                <div className="h-4 w-1/2 bg-gray-300 rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-full" />
                  <div className="h-4 bg-gray-300 rounded w-5/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-app-bg pt-16 lg:pt-0 lg:ml-64">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            {postError ? 'Error loading post' : 'Post not found'}
          </h1>
          <p className="text-text-secondary mb-6">
            {postError ? 'Please try again later' : 'The post you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => router.push('/')}>
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border p-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface-hover rounded-full"
        >
          <FaChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-text-primary">Post</h1>
        <div className="w-10"></div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block fixed top-0 left-64 right-0 z-50 bg-white border-b border-border p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="outline"
            icon={<FaArrowLeft />}
            onClick={() => router.back()}
            className="text-sm"
          >
            Back
          </Button>
          <h1 className="text-xl font-bold text-text-primary">Post Details</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 lg:pt-20 lg:ml-64">
        <div className="container mx-auto px-4 py-4 lg:py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Image */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="bg-surface rounded-xl shadow-lg overflow-hidden relative">
                {post.images && post.images.length > 0 && (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-auto max-h-[500px] lg:max-h-[600px] object-cover cursor-pointer"
                    onClick={() => setShowImageFullscreen(true)}
                  />
                )}
                
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                    title="Share"
                  >
                    <FaShare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                    title="Print"
                  >
                    <FaPrint className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Stats - Mobile */}
              <div className="lg:hidden grid grid-cols-4 gap-3 mt-4">
                <div className="bg-surface rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-text-primary">
                    {post.likeCount > 999 ? `${(post.likeCount/1000).toFixed(1)}k` : post.likeCount}
                  </div>
                  <div className="text-xs text-text-secondary">Likes</div>
                </div>
                <div className="bg-surface rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-text-primary">
                    {post.commentCount > 999 ? `${(post.commentCount/1000).toFixed(1)}k` : post.commentCount || 0}
                  </div>
                  <div className="text-xs text-text-secondary">Comments</div>
                </div>
                <div className="bg-surface rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-text-primary">
                    {post.shareCount > 999 ? `${(post.shareCount/1000).toFixed(1)}k` : post.shareCount || 0}
                  </div>
                  <div className="text-xs text-text-secondary">Shares</div>
                </div>
                {post.recipeDetails?.servings && (
                  <div className="bg-surface rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-text-primary">{post.recipeDetails.servings}</div>
                    <div className="text-xs text-text-secondary">Servings</div>
                  </div>
                )}
              </div>

              {/* Quick Stats - Desktop */}
              <div className="hidden lg:grid grid-cols-4 gap-4 mt-6">
                <div className="bg-surface rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">{post.likeCount?.toLocaleString() || 0}</div>
                  <div className="text-sm text-text-secondary">Likes</div>
                </div>
                <div className="bg-surface rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">{post.commentCount?.toLocaleString() || 0}</div>
                  <div className="text-sm text-text-secondary">Comments</div>
                </div>
                <div className="bg-surface rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">{post.shareCount?.toLocaleString() || 0}</div>
                  <div className="text-sm text-text-secondary">Shares</div>
                </div>
                {post.recipeDetails?.servings && (
                  <div className="bg-surface rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-text-primary">{post.recipeDetails.servings}</div>
                    <div className="text-sm text-text-secondary">Servings</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="bg-surface rounded-xl shadow-lg p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.author.id}`}>
                      <img
                        src={post.author.avatar || '/images/avatars/default.png'}
                        alt={post.author.fullName}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    </Link>
                    <div>
                      <Link 
                        href={`/profile/${post.author.id}`}
                        className="flex items-center gap-1 hover:opacity-80"
                      >
                        <span className="font-bold text-text-primary text-sm lg:text-base">
                          {post.author.fullName}
                        </span>
                        {post.author.isVerified && (
                          <span className="text-xs px-1.5 py-0.5 bg-primary text-white rounded-full">✓</span>
                        )}
                      </Link>
                      <div className="text-xs lg:text-sm text-text-secondary">
                        @{post.author.username}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Recently'}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-text-tertiary hover:text-text-primary">
                    <FaFlag className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>

                <h1 className="text-xl lg:text-2xl font-bold text-text-primary mb-4">
                  {post.title}
                </h1>

                <p className="text-text-primary whitespace-pre-line mb-4 lg:mb-6 text-sm lg:text-base">
                  {post.content}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 lg:mb-6">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 bg-primary/10 text-primary rounded-full text-xs lg:text-sm hover:bg-primary/20 cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {post.recipeDetails && (
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                    {post.recipeDetails.ingredients && post.recipeDetails.ingredients.length > 0 && (
                      <div className="flex items-center gap-2 col-span-2">
                        <FaUtensils className="text-primary w-3 h-3 lg:w-4 lg:h-4" />
                        <div>
                          <div className="text-xs lg:text-sm text-text-secondary">Ingredients</div>
                          <div className="font-medium text-text-primary text-sm lg:text-base">
                            {post.recipeDetails.ingredients.length} items
                          </div>
                        </div>
                      </div>
                    )}
                    {post.recipeDetails.prepTime && (
                      <div className="flex items-center gap-2">
                        <FaClock className="text-primary w-3 h-3 lg:w-4 lg:h-4" />
                        <div>
                          <div className="text-xs lg:text-sm text-text-secondary">Prep Time</div>
                          <div className="font-medium text-text-primary text-sm lg:text-base">
                            {post.recipeDetails.prepTime} mins
                          </div>
                        </div>
                      </div>
                    )}
                    {post.recipeDetails.difficulty && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs text-white">D</span>
                        </div>
                        <div>
                          <div className="text-xs lg:text-sm text-text-secondary">Difficulty</div>
                          <div className="font-medium text-text-primary text-sm lg:text-base capitalize">
                            {post.recipeDetails.difficulty}
                          </div>
                        </div>
                      </div>
                    )}
                    {post.recipeDetails.cookTime && (
                      <div className="flex items-center gap-2">
                        <FaFire className="text-primary w-3 h-3 lg:w-4 lg:h-4" />
                        <div>
                          <div className="text-xs lg:text-sm text-text-secondary">Cook Time</div>
                          <div className="font-medium text-text-primary text-sm lg:text-base">
                            {post.recipeDetails.cookTime} mins
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {post.location && (
                  <div className="flex items-center gap-2 text-text-secondary mb-4 lg:mb-6 text-sm">
                    <FaMapMarkerAlt className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>{post.location}</span>
                  </div>
                )}

                <div className="lg:hidden flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      className={`flex flex-col items-center gap-1 ${isLiked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'}`}
                    >
                      {isLiked ? (
                        <FaHeart className="w-6 h-6 fill-current" />
                      ) : (
                        <FaRegHeart className="w-6 h-6" />
                      )}
                      <span className="text-xs">Like</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-text-secondary hover:text-blue-500">
                      <FaComment className="w-6 h-6" />
                      <span className="text-xs">Comment</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex flex-col items-center gap-1 text-text-secondary hover:text-green-500"
                    >
                      <FaShare className="w-6 h-6" />
                      <span className="text-xs">Share</span>
                    </button>
                  </div>
                  <button
                    onClick={handleSave}
                    className={`flex flex-col items-center gap-1 ${isSaved ? 'text-yellow-500' : 'text-text-secondary hover:text-yellow-500'}`}
                  >
                    {isSaved ? (
                      <FaBookmark className="w-6 h-6 fill-current" />
                    ) : (
                      <FaRegBookmark className="w-6 h-6" />
                    )}
                    <span className="text-xs">Save</span>
                  </button>
                </div>

                <div className="hidden lg:flex items-center justify-between pt-6 border-t border-border">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      {isLiked ? (
                        <FaHeart className="w-6 h-6 fill-current" />
                      ) : (
                        <FaRegHeart className="w-6 h-6" />
                      )}
                      <span className="font-medium">Like</span>
                    </button>
                    <button className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
                      <FaComment className="w-6 h-6" />
                      <span className="font-medium">Comment</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
                    >
                      <FaShare className="w-6 h-6" />
                      <span className="font-medium">Share</span>
                    </button>
                  </div>
                  <button
                    onClick={handleSave}
                    className={`${isSaved ? 'text-yellow-500' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {isSaved ? (
                      <FaBookmark className="w-6 h-6 fill-current" />
                    ) : (
                      <FaRegBookmark className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-surface rounded-xl shadow-lg p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-text-primary mb-4 lg:mb-6">
                  Comments ({post.commentCount || 0})
                </h2>
                
                {/* Add Comment Form */}
                {currentUser && (
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <img
                        src={currentUser.avatar || '/images/avatars/default.png'}
                        alt={currentUser.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary resize-none"
                          rows={2}
                          disabled={commentsLoading}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="primary"
                            onClick={handleCommentSubmit}
                            disabled={commentsLoading || !commentText.trim()}
                            className="text-sm"
                          >
                            {commentsLoading ? 'Posting...' : 'Post Comment'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Comments List */}
                <div className="space-y-4 lg:space-y-6">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment: any) => (
                      <div key={comment.id} className="border-b border-border pb-4 lg:pb-6 last:border-0">
                        <div className="flex gap-3">
                          <img
                            src={comment.author.avatar || '/images/avatars/default.png'}
                            alt={comment.author.fullName}
                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="font-bold text-text-primary text-sm lg:text-base">
                                  {comment.author.fullName}
                                </span>
                                <span className="text-xs lg:text-sm text-text-secondary ml-2">
                                  @{comment.author.username}
                                </span>
                              </div>
                              <span className="text-xs lg:text-sm text-text-tertiary">
                                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Recently'}
                              </span>
                            </div>
                            <p className="text-text-primary mb-2 lg:mb-3 text-sm lg:text-base">
                              {comment.content}
                            </p>
                            <div className="flex items-center gap-4 lg:gap-6 text-xs lg:text-sm">
                              <button className="flex items-center gap-1 lg:gap-2 text-text-secondary hover:text-red-500">
                                <FaRegHeart className="w-3 h-3 lg:w-4 lg:h-4" />
                                <span>Like</span>
                              </button>
                              <button className="flex items-center gap-1 lg:gap-2 text-text-secondary hover:text-blue-500">
                                <FaComment className="w-3 h-3 lg:w-4 lg:h-4" />
                                <span>Reply</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImageFullscreen && post.images && post.images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <button
            onClick={() => setShowImageFullscreen(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <FaTimes className="w-6 h-6" />
          </button>
          <img
            src={post.images[0]}
            alt={post.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}