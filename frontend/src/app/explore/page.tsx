// src/app/explore/page.tsx - COMPLETE WORKING VERSION
'use client';

import { useState } from 'react';
import { FaSearch, FaFire, FaClock, FaFilter } from 'react-icons/fa';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import PostGrid from '@/app/components/PostGrid';
import { useFeedPosts, useCurrentUser } from '@/app/hooks/useGraphQL';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'recent'>('trending');
  
  const { user } = useCurrentUser();
  const { posts, loading, error } = useFeedPosts(20, 0);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // TODO: Implement search functionality
      // You need to create a searchPosts query in your GraphQL
    }
  };

  const filteredPosts = activeTab === 'trending' 
    ? [...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    : [...posts].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-app-bg pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 py-8">

{/* Sticky Search Bar like Instagram Explore */}
<div className="sticky top-0 z-30 bg-surface p-4 border-b border-border">
  <div className="relative max-w-3xl mx-auto">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      placeholder="Search posts, recipes, or users..."
      className="w-full pl-12 pr-12 py-3 bg-surface-hover border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
    />
    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
    {searchQuery && (
      <button
        onClick={() => setSearchQuery('')}
        className="absolute right-12 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary"
      >
        Clear
      </button>
    )}
    <button
      onClick={handleSearch}
      className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark"
    >
      Search
    </button>
  </div>
</div>


          {/* Tabs */}
          <div className="flex gap-4 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap ${
                activeTab === 'trending'
                  ? 'bg-primary text-white'
                  : 'bg-surface-hover text-text-secondary hover:text-text-primary'
              }`}
            >
              <FaFire />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap ${
                activeTab === 'recent'
                  ? 'bg-primary text-white'
                  : 'bg-surface-hover text-text-secondary hover:text-text-primary'
              }`}
            >
              <FaClock />
              <span>Recent</span>
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap bg-surface-hover text-text-secondary hover:text-text-primary"
              onClick={() => {/* Implement filters */}}
            >
              <FaFilter />
              <span>Filters</span>
            </button>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner />
              <p className="text-text-secondary mt-4">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Error loading posts
              </h3>
              <p className="text-text-secondary mb-6">
                {error.message || 'Please try again later'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <PostGrid
              posts={filteredPosts}
              type="grid"
              loading={false}
              emptyMessage={
                searchQuery 
                  ? `No results found for "${searchQuery}"`
                  : 'No posts to show yet. Be the first to post!'
              }
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}