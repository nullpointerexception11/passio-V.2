/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { useFileImport } from '../hooks/useFileImport';
import { LibraryHeader } from './LibraryHeader';
import { ImportSection } from './ImportSection';
import { RecentMaterials } from './RecentMaterials';
import { SampleMaterials } from './SampleMaterials';
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
    handleOpenSample,
    handleCustomFileLoaded,
    handleSelectKnowledgeItem,
    closeSession,
    goToHome,
    setActiveSession,
  } = useLibrary();

  const { fileInputRef, triggerFilePicker, handleFileChange } = useFileImport({
    onFileLoaded: handleCustomFileLoaded,
  });

  const hasMaterials = sampleMaterials.length > 0 || customPdfs.length > 0;

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
            {/* Custom Uploaded Local Materials */}
            <RecentMaterials customPdfs={customPdfs} onSelect={setActiveSession} />

            {/* Curated Sample Materials Collection */}
            <SampleMaterials
              materials={sampleMaterials}
              lastReadPages={lastReadPages}
              onSelect={handleOpenSample}
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
