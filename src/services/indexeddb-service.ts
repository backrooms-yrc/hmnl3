import type { CacheEntry, PersistenceConfig } from '@/types/persistence';

const DB_NAME = 'HMNL_PERSISTENCE';
const DB_VERSION = 1;

interface DBSchema {
  cache: CacheEntry;
  backups: { id: string; data: string; timestamp: number; size: number };
  syncQueue: { id: string; operation: string; data: unknown; timestamp: number };
}

type StoreNames = keyof DBSchema;

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[IndexedDB] 初始化失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] 初始化成功');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('ttl', 'ttl', { unique: false });
        }

        if (!db.objectStoreNames.contains('backups')) {
          const backupStore = db.createObjectStore('backups', { keyPath: 'id' });
          backupStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('[IndexedDB] 数据库结构创建完成');
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: StoreNames, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.init();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async set<T>(key: string, value: T, ttl: number = 3600000): Promise<void> {
    const store = await this.getStore('cache', 'readwrite');
    
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      version: '1.0',
    };

    return new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const store = await this.getStore('cache', 'readonly');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        
        if (!entry) {
          resolve(null);
          return;
        }

        if (Date.now() - entry.timestamp > entry.ttl) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(entry.value);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    const store = await this.getStore('cache', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const store = await this.getStore('cache', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllKeys(): Promise<string[]> {
    const store = await this.getStore('cache', 'readonly');
    
    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }

  async saveBackup(id: string, data: string): Promise<void> {
    const store = await this.getStore('backups', 'readwrite');
    
    const backup = {
      id,
      data,
      timestamp: Date.now(),
      size: new Blob([data]).size,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(backup);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getBackup(id: string): Promise<string | null> {
    const store = await this.getStore('backups', 'readonly');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        const backup = request.result;
        resolve(backup ? backup.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBackups(): Promise<Array<{ id: string; timestamp: number; size: number }>> {
    const store = await this.getStore('backups', 'readonly');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const backups = request.result.map((b: { id: string; timestamp: number; size: number }) => ({
          id: b.id,
          timestamp: b.timestamp,
          size: b.size,
        }));
        resolve(backups);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBackup(id: string): Promise<void> {
    const store = await this.getStore('backups', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addToSyncQueue(operation: string, data: unknown): Promise<string> {
    const store = await this.getStore('syncQueue', 'readwrite');
    
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const entry = {
      id,
      operation,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<Array<{ id: string; operation: string; data: unknown; timestamp: number }>> {
    const store = await this.getStore('syncQueue', 'readonly');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const store = await this.getStore('syncQueue', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue(): Promise<void> {
    const store = await this.getStore('syncQueue', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStats(): Promise<{ cacheSize: number; backupCount: number; syncQueueSize: number }> {
    const cacheKeys = await this.getAllKeys();
    const backups = await this.getAllBackups();
    const syncQueue = await this.getSyncQueue();

    return {
      cacheSize: cacheKeys.length,
      backupCount: backups.length,
      syncQueueSize: syncQueue.length,
    };
  }
}

export const indexedDBService = new IndexedDBService();
