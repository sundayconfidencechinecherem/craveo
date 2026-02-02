// src/app/components/Comments.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useAddComment, useCurrentUser, useGetComments } from '@/app/hooks/useGraphQL';
import { formatDistanceToNow } from 'date-fns';
import { FaPaperPlane } from 'react-icons/fa';

interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    isVerified: boolean;
  };
  replies: any[];
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user: currentUser } = useCurrentUser();
  const { addComment, loading: mutationLoading } = useAddComment();
  const { comments: existingComments = [], loading: commentsLoading } = useGetComments(postId);
  
  const [comments, setComments] = useState<Comment[]>(existingComments);

  // Sync comments when existingComments changes
  useEffect(() => {
    if (existingComments && existingComments.length > 0) {
      setComments(existingComments);
    }
  }, [existingComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || loading) return;
    
    setLoading(true);
    setError(null);
    
    const commentContent = newComment.trim();
    
    try {
      // Create optimistic comment
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        postId: postId,
        content: commentContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar || '/images/avatars/default.png',
          isVerified: currentUser.isVerified || false
        },
        replies: []
      };
      
      // Add optimistic comment immediately
      setComments(prev => [optimisticComment, ...prev]);
      setNewComment('');
      
     // console.log('🟡 Sending comment:', { postId, content: commentContent });
      
      // Call the mutation WITHOUT refetching
      const result = await addComment(postId, commentContent);
      
      //console.log('🟢 Mutation result:', result);
      
      if (result?.data?.addComment?.success) {
      //  console.log('✅ Comment added successfully via cache update');
        // Apollo cache update in the hook will handle replacing the temp comment
      } else {
        // Handle failure - remove optimistic comment
        setComments(prev => prev.filter(c => !c.id.startsWith('temp-')));
        
        const errorMsg = result?.errors?.[0]?.message || 
                        result?.data?.addComment?.message || 
                        'Failed to post comment';
        setError(errorMsg);
        //console.error('❌ Comment failed:', result);
      }
      
    } catch (error: any) {
     // console.error('💥 Failed to post comment:', error);
      //console.error('GraphQL Errors:', error.graphQLErrors);
     // console.error('Network Error:', error.networkError);
      
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => !c.id.startsWith('temp-')));
      
      // Set error message
      setError(error?.message || 'An error occurred while posting comment');
      
      // Restore the comment text so user can try again
      setNewComment(commentContent);
      
    } finally {
      setLoading(false);
    }
  };
  
  // Add debug logging
  useEffect(() => {
   // console.log('📊 Comments state updated:', comments.length, 'comments');
   // console.log('📊 Existing comments from hook:', existingComments.length);
  }, [comments, existingComments]);
  
  return (
    <div className="bg-surface rounded-xl shadow-lg p-4">
      <h3 className="font-semibold text-text-primary mb-4">
        Comments ({comments.length})
      </h3>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Debug info - remove in production */}
      <div className="mb-2 text-xs text-gray-500">
        <div>Post ID: {postId}</div>
        <div>User: {currentUser ? currentUser.username : 'Not logged in'}</div>
        <div>Comments in state: {comments.length}</div>
      </div>
      
      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <img
              src={currentUser.avatar || '/images/avatars/default.png'}
              alt={currentUser.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  setError(null);
                }}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary resize-none"
                rows={2}
                disabled={loading || mutationLoading}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-text-tertiary">
                  {loading || mutationLoading ? 'Posting...' : ''}
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || loading || mutationLoading}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    newComment.trim() && !loading && !mutationLoading
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-surface-hover text-text-tertiary cursor-not-allowed'
                  }`}
                >
                  <FaPaperPlane />
                  {loading || mutationLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-surface-hover rounded-lg text-center text-text-secondary">
          Please log in to comment
        </div>
      )}
      
      {/* Comments List */}
      <div className="space-y-4">
        {commentsLoading ? (
          <div className="text-center py-8 text-text-secondary">
            Loading comments...
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
              <div className="flex gap-3">
                <img
                  src={comment.author.avatar || '/images/avatars/default.png'}
                  alt={comment.author.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary text-sm">
                        {comment.author.fullName}
                      </span>
                      {comment.author.isVerified && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-text-tertiary">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-text-primary mt-1 text-sm">{comment.content}</p>
                  {comment.id.startsWith('temp-') && (
                    <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                      <span className="animate-pulse">●</span>
                      Posting...
                    </div>
                  )}
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
  );
}