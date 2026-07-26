/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IMaterial, IMaterialActiveSession, IDocumentMetadata } from '../types/material.types';
import { MaterialService } from '../services/materialService';
import { MaterialRepository } from '../repositories/materialRepository';
import { IKnowledgeBridgeItem } from '../../../core/knowledge/KnowledgeBridgeModel';
import { Logger } from '../../../core/logger/Logger';
import { db } from '../../../infrastructure/db/connection';
import { PdfStorageService } from '../../../core/pdf/PdfStorageService';

export function useLibrary() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sampleMaterials] = useState<IMaterial[]>(() => MaterialService.getSampleMaterials());
  const [customPdfs, setCustomPdfs] = useState<IDocumentMetadata[]>([]);
  const [activeSession, setActiveSession] = useState<IMaterialActiveSession | null>(null);
  const [lastReadPages, setLastReadPages] = useState<Record<string, number>>({});
  const [showKnowledgeBridge, setShowKnowledgeBridge] = useState<boolean>(false);

  // Load user documents from DB
  useEffect(() => {
    async function loadDocuments() {
      try {
        const docs = await db.select<any>('documents');
        const metadata = docs.map((doc: any) => ({
          docId: doc.id,
          title: doc.title,
          filePath: doc.file_path,
          createdAt: doc.created_at,
        }));
        setCustomPdfs(metadata);
      } catch (err) {
        Logger.error('useLibrary', 'Failed to load user documents', err);
      }
    }
    loadDocuments();
  }, []);

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
  const handleCustomFileLoaded = useCallback((metadata: IDocumentMetadata) => {
    setCustomPdfs((prev) => [metadata, ...prev]);
  }, []);

  // Open user document
  const handleOpenUserDocument = useCallback(async (metadata: IDocumentMetadata) => {
    try {
      const buffer = await PdfStorageService.readPdfFile(metadata.filePath, metadata.docId);
      setActiveSession({
        docId: metadata.docId,
        title: metadata.title,
        buffer,
      });
    } catch (err) {
      Logger.error('useLibrary', 'Error opening user document', err);
    }
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
    handleOpenUserDocument,
    handleSelectKnowledgeItem,
    closeSession,
    goToHome,
    setActiveSession,
  };
}
