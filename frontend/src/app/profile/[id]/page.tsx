'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useGetUser, 
  useUserPosts,
  useFollowUser,
  useCurrentUser,
  useSavedPosts
} from '@/app/hooks/useGraphQL';
import { Post, PostType } from '@/app/graphql/types';
import ProfileHeader from '@/app/components/ProfileHeader';
import ProfileTabs from '@/app/components/ProfileTabs';
import PostGrid from '@/app/components/PostGrid';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { FaEdit, FaCamera, FaEllipsisH } from 'react-icons/fa';

type TabType = 'posts' | 'recipes' | 'liked' | 'saved';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  // Current logged-in user
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser();
  
  // Profile user data
  const { 
    user: profileUser, 
    loading: profileLoading, 
    error: profileError 
  } = useGetUser(userId);
  
  // User's posts
  const { 
    posts: userPosts, 
    loading: postsLoading 
  } = useUserPosts(userId);
  
  // Saved posts (current user only)
  const { 
    posts: savedPosts,
    loading: savedPostsLoading,
    refetch: refetchSavedPosts
  } = useSavedPosts(20, 0);
  
  // Follow/unfollow mutation
  const { followUser, loading: followLoading } = useFollowUser();
  
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Determine own profile & following status
  useEffect(() => {
    if (currentUser && profileUser) {
      setIsOwnProfile(currentUser.id === profileUser.id);

      const following = profileUser.followers?.some(
        (follower: any) => follower?.id === currentUser.id
      ) || false;

      setIsFollowing(following);
    }
  }, [currentUser, profileUser]);

  // Recipe posts
  const recipePosts = (userPosts || []).filter(
    (post: Post) => post.postType === PostType.RECIPE
  );

  // Liked posts placeholder
  const likedPosts: Post[] = [];

  // Tab counts
  const counts = {
    posts: userPosts?.length || 0,
    recipes: recipePosts.length,
    liked: likedPosts.length,
    saved: isOwnProfile ? savedPosts.length : 0,
  };

  if (profileLoading || currentUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="text-center mt-32">
        <p className="text-text-secondary">Error loading profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg pt-16 lg:pt-0">
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Profile header */}
        {profileUser && (
          <ProfileHeader 
            user={profileUser} 
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            onFollowToggle={() => followUser(profileUser.id)}
          />
        )}

        {/* Tabs and content */}
        <div className="bg-surface rounded-xl shadow-lg overflow-hidden mt-6">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />

          <div className="p-6">
            {activeTab === 'posts' && (
              <PostGrid posts={userPosts} type="grid" loading={postsLoading} emptyMessage="No posts yet" />
            )}
            {activeTab === 'recipes' && (
              <PostGrid posts={recipePosts} type="grid" loading={postsLoading} emptyMessage="No recipe posts" />
            )}
            {activeTab === 'liked' && (
              <PostGrid posts={likedPosts} type="grid" loading={false} emptyMessage="No liked posts" />
            )}
            {activeTab === 'saved' && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <span className="text-2xl">📌</span>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {isOwnProfile ? 'Your Saved Posts' : 'Saved Posts'}
                </h3>
                {isOwnProfile ? (
                  savedPostsLoading ? (
                    <>
                      <LoadingSpinner />
                      <p className="text-text-secondary mt-4">Loading saved posts...</p>
                    </>
                  ) : savedPosts.length > 0 ? (
                    <PostGrid posts={savedPosts} type="grid" loading={false} emptyMessage="No saved posts" />
                  ) : (
                    <>
                      <p className="text-text-secondary mb-6">
                        Posts you've saved will appear here
                      </p>
                      <button
                        onClick={() => router.push('/')}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Explore Feed
                      </button>
                    </>
                  )
                ) : (
                  <p className="text-text-secondary mb-6">
                    Only the user can see their saved posts
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
