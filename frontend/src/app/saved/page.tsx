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
      setAllPosts([]);
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
        <div className="min-h-screen bg-background">
          <div className="flex items-center justify-center h-screen">
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
      <div className="min-h-screen bg-background w-full">
        {/* Main Content Area - Full Width */}
        <div className="w-full pt-16 lg:pt-0">
          {/* Container for content only - no max width constraints */}
          <div className="w-full px-4 py-8 lg:px-8">
            {/* Header - Full width */}
            <div className="mb-8 w-full">
              <div className="flex items-center gap-4 mb-4 w-full">
                <Link 
                  href="/profile"
                  className="p-2 hover:bg-surface-hover rounded-lg transition-colors flex-shrink-0"
                  aria-label="Go back to profile"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-1 flex items-center gap-3">
                    <FaBookmark className="text-yellow-500 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
                    <span className="truncate">Saved Posts</span>
                  </h1>
                  <p className="text-text-secondary lg:text-lg truncate">
                    Posts you've saved for later ({allPosts?.length || 0})
                  </p>
                </div>
              </div>

              {/* Actions - Full width */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                <div className="w-full sm:w-auto flex-1">
                  {postsError && (
                    <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg text-sm w-full">
                      Failed to load saved posts: {postsError.message}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || postsLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 w-full sm:w-auto text-sm font-medium whitespace-nowrap flex-shrink-0"
                  aria-label={isRefreshing ? 'Refreshing saved posts' : 'Refresh saved posts'}
                >
                  <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Content Area - Full width */}
            {postsLoading && !isRefreshing ? (
              <div className="py-12 w-full">
                <div className="flex flex-col items-center w-full">
                  <LoadingSpinner size="lg" />
                  <p className="text-center text-text-secondary mt-4 text-lg w-full">Loading saved posts...</p>
                </div>
              </div>
            ) : allPosts && allPosts.length > 0 ? (
              <>
                {/* Post Grid - Full width with responsive columns */}
                <div className="w-full">
                  <PostGrid
                    posts={allPosts}
                    type="grid"
                    loading={false}
                    emptyMessage="No saved posts"
                    columns={{  base: 1,  sm: 2,  md: 3,  lg: 4,  xl: 5,
                    }}
                    containerClassName="w-full"
                  />
                </div>
                
                {/* Load More Button */}
                {savedPosts && savedPosts.length >= limit && (
                  <div className="text-center mt-8 w-full">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-3 bg-surface-hover text-text-primary rounded-lg hover:bg-surface-hover-dark transition-colors text-sm font-medium w-full sm:w-auto max-w-xs"
                      aria-label="Load more saved posts"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-surface rounded-xl shadow-lg p-8 text-center w-full">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <FaBookmark className="text-yellow-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2 w-full">
                  No saved posts yet
                </h3>
                <p className="text-text-secondary mb-6 w-full max-w-md mx-auto">
                  When you save posts by clicking the bookmark icon, they'll appear here for easy access later.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                  <button
                    onClick={() => router.push('/')}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium w-full sm:w-auto"
                    aria-label="Explore posts"
                  >
                    Explore Posts
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="bg-surface-hover text-text-primary px-6 py-3 rounded-lg hover:bg-surface-hover-dark transition-colors text-sm font-medium w-full sm:w-auto"
                    aria-label="Refresh saved posts"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}