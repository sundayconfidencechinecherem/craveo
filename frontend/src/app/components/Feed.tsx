// src/app/components/Feed.tsx - FIXED VERSION
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

  // Update posts when fetchedPosts changes
  useEffect(() => {
    if (fetchedPosts.length > 0) {
      if (page === 0) {
        setPosts(fetchedPosts);
      } else {
        setPosts(prev => [...prev, ...fetchedPosts]);
      }
    }
  }, [fetchedPosts, page]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
    try {
      await loadMore();
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleFeedChange = (type: FeedType) => {
    setActiveFeed(type);
    setPosts([]);
    setPage(0);
    console.log('Switching to feed:', type);
  };

  const handleRefresh = () => {
    setPosts([]);
    setPage(0);
    window.location.reload();
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
        <p className="text-text-secondary mb-4">{error.message}</p>
        <Button onClick={handleRefresh} variant="primary" icon={<FaSync />}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feed Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {feedButtons.map(({ type, icon, label }) => (
            <Button
              key={type}
              variant={activeFeed === type ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFeedChange(type)}
              icon={icon}
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      <div className="space-y-4">
        {posts.map((post: any) => ( // Fixed: Added type annotation
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
        ))}

        {isLoadingMore && (
          <div className="py-8 text-center">
            <LoadingSpinner size="md" />
            <p className="text-text-secondary mt-2">Loading more posts...</p>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 border-t border-border">
            <p className="text-text-secondary font-medium mb-1">You're all caught up!</p>

          </div>
        )}

      </div>
    </div>
  );
}