/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface StatusBarProps {
  leftText?: React.ReactNode;
  rightText?: React.ReactNode;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  leftText,
  rightText = 'Passio • Offline First',
}) => {
  return (
    <footer
      className="h-8 px-6 border-t flex items-center justify-between text-[10px] font-mono opacity-50 shrink-0 select-none"
      style={{
        borderColor: 'var(--color-border-subtle)',
        backgroundColor: 'var(--color-bg-surface)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div>{leftText}</div>
      <div>{rightText}</div>
    </footer>
  );
};
