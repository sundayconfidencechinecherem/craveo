'use client';

import { FaEllipsisH } from 'react-icons/fa';

const promotions = [
  {
    id: 1,
    title: "Craveo Pro",
    handle: "@craveopro",
    description: "Join millions of other users to start enjoying our premium subscription free for the first 6 months.",
    action: "Follow",
    initial: "C"
  },
  {
    id: 2,
    title: "Private Chef Rentals",
    handle: "@privatechefs",
    description: "Private chefs available for home service, outdoor catering and many more. Available nationwide.",
    action: "Follow",
    initial: "P"
  },
  {
    id: 3,
    title: "Food Photography",
    handle: "@foodvisualspro",
    description: "Learn professional food styling and photography from industry experts.",
    action: "Learn More",
    initial: "F"
  },
  {
    id: 4,
    title: "Gordon Ramsay Kitchens",
    handle: "@ramsaykitchens",
    description: "Premium kitchen tools and equipment. Get 20% off on professional chef knives.",
    action: "Shop Now",
    initial: "G"
  },
  {
    id: 5,
    title: "MasterChef Recipes",
    handle: "@masterchefrecipes",
    description: "Official recipes from MasterChef contestants. Step-by-step video tutorials.",
    action: "Follow",
    initial: "M"
  },
];

export default function PromotionCarousel() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="font-bold text-text-primary text-lg">Sponsored</h3>
        <button className="text-primary hover:text-primary-dark text-sm font-medium">
          See all
        </button>
      </div>
      
      <div className="relative">
        <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4">
          {promotions.map((promo) => (
            <div key={promo.id} className="flex-shrink-0 w-80 bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-tertiary bg-surface-hover px-2 py-1 rounded">
                    Promoted
                  </span>
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{promo.initial}</span>
                  </div>
                </div>
                <button className="text-text-tertiary hover:text-text-secondary">
                  <FaEllipsisH className="text-sm" />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-bold text-text-primary text-lg mb-1">{promo.title}</h4>
                <p className="text-sm text-text-secondary mb-2">{promo.handle}</p>
                <p className="text-text-primary text-sm leading-relaxed">{promo.description}</p>
              </div>
              
              <button className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full text-sm transition-colors">
                {promo.action}
              </button>
            </div>
          ))}
        </div>
        
        {/* Fade effect on right */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-app-bg to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}