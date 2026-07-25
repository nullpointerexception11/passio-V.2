/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { INotebook } from '../../core/notebooks/NotebookModel';
import { WritingRoomLayout } from '../../features/writing/components/WritingRoomLayout';

interface WritingEditorScreenProps {
  notebook: INotebook;
  onBack: () => void;
  onNotebookUpdated: (updated: INotebook) => void;
}

export const WritingEditorScreen: React.FC<WritingEditorScreenProps> = ({
  notebook,
  onBack,
  onNotebookUpdated,
}) => {
  return (
    <WritingRoomLayout
      notebook={notebook}
      onBack={onBack}
      onNotebookUpdated={onNotebookUpdated}
    />
  );
};

export default WritingEditorScreen;
