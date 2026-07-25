/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ImportSectionProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImportSection: React.FC<ImportSectionProps> = ({
  fileInputRef,
  onFileChange,
}) => {
  return (
    <input
      type="file"
      ref={fileInputRef}
      onChange={onFileChange}
      accept="application/pdf"
      className="hidden"
    />
  );
};
