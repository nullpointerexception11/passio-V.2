/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string; // e.g. 'max-w-2xl'
}

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidthClass = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClass} rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up`}
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || icon) && (
          <div
            className="px-6 py-4 border-b flex items-center justify-between shrink-0"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {icon}
                </div>
              )}
              <div className="flex flex-col">
                {typeof title === 'string' ? (
                  <h3 className="font-serif font-semibold text-sm tracking-wide">
                    {title}
                  </h3>
                ) : (
                  title
                )}
                {subtitle && (
                  <span className="text-[11px] font-mono opacity-50">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Kapat (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className="px-6 py-3 border-t flex items-center justify-end gap-3 shrink-0"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
