import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
  size?: 'lg' | 'xl';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  fullWidth = false, 
  size = 'lg',
  className = '',
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 shadow-lg";
  
  // Von Restorff Effect: Safety Orange against Navy/White
  const colorClasses = "bg-accent text-white hover:bg-orange-600";
  
  const sizeClasses = size === 'xl' 
    ? "px-8 py-6 text-xl rounded-xl" 
    : "px-6 py-4 text-lg rounded-lg";

  const widthClass = fullWidth ? "w-full" : "w-auto";

  return (
    <button 
      className={`${baseClasses} ${colorClasses} ${sizeClasses} ${widthClass} ${className}`}
      {...props}
    >
      <span>{children}</span>
      <ArrowRight className="ml-2 w-6 h-6" strokeWidth={3} />
    </button>
  );
};

export default Button;