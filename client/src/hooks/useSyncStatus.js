import { useEffect, useState } from 'react';
import { countPending } from '../offline/db';
import { onSyncEvent } from '../offline/syncQueue';

export function useSyncStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updatePending = () => countPending().then(setPending);
    updatePending();

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    const unsubscribe = onSyncEvent((event) => {
      if (event === 'sync-start') setSyncing(true);
      if (event === 'sync-complete' || event === 'sync-error') {
        setSyncing(false);
        updatePending();
      }
    });

    const interval = setInterval(updatePending, 5000);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { online, pending, syncing };
}
