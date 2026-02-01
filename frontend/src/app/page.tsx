// app/(app)/page.tsx - SIMPLIFIED FOR GLOBAL NAVBAR
'use client';

import { useState } from 'react';
import PromotionSidebar from '@/app/components/PromotionSidebar';
import PromotionScrollcard from '@/app/components/PromotionScrollCard';
import Feed from '@/app/components/Feed';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('for-you');

  return (
    <div>
     
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Content (8 columns) */}
          <main className="lg:col-span-8">
            {/* Feed Tabs */}
            <div className="sticky top-16 z-30 mb-6 rounded-xl border border-border bg-surface p-1 lg:top-6">
              <div className="flex overflow-x-auto">
                {[
                  { id: 'for-you', label: 'For You' },
                  { id: 'following', label: 'Following' },
                  { id: 'trending', label: 'Trending' },
                  { id: 'highlights', label: 'Highlights' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex min-w-[120px] flex-1 items-center justify-center whitespace-nowrap rounded-xl px-4 py-3 font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feed */}
            <Feed showFilters={false} />
          </main>

          {/* Right Sidebar (4 columns) */}
          <aside className="lg:col-span-4">
            <PromotionSidebar />
          </aside>
              {/* Mobile Promotion Scrollcard */}
      <div className="mb-6 lg:hidden">
        <PromotionScrollcard />
      </div>

        </div>
      </div>
   
    </div>
  );
}