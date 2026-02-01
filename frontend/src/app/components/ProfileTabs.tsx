// src/app/components/ProfileTabs.tsx - CREATE THIS
'use client';

import { FaThLarge, FaList, FaHeart, FaBookmark } from 'react-icons/fa';

interface ProfileTabsProps {
  activeTab: 'posts' | 'recipes' | 'liked' | 'saved';
  onTabChange: (tab: 'posts' | 'recipes' | 'liked' | 'saved') => void;
  counts: {
    posts: number;
    recipes: number;
    liked: number;
    saved: number;
  };
}

export default function ProfileTabs({ activeTab, onTabChange, counts }: ProfileTabsProps) {
  const tabs = [
    { id: 'posts' as const, label: 'Posts', icon: <FaThLarge />, count: counts.posts },
    { id: 'recipes' as const, label: 'Recipes', icon: <FaList />, count: counts.recipes },
    { id: 'liked' as const, label: 'Liked', icon: <FaHeart />, count: counts.liked },
    { id: 'saved' as const, label: 'Saved', icon: <FaBookmark />, count: counts.saved },
  ];

  return (
    <div className="border-b border-border">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-surface-hover text-text-secondary'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}