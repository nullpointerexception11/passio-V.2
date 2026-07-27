/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { RoomHub } from '../components/organisms/RoomHub';
import { FocusScreen } from '../components/organisms/FocusScreen';
import { LibraryScreen } from '../components/organisms/LibraryScreen';
import { ArchiveScreen } from '../components/organisms/ArchiveScreen';
import { SettingsScreen } from '../components/organisms/SettingsScreen';
import { DailyDeskScreen } from '../components/organisms/DailyDeskScreen';
import { GlobalSearchProvider } from '../core/search/GlobalSearchContext';
import { QuickSwitcherProvider } from '../core/search/QuickSwitcherContext';
import { InboxProvider } from '../core/inbox/InboxContext';

const WorkspaceTracker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRestored = useRef(false);

  useEffect(() => {
    // Restore window size on launch
    const width = localStorage.getItem('passio_window_width');
    const height = localStorage.getItem('passio_window_height');
    if (width && height) {
      try {
        window.resizeTo(parseInt(width, 10), parseInt(height, 10));
      } catch {
        // Ignored under browser standard security limits
      }
    }

    const handleResize = () => {
      localStorage.setItem('passio_window_width', window.innerWidth.toString());
      localStorage.setItem('passio_window_height', window.innerHeight.toString());
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname) {
      localStorage.setItem('passio_last_workspace', location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!hasRestored.current) {
      hasRestored.current = true;
      const currentHash = window.location.hash;
      if (!currentHash || currentHash === '#' || currentHash === '#/' || currentHash === '') {
        const lastWorkspace = localStorage.getItem('passio_last_workspace');
        if (
          lastWorkspace &&
          lastWorkspace !== '/' &&
          ['/focus', '/library', '/archive', '/settings', '/desk'].includes(lastWorkspace)
        ) {
          navigate(lastWorkspace, { replace: true });
        }
      }
    }
  }, [navigate]);

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <HashRouter>
      <GlobalSearchProvider>
        <QuickSwitcherProvider>
          <InboxProvider>
            <WorkspaceTracker>
              <Routes>
                {/* Ana Salon - Central Portal */}
                <Route path="/" element={<RoomHub />} />
                <Route path="/desk" element={<DailyDeskScreen />} />
                
                {/* Direct, dedicated room workspaces without unnecessary dashboard wrapping */}
                <Route path="/focus" element={<FocusScreen />} />
                <Route path="/library" element={<LibraryScreen />} />
                <Route path="/archive" element={<ArchiveScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
              </Routes>
            </WorkspaceTracker>
          </InboxProvider>
        </QuickSwitcherProvider>
      </GlobalSearchProvider>
    </HashRouter>
  );
};

export default AppRoutes;
