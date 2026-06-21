import { openDB } from 'idb';

const DB_NAME = 'campusiq-offline';
const DB_VERSION = 1;
export const STORES = {
  CACHE: 'cache',       // last-known-good copies of server collections, keyed by `${tab}`
  QUEUE: 'queue',        // pending create/update operations made while offline
};

let dbPromise;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.CACHE)) {
          db.createObjectStore(STORES.CACHE, { keyPath: 'tab' });
        }
        if (!db.objectStoreNames.contains(STORES.QUEUE)) {
          const store = db.createObjectStore(STORES.QUEUE, { keyPath: 'client_id' });
          store.createIndex('by_created', 'created_at');
        }
      },
    });
  }
  return dbPromise;
}

export async function cacheCollection(tab, records) {
  const db = await getDB();
  await db.put(STORES.CACHE, { tab, records, cached_at: new Date().toISOString() });
}

export async function getCachedCollection(tab) {
  const db = await getDB();
  const entry = await db.get(STORES.CACHE, tab);
  return entry ? entry.records : [];
}

export async function enqueueOperation(op) {
  const db = await getDB();
  const client_id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record = { ...op, client_id, created_at: new Date().toISOString(), status: 'pending' };
  await db.put(STORES.QUEUE, record);
  return record;
}

export async function getPendingOperations() {
  const db = await getDB();
  const all = await db.getAll(STORES.QUEUE);
  return all.filter((op) => op.status === 'pending');
}

export async function markOperationSynced(client_id) {
  const db = await getDB();
  await db.delete(STORES.QUEUE, client_id);
}

export async function countPending() {
  const pending = await getPendingOperations();
  return pending.length;
}
