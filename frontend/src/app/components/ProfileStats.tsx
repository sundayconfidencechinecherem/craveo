// src/app/components/ProfileStats.tsx - NEW COMPONENT
'use client';

import Link from 'next/link';
import { FaUserFriends, FaUsers, FaFileAlt, FaBookmark } from 'react-icons/fa';

interface ProfileStatsProps {
  userId: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
    saved: number;
  };
  isOwnProfile?: boolean;
}

export default function ProfileStats({ userId, stats, isOwnProfile = false }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Link 
        href={`/profile/${userId}/posts`}
        className="bg-surface-hover rounded-xl p-4 text-center hover:bg-surface-hover-dark transition-colors"
      >
        <div className="flex flex-col items-center">
          <FaFileAlt className="text-primary text-xl mb-2" />
          <div className="text-2xl font-bold text-text-primary">{stats.posts}</div>
          <div className="text-sm text-text-secondary">Posts</div>
        </div>
      </Link>
      
      <Link 
        href={`/profile/${userId}/followers`}
        className="bg-surface-hover rounded-xl p-4 text-center hover:bg-surface-hover-dark transition-colors"
      >
        <div className="flex flex-col items-center">
          <FaUsers className="text-primary text-xl mb-2" />
          <div className="text-2xl font-bold text-text-primary">{stats.followers}</div>
          <div className="text-sm text-text-secondary">Followers</div>
        </div>
      </Link>
      
      <Link 
        href={`/profile/${userId}/following`}
        className="bg-surface-hover rounded-xl p-4 text-center hover:bg-surface-hover-dark transition-colors"
      >
        <div className="flex flex-col items-center">
          <FaUserFriends className="text-primary text-xl mb-2" />
          <div className="text-2xl font-bold text-text-primary">{stats.following}</div>
          <div className="text-sm text-text-secondary">Following</div>
        </div>
      </Link>
      
      {isOwnProfile ? (
        <Link 
          href="/saved"
          className="bg-surface-hover rounded-xl p-4 text-center hover:bg-surface-hover-dark transition-colors"
        >
          <div className="flex flex-col items-center">
            <FaBookmark className="text-primary text-xl mb-2" />
            <div className="text-2xl font-bold text-text-primary">{stats.saved}</div>
            <div className="text-sm text-text-secondary">Saved</div>
          </div>
        </Link>
      ) : (
        <div className="bg-surface-hover rounded-xl p-4 text-center">
          <div className="flex flex-col items-center">
            <FaBookmark className="text-text-tertiary text-xl mb-2" />
            <div className="text-2xl font-bold text-text-primary">{stats.saved}</div>
            <div className="text-sm text-text-secondary">Saved</div>
          </div>
        </div>
      )}
    </div>
  );
}