import type { BroadcastPage, BroadcastFile, UserInteraction, SyncMetadata, CacheState } from '@/types/broadcast';
import type { Profile } from '@/types/types';

const DB_NAME = 'HMNL_BroadcastDB';
const DB_VERSION = 1;
const STORES = {
  PAGES: 'broadcast_pages',
  FILES: 'broadcast_files',
  INTERACTIONS: 'user_interactions',
  METADATA: 'sync_metadata',
  CACHE_STATE: 'cache_state'
} as const;

class BroadcastDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORES.PAGES)) {
          const pageStore = db.createObjectStore(STORES.PAGES, { keyPath: 'id' });
          pageStore.createIndex('user_id', 'user_id', { unique: false });
          pageStore.createIndex('is_public', 'is_public', { unique: false });
          pageStore.createIndex('created_at', 'created_at', { unique: false });
          pageStore.createIndex('updated_at', 'updated_at', { unique: false });
          pageStore.createIndex('title', 'title', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.FILES)) {
          const fileStore = db.createObjectStore(STORES.FILES, { keyPath: 'id' });
          fileStore.createIndex('page_id', 'page_id', { unique: false });
          fileStore.createIndex('file_type', 'file_type', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.INTERACTIONS)) {
          const interactionStore = db.createObjectStore(STORES.INTERACTIONS, { keyPath: 'id' });
          interactionStore.createIndex('page_id', 'page_id', { unique: false });
          interactionStore.createIndex('user_id', 'user_id', { unique: false });
          interactionStore.createIndex('type', 'type', { unique: false });
          interactionStore.createIndex('timestamp', 'timestamp', { unique: false });
          interactionStore.createIndex('page_user', ['page_id', 'user_id'], { unique: true });
        }

        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains(STORES.CACHE_STATE)) {
          db.createObjectStore(STORES.CACHE_STATE, { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  async addPage(page: BroadcastPage): Promise<void> {
    const db = await this.init();
    const store = this.getStore(STORES.PAGES, 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...page,
        _synced: false,
        _lastModified: new Date().toISOString(),
        _version: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updatePage(id: string, updates: Partial<BroadcastPage>): Promise<void> {
    const db = await this.init();
    const store = this.getStore(STORES.PAGES, 'readwrite');
    
    const existing = await this.getPage(id);
    if (!existing) throw new Error(`Page ${id} not found`);

    const updatedPage = {
      ...existing,
      ...updates,
      id,
      _synced: false,
      _lastModified: new Date().toISOString(),
      _version: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(updatedPage);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPage(id: string): Promise<BroadcastPage | null> {
    const db = await this.init();
    const store = this.getStore(STORES.PAGES);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPages(): Promise<BroadcastPage[]> {
    const db = await this.init();
    const store = this.getStore(STORES.PAGES);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getPublicPages(): Promise<BroadcastPage[]> {
    const allPages = await this.getAllPages();
    return allPages.filter(p => p.is_public);
  }

  async deletePage(id: string): Promise<void> {
    const db = await this.init();
    const store = this.getStore(STORES.PAGES, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async searchPages(query: string): Promise<BroadcastPage[]> {
    const allPages = await this.getAllPages();
    const lowerQuery = query.toLowerCase();

    return allPages.filter(page =>
      page.title.toLowerCase().includes(lowerQuery) ||
      (page.description && page.description.toLowerCase().includes(lowerQuery)) ||
      (page.username && page.username.toLowerCase().includes(lowerQuery))
    );
  }

  async getPagesByUser(userId: string): Promise<BroadcastPage[]> {
    const db = await this.init();
    const store = this.getStore(STORES.PAGES);
    const index = store.index('user_id');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(id: string): Promise<BroadcastFile | null> {
    const db = await this.init();
    const store = this.getStore(STORES.FILES);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesByPage(pageId: string): Promise<BroadcastFile[]> {
    const db = await this.init();
    const store = this.getStore(STORES.FILES);
    const index = store.index('page_id');

    return new Promise((resolve, reject) => {
      const request = index.getAll(pageId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async addFile(file: BroadcastFile): Promise<void> {
    const db = await this.init();
    const store = this.getStore(STORES.FILES, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(file);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.init();
    const store = this.getStore(STORES.FILES, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addInteraction(interaction: UserInteraction): Promise<void> {
    const db = await this.init();
    const store = this.getStore(STORES.INTERACTIONS, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(interaction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserInteractions(userId: string): Promise<UserInteraction[]> {
    const db = await this.init();
    const store = this.getStore(STORES.INTERACTIONS);
    const index = store.index('user_id');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getPageInteractions(pageId: string): Promise<UserInteraction[]> {
    const db = await this.init();
    const store = this.getStore(STORES.INTERACTIONS);
    const index = store.index('page_id');

    return new Promise((resolve, reject) => {
      const request = index.getAll(pageId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async recordView(pageId: string, userId?: string): Promise<void> {
    const interaction: UserInteraction = {
      id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      page_id: pageId,
      user_id: userId || 'anonymous',
      type: 'view',
      timestamp: new Date().toISOString()
    };

    await this.addInteraction(interaction);

    const page = await this.getPage(pageId);
    if (page) {
      await this.updatePage(pageId, {
        view_count: (page.view_count || 0) + 1
      });
    }
  }

  async getSyncMetadata(): Promise<SyncMetadata | null> {
    try {
      const data = localStorage.getItem('broadcast_sync_metadata');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async setSyncMetadata(metadata: SyncMetadata): Promise<void> {
    localStorage.setItem('broadcast_sync_metadata', JSON.stringify(metadata));
  }

  async getCacheState(): Promise<CacheState> {
    try {
      const data = localStorage.getItem('broadcast_cache_state');
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...parsed,
          files: parsed.files || []
        };
      }
      return {
        pages: [],
        files: [],
        interactions: [],
        lastUpdated: '',
        isDirty: false,
        syncStatus: 'idle'
      };
    } catch {
      return {
        pages: [],
        files: [],
        interactions: [],
        lastUpdated: '',
        isDirty: false,
        syncStatus: 'idle'
      };
    }
  }

  async setCacheState(state: CacheState): Promise<void> {
    localStorage.setItem('broadcast_cache_state', JSON.stringify({
      ...state,
      files: Array.from(state.files.entries())
    }));
  }

  async clearAllData(): Promise<void> {
    const db = await this.init();
    
    const stores = [STORES.PAGES, STORES.FILES, STORES.INTERACTIONS];
    
    for (const storeName of stores) {
      const store = this.getStore(storeName, 'readwrite');
      store.clear();
    }

    localStorage.removeItem('broadcast_sync_metadata');
    localStorage.removeItem('broadcast_cache_state');
  }

  async exportData(): Promise<string> {
    const pages = await this.getAllPages();
    const files: BroadcastFile[] = [];
    const interactions = await this.getUserInteractions('');

    for (const page of pages) {
      const pageFiles = await this.getFilesByPage(page.id);
      files.push(...pageFiles);
    }

    const exportData = {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      pages,
      files,
      interactions,
      metadata: await this.getSyncMetadata()
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonString: string): Promise<{ pages: number; files: number; errors: string[] }> {
    const errors: string[] = [];
    let importedPages = 0;
    let importedFiles = 0;

    try {
      const data = JSON.parse(jsonString);

      if (data.pages && Array.isArray(data.pages)) {
        for (const page of data.pages) {
          try {
            await this.addPage(page);
            importedPages++;
          } catch (error) {
            errors.push(`Failed to import page ${page.id}: ${error}`);
          }
        }
      }

      if (data.files && Array.isArray(data.files)) {
        for (const file of data.files) {
          try {
            await this.addFile(file);
            importedFiles++;
          } catch (error) {
            errors.push(`Failed to import file ${file.id}: ${error}`);
          }
        }
      }

      if (data.interactions && Array.isArray(data.interactions)) {
        for (const interaction of data.interactions) {
          try {
            await this.addInteraction(interaction);
          } catch (error) {
            errors.push(`Failed to import interaction: ${error}`);
          }
        }
      }

    } catch (error) {
      errors.push(`Failed to parse import data: ${error}`);
    }

    return { pages: importedPages, files: importedFiles, errors };
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }

    let totalSize = 0;
    const pages = await this.getAllPages();
    
    for (const page of pages) {
      totalSize += JSON.stringify(page).length * 2;
      
      const files = await this.getFilesByPage(page.id);
      for (const file of files) {
        totalSize += (file.file_data?.length || 0) + JSON.stringify(file).length * 2;
      }
    }

    return { used: totalSize, quota: 5 * 1024 * 1024 };
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

export const broadcastDB = new BroadcastDB();
export default broadcastDB;