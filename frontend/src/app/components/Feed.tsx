// src/app/components/Feed.tsx - RESPONSIVE STYLING FOR ALL SCREENS
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFeedPosts } from '@/app/hooks/useGraphQL';
import PostCard from '@/app/components/PostCard';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import { FaFire, FaUsers, FaRocket, FaBookmark, FaSync, FaArrowUp } from 'react-icons/fa';

// Define the exact feed types
type FeedType = 'all' | 'following' | 'trending' | 'saved';

interface FeedProps {
  showFilters?: boolean;
  feedType?: FeedType;
}

export default function Feed({ showFilters = true, feedType = 'all' }: FeedProps) {
  const [activeFeed, setActiveFeed] = useState<FeedType>(feedType);
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const limit = 10;

  // Fixed: Remove the third parameter if hook doesn't accept it
  const { posts: fetchedPosts, loading, error, loadMore, hasMore } = useFeedPosts(limit, page * limit);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
        !loading &&
        !isLoadingMore &&
        hasMore
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, isLoadingMore, hasMore]);

  // Update posts when fetchedPosts changes - WITH NULL CHECK
  useEffect(() => {
    if (fetchedPosts && Array.isArray(fetchedPosts)) {
      // Filter out any null or invalid posts
      const validPosts = fetchedPosts.filter(post => 
        post && 
        post.id && 
        typeof post.id === 'string' && 
        post.id.trim() !== ''
      );
      
      if (validPosts.length > 0) {
        if (page === 0) {
          setPosts(validPosts);
        } else {
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = validPosts.filter(post => !existingIds.has(post.id));
            return [...prev, ...newPosts];
          });
        }
      } else if (page === 0 && fetchedPosts.length === 0) {
        setPosts([]);
      }
    }
  }, [fetchedPosts, page]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      await loadMore();
      setPage(prev => prev + 1);
    } catch (error) {
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleFeedChange = (type: FeedType) => {
    setActiveFeed(type);
    setPosts([]);
    setPage(0);
  };

  const handleRefresh = () => {
    setPosts([]);
    setPage(0);
    window.location.reload();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Feed configuration for buttons
  const feedButtons = [
    { type: 'all' as FeedType, icon: <FaRocket />, label: 'For You' },
    { type: 'following' as FeedType, icon: <FaUsers />, label: 'Following' },
    { type: 'trending' as FeedType, icon: <FaFire />, label: 'Trending' },
    { type: 'saved' as FeedType, icon: <FaBookmark />, label: 'Saved' }
  ];

  if (loading && posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-text-secondary mt-4">Loading posts...</p>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="bg-error/10 border border-error/20 rounded-xl p-8 text-center">
        <h3 className="text-lg font-bold text-text-primary mb-2">Error Loading Feed</h3>
        <p className="text-text-secondary mb-4">{error?.message || 'Unknown error'}</p>
        <Button onClick={handleRefresh} variant="primary" icon={<FaSync />}>
          Try Again
        </Button>
      </div>
    );
  }

  // Filter posts to ensure no null posts
  const validPosts = posts.filter(post => 
    post && 
    post.id && 
    typeof post.id === 'string' && 
    post.id.trim() !== ''
  );

  return (
    <div className="relative">
      {/* Feed Header with Filters - Responsive */}
      {showFilters && (
        <div className="sticky top-16 z-30 bg-app-bg/95 backdrop-blur-sm border-b border-surface-hover/30 mb-6 -mx-4 px-4 py-3 
                      sm:-mx-6 sm:px-6
                      lg:top-6 lg:mx-0 lg:px-0 lg:border lg:rounded-2xl lg:bg-surface lg:p-1 lg:mb-8">
          <div className="flex overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {feedButtons.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => handleFeedChange(type)}
                className={`flex flex-shrink-0 items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                          ${activeFeed === type 
                            ? 'bg-primary text-white shadow-md scale-105' 
                            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                          }
                          mx-1 first:ml-0 last:mr-0
                          min-w-[120px] justify-center
                          lg:min-w-[140px]`}
              >
                <span className="text-sm lg:text-base">{icon}</span>
                <span className="text-sm lg:text-base">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Feed Content - Responsive width for Twitter-style layout */}
      <div className={`space-y-4
                     ${showFilters ? 'mt-0' : 'mt-4'}
                     px-0 sm:px-0
                     max-w-full mx-auto
                     lg:px-0`}>
        {validPosts.length === 0 && !loading ? (
          <div className="text-center py-12 lg:py-16">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-primary/10
                          lg:w-20 lg:h-20">
              <FaRocket className="w-8 h-8 text-primary/50 lg:w-10 lg:h-10" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2 lg:text-2xl">No posts yet</h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm lg:text-base">
              Be the first to share your food adventures! Create a post and start inspiring others.
            </p>
          </div>
        ) : (
          validPosts.map((post: any) => (
            <div key={post.id} className="animate-fade-in">
              <PostCard
                post={post}
                variant="list"
                showActions
                showAuthor
                showPrivacy
                showCounts
              />
            </div>
          ))
        )}

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="py-8 text-center">
            <LoadingSpinner size="md" />
            <p className="text-text-secondary mt-2 text-sm lg:text-base">Loading more posts...</p>
          </div>
        )}

        {/* End of Feed */}
        {!hasMore && validPosts.length > 0 && (
          <div className="text-center py-8 border-t border-surface-hover/30">
            <div className="inline-flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-3">
                <FaArrowUp className="text-primary/50 text-lg" />
              </div>
              <p className="text-text-secondary font-medium text-sm lg:text-base">You've reached the end!</p>
              <p className="text-text-tertiary text-xs lg:text-sm mt-1">Scroll up to see more delicious content</p>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button - Mobile Only */}
      {validPosts.length > 3 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 active:scale-95 z-40
                    sm:bottom-8 sm:right-6
                    lg:hidden"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-lg" />
        </button>
      )}

      {/* Refresh FAB - Desktop */}
      <button
        onClick={handleRefresh}
        className="hidden lg:flex fixed right-8 bottom-8 w-14 h-14 bg-primary text-white rounded-full items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 z-40 group"
        aria-label="Refresh feed"
      >
        <FaSync className="text-xl group-hover:rotate-180 transition-transform duration-500" />
      </button>
    </div>
  );
}