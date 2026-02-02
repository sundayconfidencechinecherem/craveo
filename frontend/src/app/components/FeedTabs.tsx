// app/components/FeedTabs.tsx - OPTIMIZED FOR TABLET
'use client';

import { useState, useEffect, useRef } from 'react';
import { FaFire, FaUsers, FaRocket, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Match the FeedType from your Feed component
export type FeedTab = 'all' | 'following' | 'trending' | 'saved';

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  showIcons?: boolean;
  compact?: boolean;
}

export default function FeedTabs({ 
  activeTab, 
  onTabChange, 
  showIcons = true,
  compact = false 
}: FeedTabsProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { 
      id: 'all' as FeedTab, 
      label: 'For You', 
      color: 'text-primary'
    },
    { 
      id: 'following' as FeedTab, 
      label: 'Following', 
      color: 'text-green-500'
    },
    { 
      id: 'trending' as FeedTab, 
      label: 'Trending', 
      color: 'text-orange-500'
    },
    { 
      id: 'saved' as FeedTab, 
      label: 'Saved', 
      color: 'text-yellow-500'
    },
  ];

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const checkScrollButtons = () => {
    if (tabsRef.current && containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const handleScroll = () => {
    checkScrollButtons();
  };

  return (
    <div className="relative mb-10" ref={containerRef}>
      {/* Desktop (lg: 1024px+): Grid Tabs */}
      <div className="hidden lg:block">
        <div className={`grid ${compact ? 'grid-cols-4' : 'grid-cols-4'} gap-1 rounded-xl bg-surface p-1 border border-border`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all duration-200
                        ${activeTab === tab.id
                          ? 'bg-primary text-white shadow-md scale-105'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                        }`}
            >
              {showIcons && <span className={tab.color}></span>}
              <span className="text-sm md:text-base">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tablet (md: 768px-1023px): Medium-sized tabs with icons */}
      <div className="hidden md:block lg:hidden">
        <div className="flex justify-center gap-2 px-2 py-2 bg-surface/80 backdrop-blur-sm rounded-xl border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-medium transition-all duration-200 min-w-[130px]
                        ${activeTab === tab.id
                          ? 'bg-primary text-white shadow-md scale-105'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                        }`}
            >
              {showIcons && <span className={tab.color}></span>}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile (sm: 640px-767px) & Small Tablet: Scrollable tabs */}
      <div className="md:hidden">
     
      

        {/* Tabs Container */}
        <div
          ref={tabsRef}
          id="feed-tabs-container"
          className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 -mx-2 px-2"
          onScroll={handleScroll}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-3 mx-0.5 transition-all duration-200 min-w-[140px]
                        ${activeTab === tab.id
                          ? 'bg-primary text-white shadow-md scale-105 font-semibold'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary font-medium'
                        }`}
            >
              {showIcons && <span className={tab.color}></span>}
              <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active Indicator Line - Mobile only */}
        <div className="h-1 bg-surface-hover/30 -mx-2 mt-1">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ 
              width: `${100 / tabs.length}%`,
              transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}


interface StickyFeedTabsProps extends FeedTabsProps {
  sticky?: boolean;
  offset?: 'navbar' | 'none';
}

export function StickyFeedTabs({ 
  sticky = true, 
  offset = 'navbar',
  ...props 
}: StickyFeedTabsProps) {
  return (
    <div className={`
      ${sticky ? 'sticky z-30' : ''}
      ${offset === 'navbar' ? 'top-0 md:top-16 lg:top-6' : 'top-0'}
      bg-app-bg/95 backdrop-blur-sm border-b border-surface-hover/30
      md:bg-surface md:my-10 md:border md:rounded-xl
      lg:border lg:rounded-xl lg:bg-surface
      ${sticky ? 'md:shadow-sm lg:shadow-sm' : ''}
      px-2 md:px-4
    `}>
      <div className="py-2 md:py-3 lg:py-1 max-w-7xl mx-auto">
        <FeedTabs {...props} />
      </div>
    </div>
  );
}