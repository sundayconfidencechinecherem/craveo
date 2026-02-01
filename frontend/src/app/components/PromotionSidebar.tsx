// app/components/PromotionSidebar.tsx - UPDATED
'use client';
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import Image from "next/image";

export default function PromotionSidebar() {
  const promotions = [
    {
      id: 1,
      title: "Craveo Pro",
      company: "Craveo",
      description: "Join millions of other users to start enjoying our premium subscription free for the first 6 months of use.",
      action: "Follow",
      promoted: true,
      logo: "/craveologo.png"
    },
    {
      id: 2,
      title: "Private Chef Rentals",
      company: "Private Chefs Network",
      description: "Private chefs available for home service, outdoor catering and many more. Keep up with the latest insights and resources for everyday workplace needs. Available nationwide.",
      action: "Follow",
      promoted: true
    },
    {
      id: 3,
      title: "Food Photography Masterclass",
      company: "FoodVisuals Pro",
      description: "Learn professional food styling and photography from industry experts. Boost your social media presence.",
      action: "Learn More",
      promoted: true
    }
  ];

  const trendingTopics = [
    { tag: "#FoodTok", posts: "12.5K" },
    { tag: "#HomeCooking", posts: "8.2K" },
    { tag: "#StreetFood", posts: "15.7K" },
    { tag: "#VeganRecipes", posts: "9.3K" },
    { tag: "#Baking", posts: "7.8K" }
  ];

  return (
    <div className="space-y-6">
      {/* Promotion Section */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h3 className="text-lg font-bold text-text-primary">Sponsored Content</h3>
          <p className="mt-1 text-sm text-text-secondary">Suggested for you • Promoted</p>
        </div>
        
        <div className="divide-y divide-border">
          {promotions.map((promo) => (
            <div key={promo.id} className="p-5 transition-colors hover:bg-surface-hover/50">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {promo.logo && (
                    <div className="relative h-8 w-8">
                      <Image 
                        src={promo.logo} 
                        alt={promo.company} 
                        fill 
                        className="rounded-lg object-cover" 
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-text-primary">{promo.title}</h4>
                    <p className="text-sm text-text-secondary">{promo.company}</p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Sponsored
                </span>
              </div>
              
              {/* Description */}
              <p className="mb-4 text-sm text-text-primary leading-relaxed">
                {promo.description}
              </p>
              
              {/* Action Button */}
              <button className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
                {promo.action}
              </button>
              
              {/* Footer */}
              <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
                <span>• Promoted</span>
                <button className="flex items-center gap-1 hover:text-text-secondary">
                  <FaExternalLinkAlt className="text-xs" />
                  Learn more
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-border p-4">
          <button className="flex w-full items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary-dark">
            Show more
            <FaPlus className="text-xs" />
          </button>
        </div>
      </div>


     
    </div>
  );
}