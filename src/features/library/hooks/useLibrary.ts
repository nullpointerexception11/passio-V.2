/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IMaterial, IMaterialActiveSession, IDocumentMetadata } from '../types/material.types';
import { MaterialService } from '../services/materialService';
import { MaterialRepository } from '../repositories/materialRepository';
import { IKnowledgeBridgeItem } from '../../../core/knowledge/KnowledgeBridgeModel';
import { Logger } from '../../../core/logger/Logger';
import { db } from '../../../infrastructure/db/connection';
import { PdfStorageService } from '../../../core/pdf/PdfStorageService';
import {
  LibraryMetadataService,
  ICollection,
  ReadingStatus,
} from '../services/libraryMetadataService';

export function useLibrary() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sampleMaterials] = useState<IMaterial[]>(() => MaterialService.getSampleMaterials());
  const [customPdfs, setCustomPdfs] = useState<IDocumentMetadata[]>([]);
  const [activeSession, setActiveSession] = useState<IMaterialActiveSession | null>(null);
  const [lastReadPages, setLastReadPages] = useState<Record<string, number>>({});
  const [showKnowledgeBridge, setShowKnowledgeBridge] = useState<boolean>(false);

  // Metadata & Collections State
  const [collections, setCollections] = useState<ICollection[]>([]);
  const [docCollectionMap, setDocCollectionMap] = useState<Record<string, string[]>>({});
  const [highlightsMap, setHighlightsMap] = useState<Record<string, number>>({});
  const [notesMap, setNotesMap] = useState<Record<string, number>>({});
  const [statuses, setStatuses] = useState<Record<string, ReadingStatus>>({});
  const [lastOpenedMap, setLastOpenedMap] = useState<Record<string, string>>({});

  // Filtering
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | null>(null);

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

  // Load Metadata (Collections, Stats, Statuses)
  const refreshMetadata = useCallback(async () => {
    try {
      const cols = await LibraryMetadataService.getCollections();
      const colMap = await LibraryMetadataService.getDocumentCollectionMap();
      const { highlightsMap: hMap, notesMap: nMap } = await LibraryMetadataService.getAllPdfStats();

      setCollections(cols);
      setDocCollectionMap(colMap);
      setHighlightsMap(hMap);
      setNotesMap(nMap);

      // Refresh statuses and last opened
      const pages = await MaterialRepository.getLastReadPages();
      setLastReadPages(pages);

      const newStatuses: Record<string, ReadingStatus> = {};
      const newLastOpened: Record<string, string> = {};

      const allDocIds = [
        ...sampleMaterials.map((s) => s.id),
        ...customPdfs.map((c) => c.docId),
      ];

      for (const id of allDocIds) {
        const page = pages[id] || 1;
        const total = sampleMaterials.find((s) => s.id === id)?.pageCount || 10;
        newStatuses[id] = LibraryMetadataService.getReadingStatus(id, page, total);

        const opened = LibraryMetadataService.getLastOpened(id);
        if (opened) {
          newLastOpened[id] = opened;
        }
      }

      setStatuses(newStatuses);
      setLastOpenedMap(newLastOpened);
    } catch (err) {
      Logger.error('useLibrary', 'Failed to refresh metadata', err);
    }
  }, [sampleMaterials, customPdfs]);

  useEffect(() => {
    refreshMetadata();
  }, [activeSession, refreshMetadata]);

  // Save active session to localStorage
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('passio_active_pdf_session', JSON.stringify({
        docId: activeSession.docId,
        title: activeSession.title,
      }));
    } else {
      localStorage.removeItem('passio_active_pdf_session');
    }
  }, [activeSession]);

  const hasRestoredRef = useRef(false);

  // Restore previous active PDF session on mount
  useEffect(() => {
    if (hasRestoredRef.current) return;

    const state = location.state as { materialId?: string } | undefined;
    if (state?.materialId) {
      hasRestoredRef.current = true;
      return;
    }

    const savedSessionStr = localStorage.getItem('passio_active_pdf_session');
    if (savedSessionStr) {
      hasRestoredRef.current = true;
      try {
        const savedSession = JSON.parse(savedSessionStr);
        if (savedSession && savedSession.docId) {
          const matId = savedSession.docId;
          const isSample = sampleMaterials.some((m) => m.id === matId);
          
          const restore = async () => {
            const savedPageStr = localStorage.getItem(`pdf_last_page_${matId}`);
            const pageNum = savedPageStr ? parseInt(savedPageStr, 10) : 1;
            
            if (isSample) {
              const mat = sampleMaterials.find((m) => m.id === matId);
              if (mat) {
                LibraryMetadataService.recordLastOpened(mat.id);
                const session = await MaterialService.prepareSampleSession(mat.id, pageNum);
                setActiveSession(session);
              }
            } else {
              try {
                const docs = await db.select<any>('documents');
                const foundDoc = docs.find((d: any) => d.id === matId);
                if (foundDoc) {
                  LibraryMetadataService.recordLastOpened(foundDoc.id);
                  const buffer = await PdfStorageService.readPdfFile(foundDoc.file_path, foundDoc.id);
                  setActiveSession({
                    docId: foundDoc.id,
                    title: foundDoc.title,
                    buffer,
                    targetPage: pageNum,
                  });
                }
              } catch (err) {
                Logger.error('useLibrary', 'Failed to restore custom PDF session', err);
              }
            }
          };
          restore();
        }
      } catch (err) {
        Logger.error('useLibrary', 'Failed to parse saved active session', err);
      }
    } else {
      hasRestoredRef.current = true;
    }
  }, [location.state, sampleMaterials]);

  // Open Sample Material
  const handleOpenSample = useCallback(async (material: IMaterial, targetPage?: number) => {
    try {
      LibraryMetadataService.recordLastOpened(material.id);
      const pageToOpen = targetPage || lastReadPages[material.id] || 1;
      const session = await MaterialService.prepareSampleSession(material.id, pageToOpen);
      setActiveSession(session);
    } catch (err) {
      Logger.error('useLibrary', 'Error opening sample material', err);
    }
  }, [lastReadPages]);

  // Handle auto-opening PDF or selecting Collection from router state on mount/change
  useEffect(() => {
    const state = location.state as { materialId?: string; pageNumber?: number; collectionId?: string | null } | undefined;
    if (state) {
      if (state.materialId) {
        const matId = state.materialId;
        const pageNum = state.pageNumber || 1;
        
        const openMat = async () => {
          const isSample = sampleMaterials.some((m) => m.id === matId);
          if (isSample) {
            const mat = sampleMaterials.find((m) => m.id === matId);
            if (mat) {
              handleOpenSample(mat, pageNum);
            }
          } else {
            try {
              const docs = await db.select<any>('documents');
              const foundDoc = docs.find((d: any) => d.id === matId);
              if (foundDoc) {
                const buffer = await PdfStorageService.readPdfFile(foundDoc.file_path, foundDoc.id);
                setActiveSession({
                  docId: foundDoc.id,
                  title: foundDoc.title,
                  buffer,
                  targetPage: pageNum,
                });
              }
            } catch (err) {
              Logger.error('useLibrary', 'Failed to auto-open custom document from navigation state', err);
            }
          }
        };
        openMat();
      }
      
      if (state.collectionId !== undefined && state.collectionId !== null) {
        setSelectedCollectionId(state.collectionId);
      }

      window.history.replaceState({}, document.title);
    }
  }, [location.state, sampleMaterials, handleOpenSample]);

  // Handle uploaded custom PDF session
  const handleCustomFileLoaded = useCallback((metadata: IDocumentMetadata) => {
    setCustomPdfs((prev) => [metadata, ...prev]);
  }, []);

  // Open user document
  const handleOpenUserDocument = useCallback(async (metadata: IDocumentMetadata, targetPage?: number) => {
    try {
      LibraryMetadataService.recordLastOpened(metadata.docId);
      const buffer = await PdfStorageService.readPdfFile(metadata.filePath, metadata.docId);
      const pageToOpen = targetPage || lastReadPages[metadata.docId] || 1;
      setActiveSession({
        docId: metadata.docId,
        title: metadata.title,
        buffer,
        targetPage: pageToOpen,
      });
    } catch (err) {
      Logger.error('useLibrary', 'Error opening user document', err);
    }
  }, [lastReadPages]);

  // Handle Knowledge Bridge Selection
  const handleSelectKnowledgeItem = useCallback(async (item: IKnowledgeBridgeItem) => {
    try {
      Logger.info('useLibrary', `Navigating from Knowledge Bridge to material [${item.materialId}] page [${item.pageNumber}]`);
      LibraryMetadataService.recordLastOpened(item.materialId);
      const session = await MaterialService.prepareSampleSession(item.materialId, item.pageNumber);
      setActiveSession(session);
      setShowKnowledgeBridge(false);
    } catch (err) {
      Logger.error('useLibrary', 'Error loading material from Knowledge Bridge', err);
    }
  }, []);

  // Cycle Reading Status (○ New -> ◐ Reading -> ● Finished -> ○ New)
  const handleCycleStatus = useCallback((docId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const current = statuses[docId] || 'new';
    let next: ReadingStatus = 'reading';
    if (current === 'new') next = 'reading';
    else if (current === 'reading') next = 'finished';
    else next = 'new';

    LibraryMetadataService.setReadingStatus(docId, next);
    setStatuses((prev) => ({ ...prev, [docId]: next }));
  }, [statuses]);

  // Collection Actions
  const handleCreateCollection = useCallback(async (name: string) => {
    const newCol = await LibraryMetadataService.createCollection(name);
    setCollections((prev) => [...prev, newCol]);
  }, []);

  const handleDeleteCollection = useCallback(async (collectionId: string) => {
    await LibraryMetadataService.deleteCollection(collectionId);
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    if (selectedCollectionId === collectionId) {
      setSelectedCollectionId(null);
    }
    const updatedMap = await LibraryMetadataService.getDocumentCollectionMap();
    setDocCollectionMap(updatedMap);
  }, [selectedCollectionId]);

  const handleToggleDocCollection = useCallback(async (docId: string, collectionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await LibraryMetadataService.toggleDocumentCollection(docId, collectionId);
    const updatedMap = await LibraryMetadataService.getDocumentCollectionMap();
    setDocCollectionMap(updatedMap);
  }, []);

  const closeSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  const goToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleDeleteDocument = useCallback(async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await MaterialService.deleteDocument(docId);
      setCustomPdfs((prev) => prev.filter((p) => p.docId !== docId));
      Logger.info('useLibrary', `Deleted document [${docId}]`);
    } catch (err) {
      Logger.error('useLibrary', `Failed to delete document [${docId}]`, err);
    }
  }, []);

  return {
    sampleMaterials,
    customPdfs,
    activeSession,
    lastReadPages,
    showKnowledgeBridge,
    setShowKnowledgeBridge,
    collections,
    docCollectionMap,
    highlightsMap,
    notesMap,
    statuses,
    lastOpenedMap,
    selectedCollectionId,
    selectedStatus,
    setSelectedCollectionId,
    setSelectedStatus,
    handleOpenSample,
    handleCustomFileLoaded,
    handleOpenUserDocument,
    handleSelectKnowledgeItem,
    handleDeleteDocument,
    handleCycleStatus,
    handleCreateCollection,
    handleDeleteCollection,
    handleToggleDocCollection,
    closeSession,
    goToHome,
    setActiveSession,
  };
}
