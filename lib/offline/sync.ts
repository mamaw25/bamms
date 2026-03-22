/**
 * Sync Manager for offline changes
 * Handles queuing, tracking, and syncing offline changes when online
 */

import { offlineDB, OfflineData } from './db';

export interface SyncResult {
  id: number;
  success: boolean;
  error?: string;
}

export interface SyncProgress {
  total: number;
  synced: number;
  failed: number;
  inProgress: boolean;
}

class SyncManager {
  private syncing = false;
  private syncListeners: Set<(progress: SyncProgress) => void> = new Set();
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.syncOfflineQueue();
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners();
  }

  // Queue operations
  async queueOperation(
    table: string,
    action: 'insert' | 'update' | 'delete',
    data: Record<string, unknown>
  ): Promise<void> {
    await offlineDB.init();
    await offlineDB.addToQueue(table, action, data);
    this.notifyListeners();
  }

  // Sync operations
  async syncOfflineQueue(): Promise<SyncResult[]> {
    if (this.syncing || !this.isOnline) return [];

    this.syncing = true;
    this.notifyListeners();

    try {
      await offlineDB.init();
      const unsynced = await offlineDB.getUnsynced();

      if (unsynced.length === 0) {
        this.syncing = false;
        return [];
      }

      const results: SyncResult[] = [];

      // Process operations grouped by table
      const grouped = this.groupByTable(unsynced);

      for (const [table, operations] of Object.entries(grouped)) {
        for (const operation of operations as OfflineData[]) {
          try {
            const result = await this.syncOperation(table, operation);
            results.push(result);

            if (result.success) {
              await offlineDB.removeFromQueue(parseInt(operation.id, 10));
            }

            this.notifyListeners();
          } catch (error) {
            results.push({
              id: parseInt(operation.id, 10),
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            this.notifyListeners();
          }
        }
      }

      this.syncing = false;
      this.notifyListeners();
      return results;
    } catch (error) {
      this.syncing = false;
      this.notifyListeners();
      throw error;
    }
  }

  private async syncOperation(table: string, operation: OfflineData): Promise<SyncResult> {
    const response = await fetch('/api/offline/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table,
        action: operation.action,
        data: operation.data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    return {
      id: parseInt(operation.id, 10),
      success: true,
    };
  }

  private groupByTable(operations: OfflineData[]): Record<string, OfflineData[]> {
    return operations.reduce(
      (acc, op) => {
        if (!acc[op.table]) {
          acc[op.table] = [];
        }
        acc[op.table].push(op);
        return acc;
      },
      {} as Record<string, OfflineData[]>
    );
  }

  // Progress tracking
  async getSyncProgress(): Promise<SyncProgress> {
    await offlineDB.init();
    const unsynced = await offlineDB.getUnsynced();

    return {
      total: unsynced.length,
      synced: unsynced.filter((op) => op.synced).length,
      failed: unsynced.filter((op) => op.error).length,
      inProgress: this.syncing,
    };
  }

  // Listeners
  addProgressListener(listener: (progress: SyncProgress) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private async notifyListeners(): Promise<void> {
    const progress = await this.getSyncProgress();
    this.syncListeners.forEach((listener) => listener(progress));
  }

  // Status
  isOnlineMode(): boolean {
    return this.isOnline;
  }

  isSyncing(): boolean {
    return this.syncing;
  }

  // Cache management
  async cacheData(table: string, id: string, data: Record<string, unknown>): Promise<void> {
    await offlineDB.init();
    await offlineDB.cacheRecord(table, id, data);
  }

  async cacheDataBatch(table: string, records: Record<string, unknown>[]): Promise<void> {
    await offlineDB.init();
    await offlineDB.cacheRecords(table, records);
  }

  async getCachedData(table: string, id: string): Promise<Record<string, unknown> | null> {
    await offlineDB.init();
    return offlineDB.getFromCache(table, id);
  }

  async getCachedDataByTable(table: string): Promise<Record<string, unknown>[]> {
    await offlineDB.init();
    return offlineDB.getCacheByTable(table);
  }

  // Cleanup
  async clearExpiredCache(): Promise<void> {
    await offlineDB.init();
    await offlineDB.clearExpiredCache();
  }
}

export const syncManager = new SyncManager();
