/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PdfReaderScreen } from '../../../components/organisms/PdfReaderScreen';
import { IMaterialActiveSession } from '../types/material.types';

interface ReaderLauncherProps {
  session: IMaterialActiveSession | null;
  onClose: () => void;
}

export const ReaderLauncher: React.FC<ReaderLauncherProps> = ({ session, onClose }) => {
  if (!session) return null;

  return (
    <PdfReaderScreen
      docId={session.docId}
      docTitle={session.title}
      sourceUrlOrBuffer={session.buffer}
      initialPage={session.targetPage}
      onClose={onClose}
    />
  );
};
