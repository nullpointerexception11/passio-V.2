/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext } from 'react';

interface SessionContextType {
  lockSession: () => void;
}

const SessionContext = createContext<SessionContextType>({
  lockSession: () => {},
});

export const SessionProvider: React.FC<{ lockSession: () => void; children: React.ReactNode }> = ({
  lockSession,
  children,
}) => {
  return (
    <SessionContext.Provider value={{ lockSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
