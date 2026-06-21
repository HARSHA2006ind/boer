import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { processSyncQueue, onSyncStatusChange, isSyncInProgress } from '../services/syncManager';
import { syncQueue } from '../services/syncQueue';
import { getLastSync } from '../services/syncTracker';

export type ConnectivityStatus = 'online' | 'offline' | 'syncing';

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(true);
  const [status, setStatus] = useState<ConnectivityStatus>('online');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const wasOffline = useRef(false);

  const refreshPending = useCallback(async () => {
    const count = await syncQueue.pendingCount();
    setPendingCount(count);
  }, []);

  const refreshLastSync = useCallback(async () => {
    const date = await getLastSync();
    setLastSyncDate(date);
  }, []);

  useEffect(() => {
    refreshPending();
    refreshLastSync();

    const unsubNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      setStatus(online ? 'online' : 'offline');

      if (online && wasOffline.current) {
        processSyncQueue().then(() => {
          refreshPending();
          refreshLastSync();
        });
      }
      wasOffline.current = !online;
    });

    const unsubSync = onSyncStatusChange((s, remaining) => {
      if (s === 'syncing') {
        setStatus('syncing');
      } else {
        setIsOnline(true);
        setStatus('online');
        refreshPending();
        refreshLastSync();
      }
    });

    return () => {
      unsubNetInfo();
      unsubSync();
    };
  }, [refreshPending, refreshLastSync]);

  const triggerSync = useCallback(async () => {
    if (isOnline) {
      await processSyncQueue();
      await refreshPending();
      await refreshLastSync();
    }
  }, [isOnline, refreshPending, refreshLastSync]);

  return {
    isOnline,
    status,
    pendingCount,
    lastSyncDate,
    isSyncing: status === 'syncing',
    triggerSync,
    refreshPending,
    refreshLastSync,
  };
}
