'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCurrentUser,
  useUserPosts,
  useSavedPosts,
  useLikedPosts,
} from '@/app/hooks/useGraphQL';
import { Post, PostType } from '@/app/graphql/types';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import PostGrid from '@/app/components/PostGrid';
import ProfileTabs from '@/app/components/ProfileTabs';
import { FaSync, FaMapMarkerAlt, FaLink, FaCamera, FaUtensils, FaClock, FaFire, FaUsers } from 'react-icons/fa';

type TabType = 'posts' | 'recipes' | 'liked' | 'saved';

export default function MyProfilePage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading, error: userError, refetch: refetchUser } = useCurrentUser();

  const { posts: userPosts = [], loading: postsLoading, refetch: refetchPosts } = useUserPosts(currentUser?.id || '', 50);
  const { posts: savedPosts = [], loading: savedLoading, refetch: refetchSaved } = useSavedPosts(20, 0);
  const { posts: likedPosts = [], loading: likedLoading, refetch: refetchLiked } = useLikedPosts(currentUser?.id || '', 20);

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isRefreshing, setIsRefreshing] = useState(false);



  // Filter for recipe posts
  const recipePosts = useMemo(() => 
    userPosts.filter((p: any) => 
      p.postType === PostType.RECIPE || p.recipeDetails
    ), 
    [userPosts]
  );

  const counts = useMemo(() => ({
    posts: userPosts.length,
    recipes: recipePosts.length,
    liked: likedPosts.length,
    saved: savedPosts.length,
    followers: currentUser?.followerCount || 0,
    following: currentUser?.followingCount || 0,
  }), [userPosts, recipePosts, likedPosts, savedPosts, currentUser]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        refetchUser?.(),
        refetchPosts?.(),
        refetchSaved?.(),
        refetchLiked?.(),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refetchUser, refetchPosts, refetchSaved, refetchLiked, isRefreshing]);

  if (userLoading && !isRefreshing) return <LoadingSpinner size="lg" />;
  if (userError && !isRefreshing) return <div>Error: {userError.message}</div>;
  if (!currentUser && !userLoading) return null;

  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen bg-app-bg pt-16 lg:pt-0">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8">
       

          {/* Cover Photo */}
          <div className="relative h-48 sm:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10">
            {currentUser?.coverPhoto ? (
              <img 
                src={currentUser.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface/90 to-surface/70">
                <div className="text-center">
                  <FaCamera className="w-16 h-16 text-text-tertiary/60 mx-auto mb-4" />
                  <p className="text-text-secondary text-lg font-medium">No cover photo</p>
                </div>
              </div>
            )}
            <button
              onClick={() => router.push('/profile/edit')}
              className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm text-primary px-5 py-2.5 rounded-xl hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
            >
              <FaCamera className="w-4 h-4" />
              Edit Cover
            </button>
          </div>

          {/* Profile Header Section */}
          <div className="relative px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 -mt-16 sm:-mt-12">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-r from-primary to-primary-dark shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
                    <img
                      src={currentUser?.avatar || '/images/avatars/default.png'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <FaCamera className="w-4 h-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 mt-2 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary flex items-center gap-3">
                      {currentUser?.fullName}
                      {currentUser?.isVerified && (
                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          <span>✓</span>
                          Verified
                        </span>
                      )}
                    </h2>
                    <p className="text-text-tertiary text-lg lg:text-xl">@{currentUser?.username}</p>
                  </div>
                  
                  {/* Stats - Mobile Only */}
                  <div className="flex sm:hidden items-center justify-between w-full py-4 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">{counts.posts}</div>
                      <div className="text-sm text-text-secondary font-medium">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">{counts.followers}</div>
                      <div className="text-sm text-text-secondary font-medium">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">{counts.following}</div>
                      <div className="text-sm text-text-secondary font-medium">Following</div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-text-secondary mt-4 text-base lg:text-lg leading-relaxed">
                  {currentUser?.bio || 'No bio yet. Tell others about your food journey!'}
                </p>
              </div>
            </div>

            {/* Stats - Desktop Only */}
            <div className="hidden sm:flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <div className="text-center px-4 py-2">
                <div className="text-3xl font-bold text-primary mb-1">{counts.posts}</div>
                <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Posts</div>
              </div>
              <div className="text-center px-4 py-2">
                <div className="text-3xl font-bold text-primary mb-1">{counts.followers}</div>
                <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Followers</div>
              </div>
              <div className="text-center px-4 py-2">
                <div className="text-3xl font-bold text-primary mb-1">{counts.following}</div>
                <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Following</div>
              </div>
              <div className="text-center px-4 py-2">
                <div className="text-3xl font-bold text-primary mb-1">{counts.saved}</div>
                <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Saved</div>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end mt-8 mb-8">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-3 px-5 py-2.5 bg-surface border border-border text-text-primary rounded-xl hover:bg-surface-hover transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>

          {/* Tabs + Posts */}
          <div className="bg-surface rounded-2xl shadow-xl overflow-hidden border border-border/50">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

            <div className="p-4 sm:p-6">
              {activeTab === 'posts' && (
                <PostGrid 
                  posts={userPosts} 
                  type="grid" 
                  loading={postsLoading} 
                  emptyMessage="No post yet"
                />
              )}
              
              {activeTab === 'recipes' && (
                postsLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : recipePosts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-primary/10">
                      <FaUtensils className="w-10 h-10 text-primary/50" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-3">No Recipes Yet</h3>
                    <p className="text-text-secondary mb-6 max-w-md mx-auto">
                      Share your favorite recipes with the community! Your culinary creations are waiting to be discovered.
                    </p>
                    <button
                      onClick={() => router.push('/create-post?type=recipe')}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-lg hover:shadow-xl"
                    >
                      Create Your First Recipe
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-text-primary mb-6">
                      My Recipes ({recipePosts.length})
                    </h2>
                    {recipePosts.map((recipe: any) => {
                      //console.log('Rendering recipe:', recipe);
                      
                      return (
                        <div key={recipe.id} className="border border-border rounded-xl p-6 bg-surface hover:bg-surface-hover transition-colors shadow-sm">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Recipe Image */}
                            {recipe.images && recipe.images.length > 0 ? (
                              <div className="md:w-1/3">
                                <img 
                                  src={recipe.images[0]} 
                                  alt={recipe.title}
                                  className="w-full h-48 object-cover rounded-lg"
                                  onError={(e) => {
                                    //console.log('Image failed to load:', recipe.images[0]);
                                    e.currentTarget.src = '/images/placeholder-food.jpg';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="md:w-1/3 flex items-center justify-center bg-gray-100 rounded-lg">
                                <FaUtensils className="w-16 h-16 text-gray-300" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-text-primary mb-2">{recipe.title || 'Untitled Recipe'}</h3>
                              <p className="text-text-secondary mb-4">{recipe.content || 'No description'}</p>
                              
                              {recipe.recipeDetails ? (
                                <div className="space-y-4">
                                  {/* Recipe Stats */}
                                  <div className="flex flex-wrap gap-4">
                                    {recipe.recipeDetails.prepTime !== undefined && recipe.recipeDetails.prepTime > 0 && (
                                      <div className="flex items-center gap-2 text-sm bg-primary/5 px-3 py-1.5 rounded-lg">
                                        <FaClock className="w-3 h-3 text-primary" />
                                        <span className="font-medium">Prep:</span>
                                        <span>{recipe.recipeDetails.prepTime} mins</span>
                                      </div>
                                    )}
                                    {recipe.recipeDetails.cookTime !== undefined && recipe.recipeDetails.cookTime > 0 && (
                                      <div className="flex items-center gap-2 text-sm bg-primary/5 px-3 py-1.5 rounded-lg">
                                        <FaFire className="w-3 h-3 text-primary" />
                                        <span className="font-medium">Cook:</span>
                                        <span>{recipe.recipeDetails.cookTime} mins</span>
                                      </div>
                                    )}
                                    {recipe.recipeDetails.servings !== undefined && recipe.recipeDetails.servings > 0 && (
                                      <div className="flex items-center gap-2 text-sm bg-primary/5 px-3 py-1.5 rounded-lg">
                                        <FaUsers className="w-3 h-3 text-primary" />
                                        <span className="font-medium">Servings:</span>
                                        <span>{recipe.recipeDetails.servings}</span>
                                      </div>
                                    )}
                                    {recipe.recipeDetails.difficulty && (
                                      <div className="flex items-center gap-2 text-sm bg-primary/5 px-3 py-1.5 rounded-lg">
                                        <span className="font-medium">Difficulty:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          recipe.recipeDetails.difficulty.toLowerCase() === 'easy' ? 'bg-green-100 text-green-800' :
                                          recipe.recipeDetails.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {recipe.recipeDetails.difficulty}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Ingredients */}
                                  {recipe.recipeDetails.ingredients && recipe.recipeDetails.ingredients.length > 0 && (
                                    <div>
                                      <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                        <FaUtensils className="w-4 h-4" />
                                        Ingredients:
                                      </h4>
                                      <ul className="list-disc list-inside space-y-1 text-text-secondary">
                                        {recipe.recipeDetails.ingredients.map((ingredient: string, index: number) => (
                                          <li key={index} className="pl-2">{ingredient}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Instructions */}
                                  {recipe.recipeDetails.instructions && recipe.recipeDetails.instructions.length > 0 && (
                                    <div>
                                      <h4 className="font-bold text-text-primary mb-2">Instructions:</h4>
                                      <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                                        {recipe.recipeDetails.instructions.map((step: string, index: number) => (
                                          <li key={index} className="pl-2">{step}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-text-tertiary">
                                  <p>No recipe details available</p>
                                  <p className="text-sm mt-2">This recipe post doesn't have detailed information.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
              
              {activeTab === 'liked' && (
                <PostGrid 
                  posts={likedPosts} 
                  type="grid" 
                  loading={likedLoading} 
                  emptyMessage="No liked post yet"  
                />
              )}
              
              {activeTab === 'saved' && (
                <PostGrid 
                  posts={savedPosts} 
                  type="grid" 
                  loading={savedLoading} 
                  emptyMessage="No saved post yet"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}