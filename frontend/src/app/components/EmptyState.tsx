import { FaUtensils } from 'react-icons/fa';

interface EmptyStateProps {
  title?: string;
  message?: string;
  showAction?: boolean;
  onAction?: () => void;
}

export default function EmptyState({
  title = "No food posts yet",
  message = "Be the first to share your delicious creations!",
  showAction = true,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-6">
        <FaUtensils className="w-12 h-12 text-primary" />
      </div>
      
      <h3 className="text-2xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary mb-6 max-w-md">{message}</p>
      
      {showAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Create Your First Post
        </button>
      )}
      
      <div className="mt-8 text-sm text-text-tertiary">
        <p>Tip: Share your favorite recipes, restaurant finds, or cooking tips!</p>
      </div>
    </div>
  );
}
