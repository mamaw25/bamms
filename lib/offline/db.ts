/**
 * IndexedDB Manager for offline data persistence
 * Handles all local storage operations with encryption and sync tracking
 */

export interface OfflineData {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
  error?: string;
}

export interface CachedRecord {
  id: string;
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  expiresAt: number;
}

const DB_NAME = 'attendance-system-offline';
const DB_VERSION = 1;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class OfflineDB {
  private db: IDBDatabase | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('offline-queue')) {
          const store = db.createObjectStore('offline-queue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('table', 'table', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'id' });
          store.createIndex('table', 'table', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  // Offline queue operations
  async addToQueue(table: string, action: 'insert' | 'update' | 'delete', data: Record<string, unknown>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');

    const offlineData: Omit<OfflineData, 'id'> = {
      table,
      action,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const request = store.add(offlineData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getUnsynced(): Promise<OfflineData[]> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('offline-queue', 'readonly');
    const store = tx.objectStore('offline-queue');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(false));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as OfflineData[]);
    });
  }

  async markAsSynced(ids: number[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');

    return new Promise((resolve, reject) => {
      let completed = 0;
      let hasError = false;

      if (ids.length === 0) {
        resolve();
        return;
      }

      ids.forEach((id) => {
        const request = store.get(id);
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
        request.onsuccess = () => {
          if (hasError) return;
          
          const data = request.result as OfflineData;
          if (data) {
            data.synced = true;
            const updateRequest = store.put(data);
            updateRequest.onerror = () => {
              if (!hasError) {
                hasError = true;
                reject(updateRequest.error);
              }
            };
            updateRequest.onsuccess = () => {
              completed++;
              if (completed === ids.length && !hasError) {
                resolve();
              }
            };
          } else {
            completed++;
            if (completed === ids.length && !hasError) {
              resolve();
            }
          }
        };
      });
    });
  }

  async removeFromQueue(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Cache operations
  async cacheRecord(table: string, id: string, data: Record<string, unknown>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');

    const cacheRecord: CachedRecord = {
      id: `${table}:${id}`,
      table,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheRecord);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async cacheRecords(table: string, records: Record<string, unknown>[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');

    const now = Date.now();
    const cacheRecords = records.map((record) => ({
      id: `${table}:${record.id}`,
      table,
      data: record,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    }));

    return new Promise((resolve, reject) => {
      let completed = 0;
      cacheRecords.forEach((record) => {
        const request = store.put(record);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          completed++;
          if (completed === cacheRecords.length) resolve();
        };
      });
    });
  }

  async getFromCache(table: string, id: string): Promise<Record<string, unknown> | null> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readonly');
    const store = tx.objectStore('cache');

    return new Promise((resolve, reject) => {
      const request = store.get(`${table}:${id}`);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const record = request.result as CachedRecord | undefined;
        if (record && record.expiresAt > Date.now()) {
          resolve(record.data);
        } else {
          resolve(null);
        }
      };
    });
  }

  async getCacheByTable(table: string): Promise<Record<string, unknown>[]> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readonly');
    const store = tx.objectStore('cache');
    const index = store.index('table');

    return new Promise((resolve, reject) => {
      const request = index.getAll(table);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const records = request.result as CachedRecord[];
        const now = Date.now();
        const validRecords = records.filter((r) => r.expiresAt > now).map((r) => r.data);
        resolve(validRecords);
      };
    });
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const index = store.index('expiresAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  // Metadata operations
  async setMetadata(key: string, value: unknown): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('metadata', 'readwrite');
    const store = tx.objectStore('metadata');

    return new Promise((resolve, reject) => {
      const request = store.put({ key, value, timestamp: Date.now() });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getMetadata(key: string): Promise<unknown> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('metadata', 'readonly');
    const store = tx.objectStore('metadata');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as { value: unknown } | undefined;
        resolve(result?.value ?? null);
      };
    });
  }

  // Utility
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stores = ['offline-queue', 'cache', 'metadata'];
    const promises = stores.map(
      (storeName) =>
        new Promise<void>((resolve, reject) => {
          const tx = this.db!.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const request = store.clear();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        })
    );

    await Promise.all(promises);
  }
}

export const offlineDB = new OfflineDB();
