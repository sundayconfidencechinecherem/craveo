// src/app/components/ProfileHeader.tsx
'use client';

import { useState } from 'react';
import { useFollowUser, useCurrentUser } from '@/app/hooks/useGraphQL';
import { FaCamera, FaEdit, FaUserPlus, FaUserCheck, FaMapMarkerAlt, FaLink } from 'react-icons/fa';
import Link from 'next/link';

interface ProfileHeaderProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    bio?: string;
    avatar?: string;
    coverPhoto?: string;
    followers?: number;
    following?: number;
    posts?: number;
    isVerified?: boolean;
    location?: string;
    website?: string;
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowToggle?: () => void; // callback for follow/unfollow
  onEditProfile?: () => void;
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing: initialFollowing,
  onFollowToggle,
  onEditProfile,
}: ProfileHeaderProps) {
  const { user: currentUser } = useCurrentUser();
  const { followUser, loading: followLoading } = useFollowUser();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(user.followers || 0);

  const handleFollow = async () => {
    if (followLoading || !currentUser) return;

    try {
      if (onFollowToggle) {
        await onFollowToggle();
      } else {
        await followUser(user.id);
      }
      setIsFollowing(!isFollowing);
      setFollowerCount(prev => (isFollowing ? Math.max(0, prev - 1) : prev + 1));
    } catch (error) {
      //console.error('Failed to follow user:', error);
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-secondary/20">
        {user.coverPhoto && (
          <img
            src={user.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {isOwnProfile && onEditProfile && (
          <button
            onClick={onEditProfile}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2 z-10"
          >
            <FaEdit /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 md:px-8 pb-6 -mt-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                <img
                  src={user.avatar || '/images/avatars/default.png'}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {isOwnProfile && (
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg">
                  <FaCamera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                  {user.fullName}
                </h1>
                {user.isVerified && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-text-secondary mb-2">@{user.username}</p>

              {user.bio && (
                <p className="text-text-primary max-w-2xl mb-4">{user.bio}</p>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 mb-4">
                {user.location && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <FaMapMarkerAlt />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <a
                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    <FaLink />
                    <span>{user.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-text-primary">
                    {user.posts?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-text-secondary">Posts</div>
                </div>
                <Link href={`/profile/${user.id}/followers`} className="text-center hover:opacity-80">
                  <div className="text-xl font-bold text-text-primary">
                    {followerCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-secondary">Followers</div>
                </Link>
                <Link href={`/profile/${user.id}/following`} className="text-center hover:opacity-80">
                  <div className="text-xl font-bold text-text-primary">
                    {user.following?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-text-secondary">Following</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 md:mt-0">
            {isOwnProfile ? (
              onEditProfile && (
                <button
                  onClick={onEditProfile}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <FaEdit /> Edit Profile
                </button>
              )
            ) : (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  isFollowing
                    ? 'bg-surface-hover text-text-primary hover:bg-surface-hover-dark'
                    : 'bg-primary text-white hover:bg-primary-dark'
                } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isFollowing ? (
                  <>
                    <FaUserCheck /> Following
                  </>
                ) : (
                  <>
                    <FaUserPlus /> Follow
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
