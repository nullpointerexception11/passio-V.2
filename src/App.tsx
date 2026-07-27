/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './core/theme/ThemeContext';
import { SessionProvider } from './core/session/SessionContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/ToastContext';
import { AppRoutes } from './routes/AppRoutes';
import { PinLockScreen } from './components/organisms/PinLockScreen';
import { SplashScreen } from './components/organisms/SplashScreen';
import { initDb } from './db/connection';
import { Logger } from './core/logger/Logger';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
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
        const errorMessage = err instanceof Error ? err.message : 'Veritabanı başlatılırken kritik hata oluştu.';
        setDbError(errorMessage);
      }
    }
    bootServices();
  }, []);

  if (dbError) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center select-none"
        style={{ backgroundColor: '#0D0D0D', color: '#F4F4F1' }}
      >
        <div className="max-w-md p-6 rounded-lg border border-red-900/40 bg-neutral-900/80 shadow-2xl">
          <div className="w-12 h-12 mx-auto mb-4 text-red-400 flex items-center justify-center rounded-full bg-red-950/50 border border-red-800/40 text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-serif mb-2 text-red-200">Veritabanı Sürücü Hatası</h2>
          <p className="text-xs font-mono text-neutral-300 mb-4 bg-black/50 p-3 rounded border border-neutral-800 text-left overflow-auto max-h-32">
            {dbError}
          </p>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Passio masaüstü ortamında güvenli SQLite veritabanı gerektirir. Veri kaybını önlemek amacıyla taranmış/sessiz bellek yedeklemesi devre dışıdır.
          </p>
        </div>
      </div>
    );
  }

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
    setShowSplash(false);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    // Reset router hash to root so unlocking always lands on Ana Salon (/)
    window.location.hash = '#/';
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <SessionProvider lockSession={handleLock}>
            {!isUnlocked ? (
              <PinLockScreen onUnlock={handleUnlock} />
            ) : showSplash ? (
              <SplashScreen onComplete={() => setShowSplash(false)} />
            ) : (
              <AppRoutes />
            )}
          </SessionProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
