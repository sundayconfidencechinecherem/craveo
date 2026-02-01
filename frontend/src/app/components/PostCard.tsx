// src/app/components/PostCard.tsx - COMPLETE CORRECTED VERSION
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
  
  // FIX: Use handleToggleLike and handleToggleSave (or handleLike/handleSave if you kept the aliases)
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
        return <FaGlobe className="w-3 h-3" />;
      case PostPrivacy.FRIENDS:
        return <FaUserFriends className="w-3 h-3" />;
      case PostPrivacy.PRIVATE:
        return <FaLock className="w-3 h-3" />;
      default:
        return <FaGlobe className="w-3 h-3" />;
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
      console.error('Failed to follow user:', error);
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
      console.error('Failed to like post:', error);
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
      console.error('Failed to save post:', error);
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
      
      // For now, just open share modal without calling API
      setIsShareOpen(true);
      
      if (onShare) {
        onShare();
      }
      
    } catch (error) {
      console.error('Failed to share post:', error);
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
        console.log('Comment added successfully');
        // Refetch comments to get the real data
        await refetchComments();
      } else {
        // Remove optimistic comment on error
        setComments(prev => prev.filter(c => !c.id.startsWith('temp-')));
        setLocalPost(prev => ({
          ...prev,
          commentCount: Math.max(0, (prev.commentCount || 0) - 1)
        }));
      }
      
    } catch (error) {
      console.error('Failed to add comment:', error);
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
      console.error('Failed to delete comment:', error);
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
        className={`ml-2 px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
          isFollowingAuthor
            ? 'bg-surface-hover text-text-primary border border-border'
            : 'bg-primary text-white hover:bg-primary-dark'
        } ${(followLoading || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isFollowingAuthor ? (
          <>
            <FaUserCheck className="w-3 h-3" /> Following
          </>
        ) : (
          <>
            <FaUserPlus className="w-3 h-3" /> Follow
          </>
        )}
      </button>
    );
  };

  const renderShareButton = () => (
    <button
      onClick={handleShareClick}
      disabled={isLoading}
      className={`flex items-center gap-1 text-text-tertiary hover:text-green-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <FaShare className="w-4 h-4" />
      <span className="text-sm">{localPost.shareCount || 0}</span>
    </button>
  );

  const renderCommentSection = () => {
    if (!commentsVisible || variant === 'grid') return null;
    
    return (
      <div className="mt-4 border-t border-border pt-4">
        {currentUser && (
          <form onSubmit={handleAddComment} className="mb-4">
            <div className="flex gap-3">
              <img
                src={currentUser.avatar || '/images/avatars/default.png'}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
                  rows={2}
                  disabled={commentLoading}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentLoading}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 text-sm ${
                      commentText.trim() && !commentLoading
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-surface-hover text-text-tertiary cursor-not-allowed'
                    }`}
                  >
                    <FaPaperPlane className="w-3 h-3" />
                    {commentLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-border last:border-0 pb-3">
                <div className="flex gap-3">
                  <img
                    src={comment.author.avatar || '/images/avatars/default.png'}
                    alt={comment.author.fullName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-xs text-text-primary">
                          {comment.author.fullName}
                        </span>
                        {comment.author.isVerified && (
                          <span className="text-[10px] px-1 bg-primary text-white rounded-full">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-tertiary">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {currentUser?.id === comment.author.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-text-primary text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-text-tertiary text-sm">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    );
  };

  // List variant
  if (variant === 'list') {
    return (
      <>
        <Link href={`/post/${localPost.id}`}>
          <div className="bg-surface rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex gap-4 p-4">
              {/* Image */}
              {localPost.images && localPost.images.length > 0 && (
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={localPost.images[0]}
                    alt={localPost.title || 'Post image'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Author Info */}
                {showAuthor && localPost.author && (
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Link 
                      href={`/profile/${localPost.author.id}`}
                      className="flex items-center gap-2 hover:opacity-80"
                    >
                      <img
                        src={localPost.author.avatar || '/images/avatars/default.png'}
                        alt={localPost.author.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm text-text-primary">
                          {localPost.author.fullName}
                        </span>
                        {localPost.author.isVerified && (
                          <span className="text-xs px-1 py-0.5 bg-primary text-white rounded-full">✓</span>
                        )}
                      </div>
                    </Link>
                    
                    {renderFollowButton()}
                    
                    <span className="text-text-tertiary text-xs">•</span>
                    <span className="text-text-tertiary text-xs">{formattedDate}</span>
                    
                    {showPrivacy && (
                      <>
                        <span className="text-text-tertiary text-xs">•</span>
                        <div className="flex items-center gap-1 text-text-tertiary text-xs">
                          {getPrivacyIcon()}
                          <span className="capitalize">{localPost.privacy?.toLowerCase()}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <h3 className="font-bold text-text-primary text-sm mb-1">{localPost.title}</h3>
                
                <p className="text-text-secondary text-sm mt-1">
                  {contentPreview}
                  {postContent.length > 150 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowFullContent(!showFullContent);
                      }}
                      className="ml-1 text-primary hover:underline font-medium"
                    >
                      {showFullContent ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </p>
                
                {localPost.tags && localPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {localPost.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-3 text-xs text-text-tertiary">
                  <span>{localPost.likeCount || 0} likes</span>
                  <span className="text-sm">Comments {comments.length}</span>
                  <span>{localPost.shareCount || 0} shares</span>
                  <span>{localPost.saveCount || 0} saves</span>
                </div>
              </div>
       

            </div>
            
            {showActions && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLikeClick}
                    disabled={isLoading}
                    className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-text-tertiary hover:text-red-500'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLiked ? (
                      <FaHeart className="w-4 h-4" />
                    ) : (
                      <FaRegHeart className="w-4 h-4" />
                    )}
                    <span className="text-sm">Like</span>
                  </button>
                  <button
                    onClick={handleCommentClick}
                    className="flex items-center gap-1 text-text-tertiary hover:text-blue-500"
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm"> {comments.length || 0}</span>
                   
                  </button>
                  {renderShareButton()}
                </div>
                <button
                  onClick={handleSaveClick}
                  disabled={isLoading}
                  className={`${isSaved ? 'text-yellow-500' : 'text-text-tertiary hover:text-yellow-500'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaved ? (
                                        <div>
                      <FaBookmark className="w-4 h-4" />
                    {localPost.saveCount || 0}
                      </div>
                  ) : (
                    <FaRegBookmark className="w-4 h-4" />
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

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <>
        <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
          {/* Author Header */}
          {showAuthor && localPost.author && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${localPost.author.id}`}>
                    <img
                      src={localPost.author.avatar || '/images/avatars/default.png'}
                      alt={localPost.author.fullName}
                      className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div>
                    <Link 
                      href={`/profile/${localPost.author.id}`}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      <span className="font-medium text-text-primary">
                        {localPost.author.fullName}
                      </span>
                      {localPost.author.isVerified && (
                        <span className="text-xs px-1 py-0.5 bg-primary text-white rounded-full">✓</span>
                      )}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
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
                  {renderFollowButton()}
                </div>
                <button className="text-text-tertiary hover:text-text-primary p-1">
                  <FaEllipsisH className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          <div className="p-4">
            <h1 className="text-xl font-bold text-text-primary mb-3">{localPost.title}</h1>
            
            <p className="text-text-secondary mb-4 whitespace-pre-line">
              {localPost.content}
            </p>
            
            {localPost.images && localPost.images.length > 0 && (
              <div className="mb-4">
                <img
                  src={localPost.images[0]}
                  alt={localPost.title || 'Post image'}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
            )}
            
            {localPost.tags && localPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {localPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-6 py-3 border-t border-border text-text-tertiary">
              <span>{localPost.likeCount || 0} likes</span>
              <span>{localPost.commentCount || 0} comments</span>
              <span>{localPost.shareCount || 0} shares</span>
              <span>{localPost.saveCount || 0} saves</span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLikeClick}
                  disabled={isLoading}
                  className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-text-tertiary hover:text-red-500'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLiked ? (
                    <FaHeart className="w-5 h-5" />
                  ) : (
                    <FaRegHeart className="w-5 h-5" />
                  )}
                  <span className="font-medium">Like</span>
                </button>
                  <button
                    onClick={handleCommentClick}
                    className="flex items-center gap-1 text-text-tertiary hover:text-blue-500"
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm"> {comments.length || 0}</span>
                   
                  </button>
                {renderShareButton()}
              </div>
              <button
                onClick={handleSaveClick}
                disabled={isLoading}
                className={`flex items-center gap-2 ${isSaved ? 'text-yellow-500' : 'text-text-tertiary hover:text-yellow-500'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaved ? (
                                     <div>
                      <FaBookmark className="w-5 h-5" />
                    {localPost.saveCount || 0}
                      </div>
                ) : (
                  <FaRegBookmark className="w-5 h-5" />
                )}
                <span className="font-medium">{isSaved ? 'Saved' : 'Save'}</span>
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

  // Grid variant (default)
  return (
    <>
      <Link href={`/post/${localPost.id}`}>
        <div className="bg-surface rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
          {showAuthor && localPost.author && (
            <div className="flex items-center gap-2 p-4 pb-2">
              <Link href={`/profile/${localPost.author.id}`}>
                <img
                  src={localPost.author.avatar || '/images/avatars/default.png'}
                  alt={localPost.author.fullName}
                  className="w-8 h-8 rounded-full object-cover hover:opacity-90 transition-opacity"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Link 
                    href={`/profile/${localPost.author.id}`}
                    className="flex items-center gap-1 hover:opacity-80"
                  >
                    <span className="font-medium text-sm text-text-primary truncate">
                      {localPost.author.fullName}
                    </span>
                    {localPost.author.isVerified && (
                      <span className="text-xs px-1 py-0.5 bg-primary text-white rounded-full flex-shrink-0">✓</span>
                    )}
                  </Link>
                  {renderFollowButton()}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
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
              <button className="text-text-tertiary hover:text-text-primary p-1">
                <FaEllipsisH className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {localPost.images && localPost.images.length > 0 && (
            <div className="aspect-square relative">
              <img
                src={localPost.images[0]}
                alt={localPost.title || 'Post image'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {localPost.postType === PostType.RECIPE && (
                <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <FaUtensils className="w-3 h-3" />
                  Recipe
                </div>
              )}
              {showPrivacy && (
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  {getPrivacyIcon()}
                </div>
              )}
            </div>
          )}
          
          <div className="p-4">
            <h3 className="font-bold text-text-primary text-base mb-1">{localPost.title}</h3>
            
            <p className="text-text-secondary text-sm mb-2 line-clamp-2">
              {contentPreview}
            </p>
            
            {localPost.tags && localPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {localPost.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {localPost.location && (
              <div className="flex items-center gap-1 mb-3 text-xs text-text-tertiary">
                <FaMapMarkerAlt className="w-3 h-3" />
                <span>{localPost.location}</span>
              </div>
            )}
            
            {showActions && (
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLikeClick}
                    disabled={isLoading}
                    className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-text-tertiary hover:text-red-500'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLiked ? (
                      <FaHeart className="w-4 h-4" />
                    ) : (
                      <FaRegHeart className="w-4 h-4" />
                    )}
                    <span className="text-sm">{localPost.likeCount || 0}</span>
                  </button>
                  <button
                    onClick={handleCommentClick}
                    className="flex items-center gap-1 text-text-tertiary hover:text-blue-500"
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm">{localPost.commentCount || 0}</span>
                  </button>
                  {renderShareButton()}
                </div>
                <button
                  onClick={handleSaveClick}
                  disabled={isLoading}
                  className={`${isSaved ? 'text-yellow-500' : 'text-text-tertiary hover:text-yellow-500'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaved ? (
                                        <div>
                      <FaBookmark className="w-4 h-4" />
                    {localPost.saveCount || 0}
                      </div>
                  ) : (
                     <FaRegBookmark className="w-4 h-4" /> 
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