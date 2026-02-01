'use client';

import { useState, useRef, useEffect } from 'react';

export default function PromotionScrollCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const promotions = [
    {
      id: 1,
      title: "Craveo Pro",
      company: "Craveo",
      description: "Join millions enjoying premium features free for 6 months",
      cta: "Try Free",
      icon: "👑",
      color: "from-primary to-purple-500"
    },
    {
      id: 2,
      title: "Private Chef Rentals",
      company: "Private Chefs Network",
      description: "Hire professional chefs for home service & catering",
      cta: "Book Now",
      icon: "👨‍🍳",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 3,
      title: "Food Photography",
      company: "FoodVisuals Pro",
      description: "Master food styling & photography with experts",
      cta: "Learn More",
      icon: "📸",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 4,
      title: "Kitchen Equipment",
      company: "Chef's Warehouse",
      description: "Premium kitchen tools at 20% discount",
      cta: "Shop Now",
      icon: "🔪",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 5,
      title: "Cooking Classes",
      company: "Culinary Academy",
      description: "Live online cooking classes from world chefs",
      cta: "Join Now",
      icon: "🎓",
      color: "from-pink-500 to-rose-500"
    }
  ];

 
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % promotions.length;
      scrollToIndex(nextIndex);
    }, 5000); 
    
    return () => clearInterval(interval);
  }, [currentIndex, promotions.length]);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
    setCurrentIndex(index);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Sponsored</span>
            <h3 className="font-bold text-text-primary text-sm mt-1">Promotions for you</h3>
          </div>
          <button className="text-xs text-text-tertiary hover:text-text-primary transition-colors">
            Hide
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth' }}
        >
          {promotions.map((promo) => (
            <div 
              key={promo.id}
              className="flex-shrink-0 w-full snap-center"
            >
              <div className={`p-6 bg-gradient-to-r ${promo.color} text-white`}>
                {/* Promotion Content */}
                <div className="flex items-start justify-between mb-6">
                  <div className="text-5xl">{promo.icon}</div>
                  <span className="text-xs font-medium bg-white/20 px-3 py-1.5 rounded-full">
                    Ad
                  </span>
                </div>
                
                <h4 className="text-2xl font-bold mb-2">{promo.title}</h4>
                <p className="text-sm mb-2 opacity-90">{promo.company}</p>
                <p className="text-base mb-8 opacity-90 leading-relaxed">{promo.description}</p>
                
                <button className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-gray-900 font-bold rounded-full text-sm hover:bg-gray-100 transition-colors shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
                  {promo.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to promotion ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}