import axios from 'axios';
import { getPendingOperations, markOperationSynced } from './db';

let listeners = [];
export function onSyncEvent(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}
function emit(event, payload) {
  listeners.forEach((fn) => fn(event, payload));
}

let syncing = false;

export async function flushQueue(getToken) {
  if (syncing) return;
  if (!navigator.onLine) return;

  const pending = await getPendingOperations();
  if (pending.length === 0) return;

  syncing = true;
  emit('sync-start', { count: pending.length });

  try {
    const token = getToken();
    const operations = pending.map(({ client_id, tab, action, payload, server_id }) => ({
      client_id, tab, action, payload, server_id,
    }));

    const res = await axios.post('/api/sync', { operations }, {
      headers: { Authorization: `Bearer ${token}`, 'x-sync-source': 'offline-sync', 'x-device-id': deviceId() },
    });

    for (const result of res.data.results) {
      if (result.status === 'ok') {
        await markOperationSynced(result.client_id);
      }
    }
    emit('sync-complete', { results: res.data.results });
  } catch (err) {
    emit('sync-error', { error: err.message });
  } finally {
    syncing = false;
  }
}

function deviceId() {
  let id = localStorage.getItem('campusiq_device_id');
  if (!id) {
    id = `device-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('campusiq_device_id', id);
  }
  return id;
}

export function initSyncListeners(getToken) {
  window.addEventListener('online', () => flushQueue(getToken));
  // Retry periodically in case 'online' fires but the network is still flaky.
  setInterval(() => flushQueue(getToken), 30000);
  // Try once immediately on load.
  flushQueue(getToken);
}
