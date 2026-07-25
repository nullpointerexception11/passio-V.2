/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppConfigSchema {
  version: string;
  env: 'development' | 'production' | 'test';
  buildTarget: 'desktop' | 'web';
  database: {
    fileName: string;
    version: number;
    syncIntervalMs: number;
  };
  security: {
    privacyMode: boolean; // Clears active session cache on minimize/background
    localEncryptionEnabled: boolean;
  };
  editor: {
    autoSaveIntervalMs: number;
    defaultFontFamily: 'serif' | 'sans' | 'mono';
    maxHistoryStackSize: number;
  };
  logging: {
    persistLogs: boolean;
    minLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  };
}

const isDev = process.env.NODE_ENV !== 'production';

export const AppConfig: AppConfigSchema = {
  version: '1.0.0-sprint1',
  env: isDev ? 'development' : 'production',
  buildTarget: 'desktop', // Hardcoded as Tauri v2 is our target shell

  database: {
    fileName: 'passio_core.db',
    version: 1,
    syncIntervalMs: 60000, // Sync loop for safety
  },

  security: {
    privacyMode: true, // Privacy first mandate
    localEncryptionEnabled: false, // Planned for future sprints
  },

  editor: {
    autoSaveIntervalMs: 2000, // Fast autosave for zero work loss
    defaultFontFamily: 'serif', //Georgia/serif is the standard reading font for focus
    maxHistoryStackSize: 100,
  },

  logging: {
    persistLogs: isDev,
    minLevel: isDev ? 'DEBUG' : 'INFO',
  },
};

export default AppConfig;
