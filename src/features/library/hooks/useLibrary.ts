/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IMaterial, IMaterialActiveSession } from '../types/material.types';
import { MaterialService } from '../services/materialService';
import { MaterialRepository } from '../repositories/materialRepository';
import { IKnowledgeBridgeItem } from '../../../core/knowledge/KnowledgeBridgeModel';
import { Logger } from '../../../core/logger/Logger';

export function useLibrary() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sampleMaterials] = useState<IMaterial[]>(() => MaterialService.getSampleMaterials());
  const [customPdfs, setCustomPdfs] = useState<IMaterialActiveSession[]>([]);
  const [activeSession, setActiveSession] = useState<IMaterialActiveSession | null>(null);
  const [lastReadPages, setLastReadPages] = useState<Record<string, number>>({});
  const [showKnowledgeBridge, setShowKnowledgeBridge] = useState<boolean>(false);

  // Auto-launch target PDF from route navigation state (Writing Editor "Kaynağa Git")
  useEffect(() => {
    const state = location.state as { materialId?: string; pageNumber?: number } | undefined;
    if (state?.materialId) {
      const materialId = state.materialId;
      const targetPage = state.pageNumber || 1;

      async function launchFromNav() {
        try {
          Logger.info('useLibrary', `Auto-launching material [${materialId}] target page [${targetPage}]`);
          const session = await MaterialService.prepareSampleSession(materialId, targetPage);
          setActiveSession(session);
          window.history.replaceState({}, document.title);
        } catch (err) {
          Logger.error('useLibrary', 'Failed auto-launching material from nav state', err);
        }
      }
      launchFromNav();
    }
  }, [location.state]);

  // Load last read pages for materials
  const refreshLastReadPages = useCallback(async () => {
    const pages = await MaterialRepository.getLastReadPages();
    setLastReadPages(pages);
  }, []);

  useEffect(() => {
    refreshLastReadPages();
  }, [activeSession, refreshLastReadPages]);

  // Open Sample Material
  const handleOpenSample = useCallback(async (material: IMaterial) => {
    try {
      const session = await MaterialService.prepareSampleSession(material.id);
      setActiveSession(session);
    } catch (err) {
      Logger.error('useLibrary', 'Error opening sample material', err);
    }
  }, []);

  // Handle uploaded custom PDF session
  const handleCustomFileLoaded = useCallback((session: IMaterialActiveSession) => {
    setCustomPdfs((prev) => [session, ...prev]);
    setActiveSession(session);
  }, []);

  // Handle Knowledge Bridge Selection
  const handleSelectKnowledgeItem = useCallback(async (item: IKnowledgeBridgeItem) => {
    try {
      Logger.info('useLibrary', `Navigating from Knowledge Bridge to material [${item.materialId}] page [${item.pageNumber}]`);
      const session = await MaterialService.prepareSampleSession(item.materialId, item.pageNumber);
      setActiveSession(session);
      setShowKnowledgeBridge(false);
    } catch (err) {
      Logger.error('useLibrary', 'Error loading material from Knowledge Bridge', err);
    }
  }, []);

  const closeSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  const goToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    sampleMaterials,
    customPdfs,
    activeSession,
    lastReadPages,
    showKnowledgeBridge,
    setShowKnowledgeBridge,
    handleOpenSample,
    handleCustomFileLoaded,
    handleSelectKnowledgeItem,
    closeSession,
    goToHome,
    setActiveSession,
  };
}
