// app/(app)/page.tsx - UPDATED
'use client';

import { useState } from 'react';
import PromotionSidebar from '@/app/components/PromotionSidebar';
import PromotionScrollcard from '@/app/components/PromotionScrollCard';
import Feed from '@/app/components/Feed';
import { StickyFeedTabs, FeedTab } from '@/app/components/FeedTabs';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('all');

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-0 sm:px-2 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          {/* Main Content (8 columns) */}
          <main className="lg:col-span-8">
            {/* Sticky Tabs */}
            <StickyFeedTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              sticky={true}
              offset="navbar"
              showIcons={true}
            />

            {/* Feed Content */}
            <div className="px-2 sm:px-4 lg:px-0 mt-4 lg:mt-6">
              <Feed showFilters={false} feedType={activeTab} />
            </div>
          </main>

          {/* Right Sidebar (4 columns) - Desktop only */}
          <aside className="hidden lg:block lg:col-span-4">
            <PromotionSidebar />
          </aside>
        </div>

      
      </div>
      <div className="h-24 lg:hidden"></div>
    </div>
  );
}