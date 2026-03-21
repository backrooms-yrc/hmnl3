import { supabase } from '@/db/supabase';
import { indexedDBService } from './indexeddb-service';
import type { 
  BackupData, 
  BackupMetadata, 
  ConsistencyCheckResult, 
  ConsistencyError,
  SyncStatus,
  PersistenceStats 
} from '@/types/persistence';

const APP_VERSION = '1.0.0';

interface TableConfig {
  name: string;
  primaryKey: string;
  requiredFields: string[];
  relations?: { field: string; table: string }[];
}

const TABLE_CONFIGS: TableConfig[] = [
  { name: 'profiles', primaryKey: 'id', requiredFields: ['id', 'username', 'created_at'] },
  { name: 'channels', primaryKey: 'id', requiredFields: ['id', 'name', 'created_at'] },
  { name: 'posts', primaryKey: 'id', requiredFields: ['id', 'author_id', 'title', 'created_at'] },
  { name: 'comments', primaryKey: 'id', requiredFields: ['id', 'post_id', 'author_id', 'content', 'created_at'] },
  { name: 'announcements', primaryKey: 'id', requiredFields: ['id', 'title', 'content', 'created_at'] },
  { name: 'notifications', primaryKey: 'id', requiredFields: ['id', 'user_id', 'type', 'title', 'created_at'] },
  { name: 'reports', primaryKey: 'id', requiredFields: ['id', 'reporter_id', 'report_type', 'target_id', 'created_at'] },
];

class PersistenceService {
  private syncStatus: SyncStatus = {
    lastSyncTime: null,
    pendingChanges: 0,
    isSyncing: false,
    lastSyncError: null,
  };

  private cachePrefix = 'persistence_';

  async createBackup(): Promise<BackupData> {
    console.log('[Persistence] 开始创建备份...');
    
    const backupData: BackupData = {
      metadata: {
        id: `backup_${Date.now()}`,
        timestamp: new Date().toISOString(),
        size: 0,
        tables: TABLE_CONFIGS.map(t => t.name),
        checksum: '',
        version: APP_VERSION,
      },
      data: {},
    };

    let totalSize = 0;

    for (const table of TABLE_CONFIGS) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*');

        if (error) {
          console.error(`[Persistence] 备份表 ${table.name} 失败:`, error);
          continue;
        }

        backupData.data[table.name] = data || [];
        totalSize += JSON.stringify(data).length;
      } catch (err) {
        console.error(`[Persistence] 备份表 ${table.name} 异常:`, err);
      }
    }

    backupData.metadata.size = totalSize;
    backupData.metadata.checksum = await this.calculateChecksum(backupData.data);

    const backupString = JSON.stringify(backupData);
    await indexedDBService.saveBackup(backupData.metadata.id, backupString);

    console.log('[Persistence] 备份创建完成:', backupData.metadata.id);
    
    return backupData;
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    console.log('[Persistence] 开始恢复备份:', backupId);
    
    try {
      const backupString = await indexedDBService.getBackup(backupId);
      
      if (!backupString) {
        return { success: false, message: '备份不存在' };
      }

      const backupData: BackupData = JSON.parse(backupString);

      const checksumValid = await this.verifyChecksum(backupData.data, backupData.metadata.checksum);
      if (!checksumValid) {
        return { success: false, message: '备份数据校验失败，数据可能已损坏' };
      }

      for (const table of TABLE_CONFIGS) {
        const tableData = backupData.data[table.name];
        if (!tableData || tableData.length === 0) continue;

        const { error } = await supabase
          .from(table.name)
          .upsert(tableData, { onConflict: table.primaryKey });

        if (error) {
          console.error(`[Persistence] 恢复表 ${table.name} 失败:`, error);
        }
      }

      console.log('[Persistence] 备份恢复完成');
      return { success: true, message: '备份恢复成功' };
    } catch (err) {
      console.error('[Persistence] 恢复备份异常:', err);
      return { success: false, message: `恢复失败: ${err}` };
    }
  }

  async listBackups(): Promise<BackupMetadata[]> {
    const backups = await indexedDBService.getAllBackups();
    
    return backups.map(b => ({
      id: b.id,
      timestamp: new Date(b.timestamp).toISOString(),
      size: b.size,
      tables: TABLE_CONFIGS.map(t => t.name),
      checksum: '',
      version: APP_VERSION,
    }));
  }

  async deleteBackup(backupId: string): Promise<void> {
    await indexedDBService.deleteBackup(backupId);
    console.log('[Persistence] 备份已删除:', backupId);
  }

  async checkConsistency(): Promise<ConsistencyCheckResult> {
    console.log('[Persistence] 开始一致性检查...');
    
    const errors: ConsistencyError[] = [];

    for (const table of TABLE_CONFIGS) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*');

        if (error) {
          errors.push({
            table: table.name,
            recordId: 'N/A',
            field: 'N/A',
            expected: 'valid data',
            actual: error.message,
            message: `表查询失败: ${error.message}`,
          });
          continue;
        }

        if (!data) continue;

        for (const record of data) {
          for (const field of table.requiredFields) {
            if (record[field] === undefined || record[field] === null) {
              errors.push({
                table: table.name,
                recordId: record[table.primaryKey] || 'unknown',
                field,
                expected: 'non-null value',
                actual: record[field],
                message: `必填字段 ${field} 为空`,
              });
            }
          }
        }

        if (table.relations) {
          for (const relation of table.relations) {
            const invalidRecords = data.filter(r => r[relation.field] && !r[relation.field]);
            for (const record of invalidRecords) {
              errors.push({
                table: table.name,
                recordId: record[table.primaryKey] || 'unknown',
                field: relation.field,
                expected: `valid reference to ${relation.table}`,
                actual: record[relation.field],
                message: `外键引用无效: ${relation.field}`,
              });
            }
          }
        }
      } catch (err) {
        errors.push({
          table: table.name,
          recordId: 'N/A',
          field: 'N/A',
          expected: 'valid operation',
          actual: String(err),
          message: `检查异常: ${err}`,
        });
      }
    }

    const result: ConsistencyCheckResult = {
      isValid: errors.length === 0,
      errors,
      timestamp: new Date().toISOString(),
    };

    console.log('[Persistence] 一致性检查完成:', result.isValid ? '通过' : `发现 ${errors.length} 个问题`);
    
    return result;
  }

  async getStats(): Promise<PersistenceStats> {
    const dbStats = await indexedDBService.getStats();
    
    let totalRecords = 0;
    for (const table of TABLE_CONFIGS) {
      try {
        const { count, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (!error && count) {
          totalRecords += count;
        }
      } catch {
        // ignore
      }
    }

    const backups = await this.listBackups();
    const lastBackup = backups.length > 0 ? backups[0].timestamp : null;

    return {
      totalRecords,
      totalSize: dbStats.cacheSize * 1024,
      lastBackup,
      cacheHitRate: 0,
      averageResponseTime: 0,
    };
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  async syncPendingChanges(): Promise<{ success: boolean; syncedCount: number }> {
    if (this.syncStatus.isSyncing) {
      return { success: false, syncedCount: 0 };
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.lastSyncError = null;

    try {
      const queue = await indexedDBService.getSyncQueue();
      let syncedCount = 0;

      for (const item of queue) {
        try {
          const { operation, data } = item as { operation: string; data: Record<string, unknown> };
          const { table, action, record } = data as { table: string; action: string; record: Record<string, unknown> };

          if (action === 'insert') {
            await supabase.from(table).insert(record);
          } else if (action === 'update') {
            const primaryKey = TABLE_CONFIGS.find(t => t.name === table)?.primaryKey || 'id';
            await supabase.from(table).update(record).eq(primaryKey, record[primaryKey]);
          } else if (action === 'delete') {
            const primaryKey = TABLE_CONFIGS.find(t => t.name === table)?.primaryKey || 'id';
            await supabase.from(table).delete().eq(primaryKey, record[primaryKey]);
          }

          await indexedDBService.removeFromSyncQueue(item.id);
          syncedCount++;
        } catch (err) {
          console.error('[Persistence] 同步失败:', err);
        }
      }

      this.syncStatus.lastSyncTime = new Date().toISOString();
      this.syncStatus.pendingChanges = queue.length - syncedCount;
      
      return { success: true, syncedCount };
    } catch (err) {
      this.syncStatus.lastSyncError = String(err);
      return { success: false, syncedCount: 0 };
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  async queueChange(table: string, action: 'insert' | 'update' | 'delete', record: Record<string, unknown>): Promise<void> {
    await indexedDBService.addToSyncQueue('db_change', { table, action, record });
    this.syncStatus.pendingChanges++;
  }

  async cacheData<T>(key: string, data: T, ttl: number = 300000): Promise<void> {
    await indexedDBService.set(`${this.cachePrefix}${key}`, data, ttl);
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    return indexedDBService.get<T>(`${this.cachePrefix}${key}`);
  }

  async clearCache(): Promise<void> {
    await indexedDBService.clear();
    console.log('[Persistence] 缓存已清空');
  }

  private async calculateChecksum(data: Record<string, unknown[]>): Promise<string> {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyChecksum(data: Record<string, unknown[]>, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.calculateChecksum(data);
    return actualChecksum === expectedChecksum;
  }

  async exportBackupToFile(backupId: string): Promise<Blob | null> {
    const backupString = await indexedDBService.getBackup(backupId);
    if (!backupString) return null;
    
    return new Blob([backupString], { type: 'application/json' });
  }

  async importBackupFromFile(file: File): Promise<{ success: boolean; message: string; backupId?: string }> {
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      if (!backupData.metadata || !backupData.data) {
        return { success: false, message: '无效的备份文件格式' };
      }

      backupData.metadata.id = `imported_${Date.now()}`;
      backupData.metadata.timestamp = new Date().toISOString();

      await indexedDBService.saveBackup(backupData.metadata.id, JSON.stringify(backupData));

      return { 
        success: true, 
        message: '备份导入成功', 
        backupId: backupData.metadata.id 
      };
    } catch (err) {
      return { success: false, message: `导入失败: ${err}` };
    }
  }
}

export const persistenceService = new PersistenceService();
