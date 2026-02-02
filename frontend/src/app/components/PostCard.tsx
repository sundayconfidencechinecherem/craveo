'use client';

import { useState, useEffect } from 'react';
import { 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaBookmark, 
  FaRegHeart, 
  FaRegBookmark,
  FaGlobe,
  FaUserFriends,
  FaLock,
  FaMapMarkerAlt,
  FaUtensils,
  FaClock,
  FaFire,
  FaUsers,
  FaEllipsisH,
  FaUserPlus,
  FaUserCheck,
  FaPaperPlane
} from 'react-icons/fa';
import Link from 'next/link';
import { Post, PostWithUI, PostType, PostPrivacy } from '@/app/graphql/types';
import { formatDistanceToNow } from 'date-fns';
import { usePostInteractions } from '@/app/hooks/usePostInteractions';
import { 
  useFollowUser, 
  useCurrentUser, 
  useAddComment,
  useDeleteComment,
  updatePostInCache,
  useGetComments
} from '@/app/hooks/useGraphQL';
import ShareModal from './ShareModal';

interface PostCardProps {
  post: Post | PostWithUI;
  variant?: 'grid' | 'list' | 'detailed';
  onLike?: () => Promise<boolean | void> | void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => Promise<boolean | void> | void;
  showActions?: boolean;
  showAuthor?: boolean;
  showPrivacy?: boolean;
  showFollowButton?: boolean;
  compact?: boolean;
  showComments?: boolean;
  showCounts?: boolean;
}

export default function PostCard({ 
  post, 
  variant = 'grid', 
  onLike,
  onComment,
  onShare,
  onSave,
  showActions = true,
  showAuthor = true,
  showPrivacy = true,
  showFollowButton = true,
  compact = false,
  showComments = false
}: PostCardProps) {
  const [localPost, setLocalPost] = useState(post);
  
  const { handleToggleLike: likePost, handleToggleSave: savePost } = usePostInteractions();
  
  const { followUser: followMutation, loading: followLoading } = useFollowUser();
  const { user: currentUser } = useCurrentUser();
  const { addComment } = useAddComment();
  const { deleteComment } = useDeleteComment();
  const { comments: existingComments, loading: commentsLoading, refetch: refetchComments } = useGetComments(localPost.id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsVisible, setCommentsVisible] = useState(showComments);
  const [comments, setComments] = useState<any[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isLiked = localPost.isLiked || false;
  const isSaved = localPost.isSaved || false;

  // Load existing comments
  useEffect(() => {
    if (existingComments) {
      setComments(existingComments);
    }
  }, [existingComments]);

  useEffect(() => {
    if (currentUser && localPost.author) {
      const following = currentUser.following?.some(
        (followedUser: any) => followedUser.id === localPost.author!.id
      ) || false;
      setIsFollowingAuthor(following);
    }
  }, [currentUser, localPost.author]);

  const formattedDate = localPost.createdAt 
    ? formatDistanceToNow(new Date(localPost.createdAt), { addSuffix: true })
    : 'Recently';

  const getPrivacyIcon = () => {
    switch (localPost.privacy) {
      case PostPrivacy.PUBLIC:
        return <FaGlobe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case PostPrivacy.FRIENDS:
        return <FaUserFriends className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case PostPrivacy.PRIVATE:
        return <FaLock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      default:
        return <FaGlobe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
  };

  const handleFollowAuthor = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!localPost.author || followLoading || !currentUser) return;
    
    if (localPost.author.id === currentUser.id) return;
    
    setIsLoading(true);
    try {
      await followMutation(localPost.author.id);
      setIsFollowingAuthor(!isFollowingAuthor);
    } catch (error) {
      //console.error('Failed to follow user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked 
        ? (localPost.likeCount || 0) + 1 
        : Math.max(0, (localPost.likeCount || 0) - 1);
      
      setLocalPost(prev => ({
        ...prev,
        isLiked: newIsLiked,
        likeCount: newLikeCount
      }));
      
      updatePostInCache(localPost.id, {
        isLiked: newIsLiked,
        likeCount: newLikeCount
      });
      
      if (onLike) {
        const result = await onLike();
        if (typeof result === 'boolean') {
          setLocalPost(prev => ({
            ...prev,
            isLiked: result,
            likeCount: result ? (prev.likeCount || 0) + 1 : Math.max(0, (prev.likeCount || 0) - 1)
          }));
        }
      } else {
        await likePost(localPost.id, isLiked, localPost.likeCount || 0);
      }
      
    } catch (error) {
      //console.error('Failed to like post:', error);
      setLocalPost(prev => ({
        ...prev,
        isLiked,
        likeCount: localPost.likeCount || 0
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newIsSaved = !isSaved;
      const newSaveCount = newIsSaved 
        ? (localPost.saveCount || 0) + 1 
        : Math.max(0, (localPost.saveCount || 0) - 1);
      
      setLocalPost(prev => ({
        ...prev,
        isSaved: newIsSaved,
        saveCount: newSaveCount
      }));
      
      if (onSave) {
        const result = await onSave();
        if (typeof result === 'boolean') {
          setLocalPost(prev => ({
            ...prev,
            isSaved: result,
            saveCount: result ? (prev.saveCount || 0) + 1 : Math.max(0, (prev.saveCount || 0) - 1)
          }));
        }
      } else {
        await savePost(localPost.id, isSaved, localPost.saveCount || 0);
      }
      
    } catch (error) {
      //console.error('Failed to save post:', error);
      setLocalPost(prev => ({
        ...prev,
        isSaved,
        saveCount: localPost.saveCount || 0
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentsVisible(!commentsVisible);
    
    if (onComment) {
      onComment();
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newShareCount = (localPost.shareCount || 0) + 1;
      setLocalPost(prev => ({
        ...prev,
        shareCount: newShareCount
      }));
      
      updatePostInCache(localPost.id, {
        shareCount: newShareCount
      });
      
      setIsShareOpen(true);
      
      if (onShare) {
        onShare();
      }
      
    } catch (error) {
      //console.error('Failed to share post:', error);
      setLocalPost(prev => ({
        ...prev,
        shareCount: localPost.shareCount || 0
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!commentText.trim() || !currentUser) return;
    
    setCommentLoading(true);
    try {
      const content = commentText;
      
      const newComment = {
        id: `temp-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        author: {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar || '/images/avatars/default.png',
          isVerified: currentUser.isVerified || false
        },
        replies: []
      };
      
      const newCommentCount = (localPost.commentCount || 0) + 1;
      
      setComments(prev => [newComment, ...prev]);
      setLocalPost(prev => ({
        ...prev,
        commentCount: newCommentCount
      }));
      
      updatePostInCache(localPost.id, {
        commentCount: newCommentCount
      });
      
      setCommentText('');
      
      const result = await addComment(localPost.id, content);
      
      if (result?.data?.addComment?.success) {
        await refetchComments();
      } else {
        setComments(prev => prev.filter(c => !c.id.startsWith('temp-')));
        setLocalPost(prev => ({
          ...prev,
          commentCount: Math.max(0, (prev.commentCount || 0) - 1)
        }));
      }
      
    } catch (error) {
      setComments(prev => prev.filter(c => !c.id.startsWith('temp-')));
      setLocalPost(prev => ({
        ...prev,
        commentCount: Math.max(0, (prev.commentCount || 0) - 1)
      }));
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId);
      
      if (result?.data?.deleteComment?.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        
        const newCommentCount = Math.max(0, (localPost.commentCount || 0) - 1);
        setLocalPost(prev => ({
          ...prev,
          commentCount: newCommentCount
        }));
        
        updatePostInCache(localPost.id, {
          commentCount: newCommentCount
        });
      }
    } catch (error) {
      //console.error('Failed to delete comment:', error);
    }
  };

  const postContent = localPost.content || '';
  const contentPreview = postContent.length > 150 && !showFullContent
    ? `${postContent.substring(0, 150)}...`
    : postContent;

  const renderFollowButton = () => {
    if (!showFollowButton || !currentUser || !localPost.author) return null;
    
    if (localPost.author.id === currentUser.id) return null;
    
    return (
      <button
        onClick={handleFollowAuthor}
        disabled={followLoading || isLoading}
        className={`ml-2 px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
          isFollowingAuthor
            ? 'bg-surface-hover text-text-primary border border-border hover:bg-surface-hover/80'
            : 'bg-primary text-white hover:bg-primary-dark'
        } ${(followLoading || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isFollowingAuthor ? (
          <>
            <FaUserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Following
          </>
        ) : (
          <>
            <FaUserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Follow
          </>
        )}
      </button>
    );
  };

  const renderShareButton = () => (
    <button
      onClick={handleShareClick}
      disabled={isLoading}
      className={`flex items-center gap-1.5 sm:gap-2 text-text-tertiary hover:text-green-500 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <FaShare className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-xs sm:text-sm font-medium">{localPost.shareCount || 0}</span>
    </button>
  );

  const renderCommentSection = () => {
    if (!commentsVisible || variant === 'grid') return null;
    
    return (
      <div className="mt-6 border-t border-border pt-6">
        {currentUser && (
          <form onSubmit={handleAddComment} className="mb-6">
            <div className="flex gap-3 sm:gap-4">
              <img
                src={currentUser.avatar || '/images/avatars/default.png'}
                alt={currentUser.fullName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base resize-none"
                  rows={3}
                  disabled={commentLoading}
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentLoading}
                    className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg flex items-center gap-2 text-sm sm:text-base font-medium transition-colors ${
                      commentText.trim() && !commentLoading
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-surface-hover text-text-tertiary cursor-not-allowed'
                    }`}
                  >
                    <FaPaperPlane className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {commentLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-border last:border-0 pb-4">
                <div className="flex gap-3 sm:gap-4">
                  <img
                    src={comment.author.avatar || '/images/avatars/default.png'}
                    alt={comment.author.fullName}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm sm:text-base text-text-primary">
                          {comment.author.fullName}
                        </span>
                        {comment.author.isVerified && (
                          <span className="text-xs px-2 py-0.5 bg-primary text-white rounded-full">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs sm:text-sm text-text-tertiary">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {currentUser?.id === comment.author.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs sm:text-sm text-red-500 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-text-primary text-sm sm:text-base mt-2">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-text-tertiary text-sm sm:text-base">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    );
  };

  // List variant - Longer height with all details
  if (variant === 'list') {
    return (
      <>
        <Link href={`/post/${localPost.id}`}>
          <div className="bg-surface rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[180px] sm:min-h-[200px] mb-6">
            <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
              {/* Image - Mobile: top, Desktop: left */}
              {localPost.images && localPost.images.length > 0 && (
                <div className="w-full sm:w-48 sm:h-48 flex-shrink-0">
                  <img
                    src={localPost.images[0]}
                    alt={localPost.title || 'Post image'}
                    className="w-full h-48 sm:h-full object-cover rounded-xl"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Author Info */}
                {showAuthor && localPost.author && (
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Link 
                      href={`/profile/${localPost.author.id}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={localPost.author.avatar || '/images/avatars/default.png'}
                        alt={localPost.author.fullName}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm sm:text-base text-text-primary">
                          {localPost.author.fullName}
                        </span>
                        {localPost.author.isVerified && (
                          <span className="text-xs px-1.5 py-0.5 bg-primary text-white rounded-full">✓</span>
                        )}
                      </div>
                    </Link>
                    
                    {renderFollowButton()}
                    
                    <span className="hidden sm:inline text-text-tertiary text-sm">•</span>
                    <span className="text-text-tertiary text-xs sm:text-sm">{formattedDate}</span>
                    
                    {showPrivacy && (
                      <>
                        <span className="hidden sm:inline text-text-tertiary text-sm">•</span>
                        <div className="flex items-center gap-1.5 text-text-tertiary text-xs sm:text-sm">
                          {getPrivacyIcon()}
                          <span className="capitalize">{localPost.privacy?.toLowerCase()}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <h3 className="font-bold text-lg sm:text-xl text-text-primary mb-3">{localPost.title}</h3>
                
                <div className="text-text-secondary text-sm sm:text-base mb-4 leading-relaxed">
                  {contentPreview}
                  {postContent.length > 150 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowFullContent(!showFullContent);
                      }}
                      className="ml-2 text-primary hover:underline font-medium text-sm sm:text-base"
                    >
                      {showFullContent ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
                
                {localPost.tags && localPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {localPost.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm hover:bg-primary/20 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
              
              </div>
            </div>
            
            {showActions && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-border bg-surface-hover/30">
                <div className="flex items-center gap-4 sm:gap-6">
                  <button
                    onClick={handleLikeClick}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm sm:text-base font-medium ${
                      isLiked 
                        ? 'text-red-500 hover:bg-red-50' 
                        : 'text-text-tertiary hover:text-red-500 hover:bg-surface-hover'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLiked ? (
                      <FaHeart className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <FaRegHeart className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                     {localPost.likeCount || 0} likes
                  </button>
                  <button
                    onClick={handleCommentClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-tertiary hover:text-blue-500 hover:bg-surface-hover transition-all text-sm sm:text-base font-medium"
                  >
                    <FaComment className="w-5 h-5 sm:w-6 sm:h-6" />
                    {comments.length}
                  </button>
                  <button
                    onClick={handleShareClick}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-text-tertiary hover:text-green-500 hover:bg-surface-hover transition-all text-sm sm:text-base font-medium ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaShare className="w-5 h-5 sm:w-6 sm:h-6" />
                    {localPost.shareCount || 0} 
                  </button>
                </div>
                <button
                  onClick={handleSaveClick}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-xl transition-all text-sm sm:text-base font-medium ${
                    isSaved 
                      ? 'text-yellow-500 hover:bg-yellow-50' 
                      : 'text-text-tertiary hover:text-yellow-500 hover:bg-surface-hover'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaved ? (
                    <>
                      <FaBookmark className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
                       {localPost.saveCount || 0}
                    </>
                  ) : (
                    <>
                      <FaRegBookmark className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
                      <span className="hidden sm:inline">Save</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            {renderCommentSection()}
          </div>
        </Link>

        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          postId={localPost.id}
          postTitle={localPost.title}
          postImage={localPost.images?.[0]}
        />
      </>
    );
  }

  // Detailed variant - Full screen-like experience
  if (variant === 'detailed') {
    return (
      <>
        <div className="bg-surface rounded-2xl shadow-xl overflow-hidden min-h-[600px] sm:min-h-[700px] mb-8">
          {/* Author Header */}
          {showAuthor && localPost.author && (
            <div className="p-4 sm:p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Link href={`/profile/${localPost.author.id}`}>
                    <img
                      src={localPost.author.avatar || '/images/avatars/default.png'}
                      alt={localPost.author.fullName}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div>
                    <Link 
                      href={`/profile/${localPost.author.id}`}
                      className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
                    >
                      <span className="font-bold text-lg sm:text-2xl text-text-primary">
                        {localPost.author.fullName}
                      </span>
                      {localPost.author.isVerified && (
                        <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-primary text-white rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-text-secondary mt-2">
                      <span>{formattedDate}</span>
                      {showPrivacy && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {getPrivacyIcon()}
                            <span className="capitalize">{localPost.privacy?.toLowerCase()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {renderFollowButton()}
                </div>
                <button className="text-text-tertiary hover:text-text-primary p-2 sm:p-3 hover:bg-surface-hover rounded-full transition-colors">
                  <FaEllipsisH className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          )}
          
          <div className="p-4 sm:p-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-text-primary mb-6">{localPost.title}</h1>
            
            <div className="text-text-secondary text-base sm:text-xl mb-8 sm:mb-12 whitespace-pre-line leading-relaxed sm:leading-loose">
              {localPost.content}
            </div>
            
            {localPost.images && localPost.images.length > 0 && (
              <div className="mb-8 sm:mb-12 rounded-xl sm:rounded-2xl overflow-hidden">
                <img
                  src={localPost.images[0]}
                  alt={localPost.title || 'Post image'}
                  className="w-full h-auto object-cover max-h-[500px] sm:max-h-[600px]"
                />
              </div>
            )}
            
            {localPost.tags && localPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-8">
                {localPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 text-primary rounded-full text-sm sm:text-base hover:bg-primary/20 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-8 sm:gap-12 py-6 border-t border-border text-text-tertiary text-base sm:text-lg">
              <span className="flex items-center gap-2 sm:gap-3">
                <FaHeart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                {localPost.likeCount || 0} likes
              </span>
              <span className="flex items-center gap-2 sm:gap-3">
                <FaComment className="w-5 h-5 sm:w-6 sm:h-6" />
                {localPost.commentCount || 0} comments
              </span>
              <span className="flex items-center gap-2 sm:gap-3">
                <FaShare className="w-5 h-5 sm:w-6 sm:h-6" />
                {localPost.shareCount || 0} shares
              </span>
              <span className="flex items-center gap-2 sm:gap-3">
                <FaBookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                {localPost.saveCount || 0} saves
              </span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-t border-border bg-surface-hover/30">
              <div className="flex items-center gap-4 sm:gap-8">
                <button
                  onClick={handleLikeClick}
                  disabled={isLoading}
                  className={`flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all text-base sm:text-lg font-semibold ${
                    isLiked 
                      ? 'text-red-500 hover:bg-red-50' 
                      : 'text-text-tertiary hover:text-red-500 hover:bg-surface-hover'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLiked ? (
                    <FaHeart className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <FaRegHeart className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                  <span>Like</span>
                </button>
                <button
                  onClick={handleCommentClick}
                  className="flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-text-tertiary hover:text-blue-500 hover:bg-surface-hover transition-all text-base sm:text-lg font-semibold"
                >
                  <FaComment className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span>Comment</span>
                </button>
                <button
                  onClick={handleShareClick}
                  disabled={isLoading}
                  className={`flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-text-tertiary hover:text-green-500 hover:bg-surface-hover transition-all text-base sm:text-lg font-semibold ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaShare className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span>Share</span>
                </button>
              </div>
              <button
                onClick={handleSaveClick}
                disabled={isLoading}
                className={`flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all text-base sm:text-lg font-semibold ${
                  isSaved 
                    ? 'text-yellow-500 hover:bg-yellow-50' 
                    : 'text-text-tertiary hover:text-yellow-500 hover:bg-surface-hover'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaved ? (
                  <>
                    <FaBookmark className="w-6 h-6 sm:w-7 sm:h-7" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <FaRegBookmark className="w-6 h-6 sm:w-7 sm:h-7" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {renderCommentSection()}
        </div>

        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          postId={localPost.id}
          postTitle={localPost.title}
          postImage={localPost.images?.[0]}
        />
      </>
    );
  }

  // Grid variant (default) - Instagram-like feed card
  return (
    <>
      <Link href={`/post/${localPost.id}`}>
        <div className="bg-surface rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[500px] sm:min-h-[550px] mb-6">
          {showAuthor && localPost.author && (
            <div className="flex items-center gap-3 p-4 sm:p-6">
              <Link href={`/profile/${localPost.author.id}`}>
                <img
                  src={localPost.author.avatar || '/images/avatars/default.png'}
                  alt={localPost.author.fullName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover hover:opacity-90 transition-opacity flex-shrink-0"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link 
                    href={`/profile/${localPost.author.id}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="font-semibold text-sm sm:text-base text-text-primary truncate">
                      {localPost.author.fullName}
                    </span>
                    {localPost.author.isVerified && (
                      <span className="text-xs px-2 py-0.5 bg-primary text-white rounded-full flex-shrink-0">
                        ✓
                      </span>
                    )}
                  </Link>
                  {renderFollowButton()}
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary mt-1">
                  <span>{formattedDate}</span>
                  {showPrivacy && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {getPrivacyIcon()}
                        <span className="capitalize">{localPost.privacy?.toLowerCase()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button className="text-text-tertiary hover:text-text-primary p-2 hover:bg-surface-hover rounded-full transition-colors">
                <FaEllipsisH className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          )}
          
          {localPost.images && localPost.images.length > 0 && (
            <div className="relative h-64 sm:h-80 md:h-96">
              <img
                src={localPost.images[0]}
                alt={localPost.title || 'Post image'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {localPost.postType === PostType.RECIPE && (
                <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-xl">
                  <FaUtensils className="w-4 h-4 sm:w-5 sm:h-5" />
                  Recipe
                </div>
              )}
              {showPrivacy && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  {getPrivacyIcon()}
                </div>
              )}
            </div>
          )}
          
          <div className="p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl text-text-primary mb-3 line-clamp-2">
              {localPost.title}
            </h3>
            
            <div className="text-text-secondary text-sm sm:text-base mb-4 line-clamp-3 leading-relaxed">
              {contentPreview}
              {postContent.length > 150 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFullContent(!showFullContent);
                  }}
                  className="ml-2 text-primary hover:underline font-medium text-sm sm:text-base"
                >
                  {showFullContent ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
            
            {localPost.tags && localPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {localPost.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm hover:bg-primary/20 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {localPost.location && (
              <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm text-text-tertiary">
                <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">{localPost.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-4 text-sm sm:text-base text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <FaHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                {localPost.likeCount || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <FaComment className="w-4 h-4 sm:w-5 sm:h-5" />
                {comments.length}
              </span>
              <span className="flex items-center gap-1.5">
                <FaShare className="w-4 h-4 sm:w-5 sm:h-5" />
                {localPost.shareCount || 0}
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <FaBookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                {localPost.saveCount || 0}
              </span>
            </div>
            
            {showActions && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleLikeClick}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm sm:text-base font-medium ${
                      isLiked 
                        ? 'text-red-500 hover:bg-red-50' 
                        : 'text-text-tertiary hover:text-red-500 hover:bg-surface-hover'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLiked ? (
                      <FaHeart className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <FaRegHeart className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                    <span>Like</span>
                  </button>
                  <button
                    onClick={handleCommentClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-tertiary hover:text-blue-500 hover:bg-surface-hover transition-all text-sm sm:text-base font-medium"
                  >
                    <FaComment className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Comment</span>
                  </button>
                  <button
                    onClick={handleShareClick}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-text-tertiary hover:text-green-500 hover:bg-surface-hover transition-all text-sm sm:text-base font-medium ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaShare className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Share</span>
                  </button>
                </div>
                <button
                  onClick={handleSaveClick}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-xl transition-all text-sm sm:text-base font-medium ${
                    isSaved 
                      ? 'text-yellow-500 hover:bg-yellow-50' 
                      : 'text-text-tertiary hover:text-yellow-500 hover:bg-surface-hover'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaved ? (
                    <FaBookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <FaRegBookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        postId={localPost.id}
        postTitle={localPost.title}
        postImage={localPost.images?.[0]}
      />
    </>
  );
}