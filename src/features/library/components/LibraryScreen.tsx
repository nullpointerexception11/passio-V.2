/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { useFileImport } from '../hooks/useFileImport';
import { LibraryHeader } from './LibraryHeader';
import { ImportSection } from './ImportSection';
import { RecentMaterials } from './RecentMaterials';
import { SampleMaterials } from './SampleMaterials';
import { ContinueReadingSection, IContinueReadingItem } from './ContinueReadingSection';
import { CollectionsFilterBar } from './CollectionsFilterBar';
import { EmptyState } from './EmptyState';
import { ReaderLauncher } from './ReaderLauncher';
import { KnowledgeBridgeModal } from '../../../components/molecules/KnowledgeBridgeModal';

export const LibraryScreen: React.FC = () => {
  const {
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
  } = useLibrary();

  const { fileInputRef, triggerFilePicker, handleFileChange } = useFileImport({
    onFileLoaded: handleCustomFileLoaded,
  });

  const hasMaterials = sampleMaterials.length > 0 || customPdfs.length > 0;

  // Build Continue Reading list (docs with progress > 1 page or opened)
  const continueReadingItems = useMemo<IContinueReadingItem[]>(() => {
    const items: IContinueReadingItem[] = [];

    for (const doc of sampleMaterials) {
      const page = lastReadPages[doc.id] || 1;
      const opened = lastOpenedMap[doc.id];
      if (page > 1 || opened) {
        items.push({
          material: doc,
          lastReadPage: page,
          totalPages: doc.pageCount || 10,
          lastOpenedAt: opened,
        });
      }
    }

    // Sort by last opened date or last read page
    items.sort((a, b) => {
      if (a.lastOpenedAt && b.lastOpenedAt) {
        return new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime();
      }
      return b.lastReadPage - a.lastReadPage;
    });

    return items;
  }, [sampleMaterials, lastReadPages, lastOpenedMap]);

  return (
    <div
      className="min-h-screen w-screen flex flex-col select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* File Import Handler */}
      <ImportSection fileInputRef={fileInputRef} onFileChange={handleFileChange} />

      {/* Top Header Navigation */}
      <LibraryHeader
        onBack={goToHome}
        onOpenKnowledgeBridge={() => setShowKnowledgeBridge(true)}
        onUploadClick={triggerFilePicker}
      />

      {/* Main Library View Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 flex flex-col gap-8 animate-fade-in">
        {!hasMaterials ? (
          <EmptyState />
        ) : (
          <>
            {/* 1. Continue Reading Section */}
            <ContinueReadingSection
              items={continueReadingItems}
              onSelect={(material, page) => handleOpenSample(material, page)}
            />

            {/* 2. Collections & Reading Status Filter Bar */}
            <CollectionsFilterBar
              collections={collections}
              selectedCollectionId={selectedCollectionId}
              selectedStatus={selectedStatus}
              onSelectCollection={setSelectedCollectionId}
              onSelectStatus={setSelectedStatus}
              onCreateCollection={handleCreateCollection}
              onDeleteCollection={handleDeleteCollection}
            />

            {/* 3. Custom Uploaded Local Materials */}
            <RecentMaterials
              customPdfs={customPdfs}
              collections={collections}
              docCollectionMap={docCollectionMap}
              highlightsMap={highlightsMap}
              notesMap={notesMap}
              statuses={statuses}
              lastOpenedMap={lastOpenedMap}
              lastReadPages={lastReadPages}
              selectedCollectionId={selectedCollectionId}
              selectedStatus={selectedStatus}
              onSelect={handleOpenUserDocument}
              onDelete={handleDeleteDocument}
              onCycleStatus={handleCycleStatus}
              onToggleCollection={handleToggleDocCollection}
            />

            {/* 4. Curated Sample Materials Collection */}
            <SampleMaterials
              materials={sampleMaterials}
              lastReadPages={lastReadPages}
              collections={collections}
              docCollectionMap={docCollectionMap}
              highlightsMap={highlightsMap}
              notesMap={notesMap}
              statuses={statuses}
              lastOpenedMap={lastOpenedMap}
              selectedCollectionId={selectedCollectionId}
              selectedStatus={selectedStatus}
              onSelect={handleOpenSample}
              onCycleStatus={handleCycleStatus}
              onToggleCollection={handleToggleDocCollection}
            />
          </>
        )}
      </main>

      {/* Knowledge Bridge Modal */}
      <KnowledgeBridgeModal
        isOpen={showKnowledgeBridge}
        onClose={() => setShowKnowledgeBridge(false)}
        onSelectItem={handleSelectKnowledgeItem}
      />

      {/* Fullscreen Reader Launcher Overlay */}
      <ReaderLauncher session={activeSession} onClose={closeSession} />
    </div>
  );
};

export default LibraryScreen;
