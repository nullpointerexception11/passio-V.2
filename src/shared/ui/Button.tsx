/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2 py-1 text-[10px] rounded-lg gap-1',
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-xs rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
  }[size];

  const variantClasses = {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-medium',
    secondary:
      'border text-neutral-800 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 border-neutral-300 dark:border-neutral-800',
    outline: 'border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10',
    subtle: 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300',
    ghost: 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 opacity-80 hover:opacity-100',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`font-mono inline-flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children && <span>{children}</span>}
    </button>
  );
};
