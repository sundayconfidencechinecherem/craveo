// src/app/components/LoadingSpinner.tsx
'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  white?: boolean;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  white = false,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  const colorClasses = white 
    ? 'border-white border-t-transparent' 
    : `border-${color} border-t-transparent`;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} ${colorClasses} animate-spin rounded-full`}
        aria-label="Loading"
      />
    </div>
  );
}