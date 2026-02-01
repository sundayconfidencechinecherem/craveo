import { forwardRef, InputHTMLAttributes } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 bg-surface border rounded-lg
              text-text-primary placeholder-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-error' : 'border-border'}
              ${className}
              disabled:bg-surface-hover disabled:cursor-not-allowed
            `}
            {...props}
          />
          
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-error">
              <FaExclamationCircle />
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-error flex items-center">
            <FaExclamationCircle className="mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
