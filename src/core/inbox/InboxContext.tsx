/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { InboxQuickCaptureModal } from '../../components/molecules/InboxQuickCaptureModal';
import { InboxManagerModal } from '../../components/molecules/InboxManagerModal';

interface InboxContextType {
  isCaptureOpen: boolean;
  isManagerOpen: boolean;
  openCapture: () => void;
  closeCapture: () => void;
  openManager: () => void;
  closeManager: () => void;
}

const InboxContext = createContext<InboxContextType>({
  isCaptureOpen: false,
  isManagerOpen: false,
  openCapture: () => {},
  closeCapture: () => {},
  openManager: () => {},
  closeManager: () => {},
});

export const useInbox = () => useContext(InboxContext);

export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCaptureOpen, setIsCaptureOpen] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);

  const openCapture = () => setIsCaptureOpen(true);
  const closeCapture = () => setIsCaptureOpen(false);

  const openManager = () => setIsManagerOpen(true);
  const closeManager = () => setIsManagerOpen(false);

  // Global Keyboard Shortcut: CTRL + SHIFT + SPACE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.code === 'Space' || e.key === ' ' || e.keyCode === 32)
      ) {
        e.preventDefault();
        setIsCaptureOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <InboxContext.Provider
      value={{
        isCaptureOpen,
        isManagerOpen,
        openCapture,
        closeCapture,
        openManager,
        closeManager,
      }}
    >
      {children}

      <InboxQuickCaptureModal
        isOpen={isCaptureOpen}
        onClose={closeCapture}
        onOpenInboxManager={openManager}
      />

      <InboxManagerModal isOpen={isManagerOpen} onClose={closeManager} />
    </InboxContext.Provider>
  );
};

export default InboxProvider;
