'use client';

interface PromotionCardProps {
  promotion: {
    id: string;
    title: string;
    company: string;
    description: string;
    cta: string;
    sponsored: boolean;
  };
  onHide?: () => void;
}

export default function PromotionCard({ promotion, onHide }: PromotionCardProps) {
  return (
    <div className="my-8">
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-tertiary bg-surface-hover px-2 py-1 rounded">
              Promoted
            </span>
            <span className="text-xs text-text-secondary">{promotion.company}</span>
          </div>
          {onHide && (
            <button 
              onClick={onHide}
              className="text-xs text-text-tertiary hover:text-text-secondary"
            >
              Ad · Hide
            </button>
          )}
        </div>
        <h4 className="font-bold text-text-primary text-lg mb-2">{promotion.title}</h4>
        <p className="text-text-primary text-sm mb-4">{promotion.description}</p>
        <button className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full text-sm transition-colors">
          {promotion.cta}
        </button>
      </div>
    </div>
  );
}