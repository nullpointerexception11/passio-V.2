/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Logger } from '../../core/logger/Logger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    Logger.error(
      'ErrorBoundary',
      'Uncaught visual runtime exception detected in layout tree.',
      error,
      { componentStack: errorInfo.componentStack }
    );
  }

  private handleReset = () => {
    Logger.info('ErrorBoundary', 'User initiated manual UI state recovery reload.');
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          id="error-boundary-recovery-view"
          className="flex flex-col items-center justify-center min-h-screen px-6 text-center select-none"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            color: 'var(--color-text-primary)',
            transition: 'background-color var(--motion-duration-normal) var(--motion-duration-standard)',
          }}
        >
          <div className="w-full max-w-md p-8 rounded-xl border"
               style={{
                 backgroundColor: 'var(--color-bg-surface)',
                 borderColor: 'var(--color-border-subtle)',
                 boxShadow: 'var(--shadows-medium)',
               }}
          >
            {/* Minimalist icon / badge */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6"
                 style={{ backgroundColor: 'var(--color-bg-input)' }}
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                style={{ color: 'var(--color-text-accent)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-xl font-medium tracking-tight mb-3">
              A Moment of Friction
            </h1>
            
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Passio experienced an unexpected interface error. Your documents remain fully safe in your offline database.
            </p>

            {this.state.error && (
              <div 
                className="p-4 rounded text-left font-mono text-xs overflow-auto max-h-40 mb-6 border"
                style={{ 
                  backgroundColor: 'var(--color-bg-input)', 
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-muted)'
                }}
              >
                <div className="font-bold text-red-500 mb-1">{this.state.error.name}: {this.state.error.message}</div>
                {this.state.errorInfo?.componentStack}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-accent-base)',
                  color: 'var(--color-bg-surface)',
                }}
              >
                Restore Interface
              </button>
              
              <button
                onClick={() => {
                  Logger.info('ErrorBoundary', 'User initiated soft cache reset.');
                  localStorage.clear();
                  this.handleReset();
                }}
                className="w-full py-2 text-xs font-medium cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Clear Cache and Force Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
