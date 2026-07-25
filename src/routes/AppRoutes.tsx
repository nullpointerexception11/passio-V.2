/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { RoomHub } from '../components/organisms/RoomHub';
import { FocusScreen } from '../components/organisms/FocusScreen';
import { LibraryScreen } from '../components/organisms/LibraryScreen';
import { ArchiveScreen } from '../components/organisms/ArchiveScreen';
import { SettingsScreen } from '../components/organisms/SettingsScreen';

export const AppRoutes: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Ana Salon - Central Portal */}
        <Route path="/" element={<RoomHub />} />
        
        {/* Direct, dedicated room workspaces without unnecessary dashboard wrapping */}
        <Route path="/focus" element={<FocusScreen />} />
        <Route path="/library" element={<LibraryScreen />} />
        <Route path="/archive" element={<ArchiveScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;
