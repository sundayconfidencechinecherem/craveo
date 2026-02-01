import { ButtonHTMLAttributes, ReactNode } from 'react';
import { FaSpinner } from 'react-icons/fa';

//buttons

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-darker disabled:bg-primary-light',
    secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-hover active:bg-surface-active',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary/10 active:bg-primary/20',
    danger: 'bg-error text-white hover:bg-error-dark active:bg-error-darker disabled:bg-error-light',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${disabledClass}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <FaSpinner className="animate-spin" />}
      
      {!loading && icon && iconPosition === 'left' && icon}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
}
