// src/app/profile/[id]/page.tsx - FIX THE SAVED POSTS SECTION
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useGetUser, 
  useUserPosts,
  useFollowUser,
  useCurrentUser,
  useSavedPosts // ADD THIS IMPORT
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
  
  // Get current logged in user
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser();
  
  // Get profile user data
  const { 
    user: profileUser, 
    loading: profileLoading, 
    error: profileError 
  } = useGetUser(userId);
  
  // Get user's posts
  const { 
    posts: userPosts, 
    loading: postsLoading 
  } = useUserPosts(userId);
  
  // Get saved posts for current user (only if viewing own profile)
  const { 
    posts: savedPosts,  // FIXED: Change from savedPosts to posts
    loading: savedPostsLoading,
    refetch: refetchSavedPosts 
  } = useSavedPosts(20, 0);
  
  // Follow/unfollow mutation
  const { followUser, loading: followLoading } = useFollowUser();
  
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Determine if viewing own profile
  useEffect(() => {
    if (currentUser && profileUser) {
      const ownProfile = currentUser.id === profileUser.id;
      setIsOwnProfile(ownProfile);
      
      // Check if current user is following this profile
      const following = profileUser.followers?.some(
        (follower: any) => {
          if (typeof follower === 'object') {
            return follower.id === currentUser.id;
          }
          return false;
        }
      ) || false;
      setIsFollowing(following);
    }
  }, [currentUser, profileUser]);

  // Calculate recipe posts
  const recipePosts = (userPosts || []).filter(
    (post: Post) => post.postType === PostType.RECIPE
  );

  // Get liked posts (empty for now - implement if needed)
  const likedPosts: Post[] = [];

  // Calculate counts
  const counts = {
    posts: userPosts?.length || 0,
    recipes: recipePosts.length,
    liked: likedPosts.length,
    saved: isOwnProfile ? savedPosts.length : 0, // Use savedPosts (now correctly named)
  };

  // ... rest of your profile page code remains the same ...

  return (
    <div className="min-h-screen bg-app-bg pt-16 lg:pt-0">
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* ... Your existing profile header and tabs code ... */}
        
        {/* Tabs and Content */}
        <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />
          
          <div className="p-6">
            {/* ... Your existing tabs for posts, recipes, liked ... */}
            
            {activeTab === 'saved' && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <span className="text-2xl">📌</span>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {isOwnProfile ? 'Your Saved Posts' : 'Saved Posts'}
                </h3>
                {isOwnProfile ? (
                  <>
                    {savedPostsLoading ? (
                      <>
                        <LoadingSpinner />
                        <p className="text-text-secondary mt-4">Loading saved posts...</p>
                      </>
                    ) : savedPosts.length > 0 ? (
                      <PostGrid
                        posts={savedPosts}
                        type="grid"
                        loading={false}
                        emptyMessage="No saved posts"
                      />
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
                    )}
                  </>
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