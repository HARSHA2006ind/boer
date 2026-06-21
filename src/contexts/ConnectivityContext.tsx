import { createContext, useContext, ReactNode } from 'react';
import { useConnectivity, ConnectivityStatus } from '../hooks/useConnectivity';

interface ConnectivityContextType {
  status: ConnectivityStatus;
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  triggerSync: () => Promise<void>;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  status: 'online',
  isOnline: true,
  pendingSyncCount: 0,
  lastSyncTime: null,
  isSyncing: false,
  triggerSync: async () => {},
});

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const connectivity = useConnectivity();
  return (
    <ConnectivityContext.Provider
      value={{
        status: connectivity.status,
        isOnline: connectivity.isOnline,
        pendingSyncCount: connectivity.pendingCount,
        lastSyncTime: connectivity.lastSyncDate,
        isSyncing: connectivity.isSyncing,
        triggerSync: connectivity.triggerSync,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivityContext() {
  return useContext(ConnectivityContext);
}
