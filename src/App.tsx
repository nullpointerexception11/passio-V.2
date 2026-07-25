/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './core/theme/ThemeContext';
import { SessionProvider } from './core/session/SessionContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';
import { PinLockScreen } from './components/organisms/PinLockScreen';
import { SplashScreen } from './components/organisms/SplashScreen';
import { initDb } from './db/connection';
import { Logger } from './core/logger/Logger';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    async function bootServices() {
      try {
        Logger.info('App', 'Booting Passio application engine...');
        // Initialize local SQLite storage
        await initDb();
        setDbInitialized(true);
        Logger.info('App', 'All core platform services initialized successfully.');
      } catch (err) {
        Logger.error('App', 'Failed to initialize critical application services.', err);
        // We still allow layout mount since ErrorBoundary will trap or database falls back
        setDbInitialized(true);
      }
    }
    bootServices();
  }, []);

  if (!dbInitialized) {
    // Premium, minimalist silent loading state matching the theme colors natively
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: '#0D0D0D', color: '#F4F4F1' }}
      >
        <div className="flex flex-col items-center gap-4 select-none">
          <div className="w-5 h-5 border-t-2 rounded-full animate-spin" style={{ borderColor: '#D4AF37' }}></div>
          <span className="text-xs tracking-widest font-mono uppercase text-neutral-500">
            Initializing Secure Vault...
          </span>
        </div>
      </div>
    );
  }

  const handleUnlock = () => {
    setIsUnlocked(true);
    setShowSplash(true);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    // Reset router hash to root so unlocking always lands on Ana Salon (/)
    window.location.hash = '#/';
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SessionProvider lockSession={handleLock}>
          {!isUnlocked ? (
            <PinLockScreen onUnlock={handleUnlock} />
          ) : showSplash ? (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          ) : (
            <AppRoutes />
          )}
        </SessionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
