'use client';

import { useState } from 'react';
import { FaHeart, FaRegHeart, FaReply, FaEllipsisH } from 'react-icons/fa';
import Button from '@/app/components/Button';
import { Comment } from '@/app/graphql/types';

interface CommentsSectionProps {
  comments?: Comment[]; // Make it optional
  postId: string;
  onAddComment: (content: string) => Promise<void>;
  loading: boolean;
}

export default function CommentsSection({ 
  comments = [], // Default empty array
  postId, 
  onAddComment,
  loading 
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      //console.error('Failed to add comment:', error);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    
    try {
      // Find the comment to reply to
      const commentToReply = comments?.find(c => c.id === commentId);
      if (commentToReply) {
        await onAddComment(`@${commentToReply.author.username} ${replyText}`);
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-text-primary mb-6">Comments</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-300 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-lg p-4 lg:p-6">
      <h2 className="text-lg lg:text-xl font-bold text-text-primary mb-4 lg:mb-6">
        Comments ({comments?.length || 0}) {/* Safely access length */}
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary resize-none"
              rows={3}
            />
          </div>
          <div>
            <Button type="submit" disabled={!newComment.trim()}>
              Post
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 lg:space-y-6">
        {!comments || comments.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-border pb-4 lg:pb-6 last:border-0">
              <div className="flex gap-3">
                {/* User Avatar */}
                <img
                  src={comment.author.avatar || '/images/avatars/default.png'}
                  alt={comment.author.fullName}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover flex-shrink-0"
                />
                
                <div className="flex-1">
                  {/* Comment Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-bold text-text-primary text-sm lg:text-base">
                        {comment.author.fullName}
                      </span>
                      <span className="text-xs lg:text-sm text-text-secondary ml-2">
                        @{comment.author.username}
                      </span>
                    </div>
                    <button className="text-text-tertiary hover:text-text-primary">
                      <FaEllipsisH className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comment Content */}
                  <p className="text-text-primary mb-2 lg:mb-3 text-sm lg:text-base">
                    {comment.content}
                  </p>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 lg:gap-6 text-xs lg:text-sm">
                    <button className="flex items-center gap-1 lg:gap-2 text-text-secondary hover:text-red-500">
                      <FaRegHeart className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>Like</span>
                    </button>
                    <button 
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 lg:gap-2 text-text-secondary hover:text-blue-500"
                    >
                      <FaReply className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>Reply</span>
                    </button>
                    <span className="text-text-tertiary">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 ml-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to @${comment.author.username}...`}
                          className="flex-1 px-3 py-2 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyText.trim()}
                        >
                          Send
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}