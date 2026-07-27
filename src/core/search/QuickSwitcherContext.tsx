/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QuickSwitcherModal } from '../../components/molecules/QuickSwitcherModal';

interface QuickSwitcherContextType {
  isOpen: boolean;
  openSwitcher: () => void;
  closeSwitcher: () => void;
  toggleSwitcher: () => void;
}

const QuickSwitcherContext = createContext<QuickSwitcherContextType>({
  isOpen: false,
  openSwitcher: () => {},
  closeSwitcher: () => {},
  toggleSwitcher: () => {},
});

export const useQuickSwitcher = () => useContext(QuickSwitcherContext);

export const QuickSwitcherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openSwitcher = () => setIsOpen(true);
  const closeSwitcher = () => setIsOpen(false);
  const toggleSwitcher = () => setIsOpen((prev) => !prev);

  // Global Keyboard Listener for CTRL+P / CMD+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QuickSwitcherContext.Provider value={{ isOpen, openSwitcher, closeSwitcher, toggleSwitcher }}>
      {children}
      <QuickSwitcherModal isOpen={isOpen} onClose={closeSwitcher} />
    </QuickSwitcherContext.Provider>
  );
};

export default QuickSwitcherProvider;
