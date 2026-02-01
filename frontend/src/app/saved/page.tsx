'use client';

import { useState, useEffect } from 'react';
import { useSavedPosts, useCurrentUser } from '@/app/hooks/useGraphQL';
import PostGrid from '@/app/components/PostGrid';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { FaBookmark, FaSync, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/app/graphql/types';

export default function SavedPostsPage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const { 
    posts: savedPosts, 
    loading: postsLoading, 
    error: postsError, 
    refetch: refetchSavedPosts 
  } = useSavedPosts(20, 0);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const limit = 20;

  // Combine posts from all pages
  useEffect(() => {
    if (savedPosts && savedPosts.length > 0) {
      if (page === 0) {
        setAllPosts(savedPosts);
      } else {
        setAllPosts(prev => [...prev, ...savedPosts]);
      }
    }
  }, [savedPosts, page]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refetchSavedPosts) {
        await refetchSavedPosts();
      }
      setPage(0);
      setAllPosts([]); // ✅ clear before refetch
    } catch (error) {
      console.error('Failed to refresh saved posts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // Loading user state
  if (userLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-app-bg pt-16 lg:pt-0 lg:ml-64">
          <div className="container mx-auto px-4 max-w-6xl py-8">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Redirect if not logged in
  if (!currentUser) {
    router.push('/auth/login');
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-app-bg pt-16 lg:pt-0 lg:ml-64">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                href="/profile"
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-3">
                  <FaBookmark className="text-yellow-500" />
                  Saved Posts
                </h1>
                <p className="text-text-secondary">
                  Posts you've saved for later ({allPosts?.length || 0})
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-text-tertiary">
                {postsError && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg">
                    Failed to load saved posts: {postsError.message}
                  </div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || postsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <FaSync className={`${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Content */}
          {postsLoading && !isRefreshing ? (
            <div className="py-12">
              <LoadingSpinner />
              <p className="text-center text-text-secondary mt-4">Loading saved posts...</p>
            </div>
          ) : allPosts && allPosts.length > 0 ? (
            <>
              <PostGrid
                posts={allPosts}
                type="grid"
                loading={false}
                emptyMessage="No saved posts"
              />
              
              {/* Load More Button */}
              {savedPosts && savedPosts.length >= limit && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-surface-hover text-text-primary rounded-lg hover:bg-surface-hover-dark transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface rounded-xl shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <FaBookmark className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No saved posts yet
              </h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                When you save posts by clicking the bookmark icon, they'll appear here for easy access later.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Explore Posts
                </button>
                <button
                  onClick={handleRefresh}
                  className="bg-surface-hover text-text-primary px-6 py-3 rounded-lg hover:bg-surface-hover-dark transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
