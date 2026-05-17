'use client';

/**
 * Input primitive
 * Designed to match the UEMF portal's form styling:
 *   - light fill background (#f9fafd)
 *   - focuses to UEMF blue
 *   - error state in red
 *
 * Accepts a label + hint + error for vertical form layouts.
 */

import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Right-side adornment (icon, suffix, etc.) */
  rightSlot?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, rightSlot, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={hint || error ? `${inputId}-help` : undefined}
          className={cn(
            'w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-900',
            'transition-colors placeholder:text-slate-400',
            'focus:border-uemf-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-uemf-blue/20',
            'disabled:cursor-not-allowed disabled:opacity-60',
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300',
            rightSlot && 'pr-10',
            className,
          )}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            {rightSlot}
          </div>
        )}
      </div>
      {(hint || error) && (
        <p
          id={`${inputId}-help`}
          className={cn(
            'text-xs',
            hasError ? 'text-red-600' : 'text-slate-500',
          )}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
