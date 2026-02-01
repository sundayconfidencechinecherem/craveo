// src/app/profile/page.tsx - OPTIMIZED VERSION
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useCurrentUser,
  useUserPosts,
  useSavedPosts
} from '@/app/hooks/useGraphQL';
import { Post, PostType } from '@/app/graphql/types';
import ProfileHeader from '@/app/components/ProfileHeader';
import ProfileTabs from '@/app/components/ProfileTabs';
import PostGrid from '@/app/components/PostGrid';
import ProfileStats from '@/app/components/ProfileStats';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { FaEdit, FaSync } from 'react-icons/fa';

type TabType = 'posts' | 'recipes' | 'liked' | 'saved';

export default function MyProfilePage() {
  const router = useRouter();
  
  // Get current user data
  const { 
    user: currentUser, 
    loading: userLoading, 
    error: userError,
    refetch: refetchUser 
  } = useCurrentUser();
  
  // Get user's posts - Only fetch when userId is available
  const shouldFetchPosts = !!currentUser?.id;
  const { 
    posts: userPosts = [], 
    loading: postsLoading,
    error: postsError,
    refetch: refetchPosts 
  } = useUserPosts(currentUser?.id || '', 20);
  
  // Get saved posts - limit to 10 initially
  const { 
    posts: savedPosts = [], 
    loading: savedLoading,
    error: savedError,
    refetch: refetchSaved 
  } = useSavedPosts(10, 0);
  
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    saved: 0
  });

  // Memoized calculations
  const recipePosts = useMemo(() => {
    return (Array.isArray(userPosts) ? userPosts : []).filter(
      (post: Post) => post?.postType === PostType.RECIPE
    );
  }, [userPosts]);

  const counts = useMemo(() => ({
    posts: Array.isArray(userPosts) ? userPosts.length : 0,
    recipes: recipePosts.length,
    liked: 0, // You'll need to implement liked posts query
    saved: Array.isArray(savedPosts) ? savedPosts.length : 0,
  }), [userPosts, recipePosts, savedPosts]);

  // Update stats when data changes - with optimization
  useEffect(() => {
    if (currentUser && !isRefreshing) {
      setStats({
        posts: counts.posts,
        followers: currentUser.followerCount || 0,
        following: currentUser.followingCount || 0,
        saved: counts.saved
      });
    }
  }, [currentUser, counts.posts, counts.saved, isRefreshing]);

  // Handle edit profile
  const handleEditProfile = useCallback(() => {
    router.push('/profile/edit');
  }, [router]);

  // Handle refresh all data - optimized
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const promises = [];
      
      if (refetchUser) promises.push(refetchUser());
      if (refetchPosts && currentUser?.id) promises.push(refetchPosts());
      if (refetchSaved) promises.push(refetchSaved());
      
      if (promises.length > 0) {
        // Use Promise.allSettled to handle partial failures
        await Promise.allSettled(promises);
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      // Add a small delay to show refreshing state
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refetchUser, refetchPosts, refetchSaved, currentUser?.id, isRefreshing]);

  // Loading state
  if (userLoading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-app-bg pt-16 lg:pt-0">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (userError && !isRefreshing) {
    return (
      <div className="min-h-screen bg-app-bg pt-16 lg:pt-0">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          <div className="bg-error/10 border border-error/20 rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Error Loading Profile</h1>
            <p className="text-text-secondary mb-6">{userError.message}</p>
            <button
              onClick={handleRefresh}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!currentUser && !userLoading) {
    return null; // Will redirect in layout/ProtectedRoute
  }

  // Prepare user data for ProfileHeader - memoized
  const userForHeader = useMemo(() => ({
    id: currentUser?.id || '',
    username: currentUser?.username || '',
    fullName: currentUser?.fullName || currentUser?.username || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || '/images/avatars/default.png',
    coverPhoto: currentUser?.coverPhoto || '',
    followers: currentUser?.followerCount || 0,
    following: currentUser?.followingCount || 0,
    posts: counts.posts,
    isVerified: currentUser?.isVerified || false,
    location: currentUser?.location || '',
    website: currentUser?.website || '',
    isFollowing: false,
    isOwnProfile: true,
  }), [currentUser, counts.posts]);

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-app-bg pt-16 lg:pt-0 lg:ml-64">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          {/* Profile Header */}
          <div className="mb-8">
            <ProfileHeader
              user={userForHeader}
              onEditProfile={handleEditProfile}
            />
          </div>

          {/* Profile Stats */}
          <ProfileStats
            userId={currentUser?.id || ''}
            stats={stats}
            isOwnProfile={true}
          />

          {/* Refresh Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-text-primary rounded-lg hover:bg-surface-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={`${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Tabs and Content */}
          <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={counts}
            />
            
            <div className="p-6">
              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <PostGrid 
                  posts={userPosts || []} 
                  type="grid"
                  loading={postsLoading && !isRefreshing}
                  emptyMessage="You haven't posted anything yet"
                  emptyAction={() => router.push('/post/create')}
                  emptyActionText="Create First Post"
                />
              )}
              
              {/* Recipes Tab */}
              {activeTab === 'recipes' && (
                <PostGrid 
                  posts={recipePosts} 
                  type="list"
                  loading={false}
                  emptyMessage="You haven't shared any recipes yet"
                  emptyAction={() => router.push('/post/create?type=recipe')}
                  emptyActionText="Share a Recipe"
                />
              )}
              
              {/* Liked Tab */}
              {activeTab === 'liked' && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <span className="text-2xl">❤️</span>
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Liked Posts ({counts.liked})
                  </h3>
                  <p className="text-text-secondary mb-6 max-w-md mx-auto">
                    Posts you've liked will appear here. Like more posts to see them here!
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Explore Posts
                  </button>
                </div>
              )}
              
              {/* Saved Tab */}
              {activeTab === 'saved' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-text-primary">
                      Saved Posts ({counts.saved})
                    </h3>
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing || savedLoading}
                      className="text-sm text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                  <PostGrid
                    posts={savedPosts || []}
                    type="grid"
                    loading={savedLoading && !isRefreshing}
                    emptyMessage="No saved posts yet"
                    emptyAction={() => router.push('/')}
                    emptyActionText="Explore Posts"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}