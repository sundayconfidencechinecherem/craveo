// src/app/components/PostGrid.tsx - UPDATED
'use client';

import { useState } from 'react';
import { FaTh, FaList } from 'react-icons/fa';
import PostCard from './PostCard';
import { Post } from '@/app/graphql/types';

interface PostGridProps {
  posts: Post[];
  type: 'grid' | 'list';
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: () => void; // Add this
  emptyActionText?: string; // Add this
}

export default function PostGrid({ 
  posts, 
  type, 
  loading = false,
  emptyMessage = "No posts to show",
  emptyAction,
  emptyActionText
}: PostGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(type);

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* View Mode Toggle Skeleton */}
        <div className="flex justify-end mb-6">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-2 w-20 bg-gray-300"></div>
            <div className="px-4 py-2 w-20 bg-gray-300"></div>
          </div>
        </div>
        
        {/* Grid/List Skeleton */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-surface rounded-xl overflow-hidden">
                <div className="aspect-square bg-gray-300" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-4 w-12 bg-gray-300 rounded" />
                    <div className="h-4 w-12 bg-gray-300 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface rounded-xl p-4 flex gap-4">
                <div className="w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                  <div className="h-3 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/4" />
                  <div className="flex gap-4 pt-2">
                    <div className="h-4 w-8 bg-gray-300 rounded" />
                    <div className="h-4 w-8 bg-gray-300 rounded" />
                    <div className="h-4 w-8 bg-gray-300 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary mb-2">{emptyMessage}</div>
        {emptyAction && emptyActionText && (
          <button
            onClick={emptyAction}
            className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            {emptyActionText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 flex items-center gap-2 ${
              viewMode === 'grid' 
                ? 'bg-primary text-white' 
                : 'bg-surface text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <FaTh className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 flex items-center gap-2 ${
              viewMode === 'list' 
                ? 'bg-primary text-white' 
                : 'bg-surface text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <FaList className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Posts Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}