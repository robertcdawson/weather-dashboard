import React from 'react';
import { animate } from 'motion';
import { cn } from '../../utils/cn';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;

    // Scale down animation
    animate(
      button,
      { scale: 0.95 },
      { duration: 0.1, easing: 'ease-out' }
    );

    // Scale back up
    animate(
      button,
      { scale: 1 },
      { duration: 0.15, easing: 'ease-out' }
    );

    onClick?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    animate(
      e.currentTarget,
      { y: -2 },
      { duration: 0.2, easing: 'ease-out' }
    );
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    animate(
      e.currentTarget,
      { y: 0 },
      { duration: 0.2, easing: 'ease-out' }
    );
  };

  const baseStyles = "rounded-lg transition-colors duration-200 font-medium";

  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30",
    secondary: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200",
    danger: "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}; 