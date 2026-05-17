'use client';

/**
 * Small UI primitives bundled together to keep file count manageable.
 * Each export is a presentation component with no business logic.
 *   - Badge   : status pill, mirrors portal `.badge` styles
 *   - Card    : rounded white container
 *   - Skeleton: loading shimmer
 *   - Modal   : centered overlay (mobile-friendly bottom-sheet on small screens)
 */

import { type ReactNode, type HTMLAttributes, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';

/* ────────────────────────────────── Badge ─────────────────────────────────── */

type BadgeVariant =
  | 'green'
  | 'red'
  | 'orange'
  | 'blue'
  | 'teal'
  | 'slate'
  | 'purple';

const badgeStyles: Record<BadgeVariant, string> = {
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  orange: 'bg-orange-50 text-orange-700',
  blue: 'bg-blue-50 text-blue-700',
  teal: 'bg-pogo-50 text-pogo-700',
  slate: 'bg-slate-100 text-slate-700',
  purple: 'bg-purple-50 text-purple-700',
};

export function Badge({
  variant = 'slate',
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
        badgeStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ────────────────────────────────── Card ──────────────────────────────────── */

export function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-card',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────── Skeleton ────────────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200',
        className,
      )}
    />
  );
}

/* ────────────────────────────────── Modal ─────────────────────────────────── */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Hide the default close button (use when you render your own header) */
  hideClose?: boolean;
  /** Max-width preset */
  size?: 'sm' | 'md' | 'lg';
}

const modalSize: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  hideClose,
  size = 'md',
}: ModalProps) {
  // ESC key closes the modal — keyboard accessibility for desktop.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-uemf-blue/25 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full bg-white p-6 shadow-2xl',
          'rounded-t-3xl sm:rounded-2xl',
          modalSize[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideClose) && (
          <div className="mb-4 flex items-center justify-between">
            {title && (
              <h3 id="modal-title" className="text-base font-bold text-uemf-blue">
                {title}
              </h3>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
