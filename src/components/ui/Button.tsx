import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-[#EA1D2C] text-white hover:bg-[#d01927]',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border border-gray-200 bg-transparent hover:bg-gray-50',
      ghost: 'bg-transparent hover:bg-gray-100',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-lg',
      icon: 'h-10 w-10 shrink-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA1D2C] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
