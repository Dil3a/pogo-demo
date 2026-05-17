'use client';

/**
 * Button primitive
 * Variants follow UEMF + POGO brand language:
 *   - primary  : POGO teal gradient — main CTA inside POGO module
 *   - uemf     : UEMF blue→green gradient — used outside scooter context
 *   - secondary: subtle outline — destructive or low-emphasis actions
 *   - ghost    : transparent — toolbar / inline use
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'uemf' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-pogo-500 to-pogo-700 text-white shadow-md shadow-pogo-500/25 hover:shadow-pogo-500/40 hover:brightness-105 active:brightness-95',
  uemf:
    'bg-gradient-to-br from-uemf-blue to-uemf-green text-white shadow-md shadow-uemf-blue/20 hover:brightness-105 active:brightness-95',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger:
    'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-md shadow-red-500/25 hover:brightness-105',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-14 px-6 text-base rounded-2xl font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pogo-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
