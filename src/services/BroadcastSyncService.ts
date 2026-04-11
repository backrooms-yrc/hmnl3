import { broadcastDB } from './broadcastDB';
import type { BroadcastPage, SyncMetadata } from '@/types/broadcast';

interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  conflicts: number;
  errors: string[];
  timestamp: string;
}

interface ConflictResolution {
  localWins: boolean;
  reason: 'newer' | 'user_preference' | 'merge' | 'manual';
}

class BroadcastSyncService {
  private syncInterval: number | null = null;
  private isOnline: boolean = navigator.onLine;
  private lastSyncTime: string | null = null;
  private pendingChangesCount: number = 0;

  constructor() {
    this.setupNetworkListeners();
    this.loadSyncMetadata();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[BroadcastSync] 网络已恢复，开始同步...');
      this.sync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[BroadcastSync] 网络断开，切换到离线模式');
      this.updateCacheState({ syncStatus: 'offline' });
    });
  }

  private async loadSyncMetadata(): Promise<void> {
    try {
      const metadata = await broadcastDB.getSyncMetadata();
      if (metadata) {
        this.lastSyncTime = metadata.lastSyncTime;
        this.pendingChangesCount = metadata.pendingChanges;
      }
    } catch (error) {
      console.error('[BroadcastSync] 加载同步元数据失败:', error);
    }
  }

  async sync(): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: ['网络不可用'],
        timestamp: new Date().toISOString()
      };
    }

    console.log('[BroadcastSync] 开始数据同步...');

    try {
      await this.updateCacheState({ syncStatus: 'syncing' });

      const result = await this.performSync();

      this.lastSyncTime = result.timestamp;

      await this.saveSyncMetadata({
        lastSyncTime: result.timestamp,
        pendingChanges: this.pendingChangesCount,
        conflictCount: result.conflicts,
        version: '1.0.0'
      });

      await this.updateCacheState({
        syncStatus: result.success ? 'idle' : 'error',
        lastUpdated: new Date().toISOString()
      });

      console.log('[BroadcastSync] 同步完成:', result);
      return result;

    } catch (error) {
      console.error('[BroadcastSync] 同步失败:', error);
      
      await this.updateCacheState({
        syncStatus: 'error',
        isDirty: true
      });

      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: [error instanceof Error ? error.message : '未知错误'],
        timestamp: new Date().toISOString()
      };
    }
  }

  private async performSync(): Promise<SyncResult> {
    const errors: string[] = [];
    let uploaded = 0;
    let downloaded = 0;
    let conflicts = 0;

    try {
      const uploadResult = await this.uploadLocalChanges();
      uploaded = uploadResult.count;
      errors.push(...uploadResult.errors);

      const downloadResult = await this.downloadRemoteChanges();
      downloaded = downloadResult.count;
      conflicts = downloadResult.conflicts;
      errors.push(...downloadResult.errors);

    } catch (error) {
      errors.push(error instanceof Error ? error.message : '上传/下载过程出错');
    }

    return {
      success: errors.length === 0 && conflicts === 0,
      uploaded,
      downloaded,
      conflicts,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  private async uploadLocalChanges(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const allPages = await broadcastDB.getAllPages();
      const unsyncedPages = allPages.filter(p => !p._synced);

      for (const page of unsyncedPages) {
        try {
          await this.uploadPage(page);
          count++;
          this.pendingChangesCount--;
        } catch (error) {
          errors.push(`上传页面 ${page.id} 失败: ${error}`);
        }
      }

    } catch (error) {
      errors.push(`获取本地页面失败: ${error}`);
    }

    return { count, errors };
  }

  private async uploadPage(page: BroadcastPage): Promise<void> {
    const { createBroadcastPage, updateBroadcastPage } = await import('@/db/api');

    const pageData = {
      user_id: page.user_id,
      title: page.title,
      description: page.description || undefined,
      html_content: page.html_content || undefined,
      cover_image: page.cover_image || undefined,
      is_public: page.is_public
    };

    try {
      if (page.id.startsWith('bp_')) {
        const created = await createBroadcastPage(pageData);
        await broadcastDB.deletePage(page.id);
        
        const updatedPage = { ...page, id: created.id, _synced: true };
        await broadcastDB.addPage(updatedPage);

      } else {
        await updateBroadcastPage(page.id, pageData);
        await broadcastDB.updatePage(page.id, { _synced: true });
      }

    } catch (error) {
      throw new Error(`API调用失败: ${error}`);
    }
  }

  private async downloadRemoteChanges(): Promise<{ count: number; conflicts: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;
    let conflicts = 0;

    try {
      const { getPublicBroadcastPages } = await import('@/db/api');
      const remoteData = await getPublicBroadcastPages(1, 1000, '');

      for (const remotePage of remoteData.data as BroadcastPage[]) {
        try {
          const localPage = await broadcastDB.getPage(remotePage.id);

          if (!localPage) {
            await broadcastDB.addPage({
              ...remotePage,
              _synced: true,
              _lastModified: new Date().toISOString(),
              _version: Date.now()
            });
            count++;

          } else {
            const resolution = this.resolveConflict(localPage, remotePage);
            
            if (resolution.localWins) {
              conflicts++;
              console.log(`[BroadcastSync] 冲突解决: 本地版本胜出 (${remotePage.id})`);
            } else {
              await broadcastDB.addPage({
                ...remotePage,
                _synced: true,
                _lastModified: new Date().toISOString(),
                _version: Date.now()
              });
              count++;
            }
          }

        } catch (error) {
          errors.push(`处理远程页面 ${remotePage.id} 失败: ${error}`);
        }
      }

    } catch (error) {
      errors.push(`获取远程数据失败: ${error}`);
    }

    return { count, conflicts, errors };
  }

  resolveConflict(local: BroadcastPage, remote: BroadcastPage): ConflictResolution {
    const localVersion = local._version || 0;
    const remoteVersion = remote.updated_at ? new Date(remote.updated_at).getTime() : 0;
    const localModified = local._lastModified ? new Date(local._lastModified).getTime() : 0;

    if (localVersion > 0 && localModified > remoteVersion) {
      return { localWins: true, reason: 'newer' };
    }

    if (local.view_count > remote.view_count) {
      const merged = { ...remote, view_count: local.view_count };
      broadcastDB.updatePage(local.id, merged);
      return { localWins: false, reason: 'merge' };
    }

    return { localWins: false, reason: 'newer' };
  }

  async saveSyncMetadata(metadata: SyncMetadata): Promise<void> {
    await broadcastDB.setSyncMetadata(metadata);
  }

  private async updateCacheState(updates: Partial<{
    pages: BroadcastPage[];
    files: [string, BroadcastFile[]][];
    interactions: import('@/types/broadcast').UserInteraction[];
    lastUpdated: string;
    isDirty: boolean;
    syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
  }>): Promise<void> {
    const currentState = await broadcastDB.getCacheState();
    await broadcastDB.setCacheState({
      ...currentState,
      ...updates
    });
  }

  startAutoSync(intervalMs: number = 60000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = window.setInterval(() => {
      if (this.isOnline) {
        this.sync();
      }
    }, intervalMs);

    console.log(`[BroadcastSync] 自动同步已启动，间隔: ${intervalMs}ms`);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[BroadcastSync] 自动同步已停止');
    }
  }

  markAsDirty(): void {
    this.pendingChangesCount++;
    this.updateCacheState({ isDirty: true });
  }

  getStatus(): {
    isOnline: boolean;
    lastSyncTime: string | null;
    pendingChanges: number;
    syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
  } {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingChanges: this.pendingChangesCount,
      syncStatus: this.isOnline ? 'idle' : 'offline'
    };
  }

  async forceSync(): Promise<SyncResult> {
    console.log('[BroadcastSync] 强制同步...');
    return this.sync();
  }

  async clearAllLocalData(): Promise<void> {
    await broadcastDB.clearAllData();
    this.lastSyncTime = null;
    this.pendingChangesCount = 0;
    console.log('[BroadcastSync] 所有本地数据已清除');
  }

  destroy(): void {
    this.stopAutoSync();
    broadcastDB.close();
    console.log('[BroadcastSync] 服务已销毁');
  }
}

export const broadcastSyncService = new BroadcastSyncService();
export default broadcastSyncService;