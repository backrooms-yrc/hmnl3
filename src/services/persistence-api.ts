import { persistenceService } from '@/services/persistence-service';
import { backupScheduler } from '@/services/backup-scheduler';
import { recoveryTestService } from '@/services/recovery-test-service';
import { indexedDBService } from '@/services/indexeddb-service';

export interface PersistenceAPIResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: string;
  timestamp: string;
}

function createResponse<T>(success: boolean, data?: T, error?: string): PersistenceAPIResponse<T> {
  return {
    success,
    data: data ?? null,
    error,
    timestamp: new Date().toISOString(),
  };
}

export const persistenceAPI = {
  async createBackup(): Promise<PersistenceAPIResponse<{ backupId: string; size: number }>> {
    try {
      const backup = await persistenceService.createBackup();
      return createResponse(true, {
        backupId: backup.metadata.id,
        size: backup.metadata.size,
      });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async listBackups(): Promise<PersistenceAPIResponse<Array<{ id: string; timestamp: string; size: number }>>> {
    try {
      const backups = await persistenceService.listBackups();
      return createResponse(true, backups);
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async restoreBackup(backupId: string): Promise<PersistenceAPIResponse<{ message: string }>> {
    try {
      const result = await persistenceService.restoreBackup(backupId);
      return createResponse(result.success, { message: result.message });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async deleteBackup(backupId: string): Promise<PersistenceAPIResponse<{ deleted: boolean }>> {
    try {
      await persistenceService.deleteBackup(backupId);
      return createResponse(true, { deleted: true });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async exportBackup(backupId: string): Promise<Blob | null> {
    return persistenceService.exportBackupToFile(backupId);
  },

  async importBackup(file: File): Promise<PersistenceAPIResponse<{ backupId: string }>> {
    try {
      const result = await persistenceService.importBackupFromFile(file);
      if (result.success && result.backupId) {
        return createResponse(true, { backupId: result.backupId });
      }
      return createResponse(false, undefined, result.message);
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async checkConsistency(): Promise<PersistenceAPIResponse<{ isValid: boolean; errorCount: number }>> {
    try {
      const result = await persistenceService.checkConsistency();
      return createResponse(true, {
        isValid: result.isValid,
        errorCount: result.errors.length,
      });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async getStats(): Promise<PersistenceAPIResponse<{
    totalRecords: number;
    totalSize: number;
    lastBackup: string | null;
    cacheSize: number;
    backupCount: number;
    syncQueueSize: number;
  }>> {
    try {
      const stats = await persistenceService.getStats();
      const dbStats = await indexedDBService.getStats();
      
      return createResponse(true, {
        totalRecords: stats.totalRecords,
        totalSize: stats.totalSize,
        lastBackup: stats.lastBackup,
        cacheSize: dbStats.cacheSize,
        backupCount: dbStats.backupCount,
        syncQueueSize: dbStats.syncQueueSize,
      });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async getSyncStatus(): Promise<PersistenceAPIResponse<{
    lastSyncTime: string | null;
    pendingChanges: number;
    isSyncing: boolean;
    lastSyncError: string | null;
  }>> {
    try {
      const status = persistenceService.getSyncStatus();
      return createResponse(true, status);
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async syncNow(): Promise<PersistenceAPIResponse<{ syncedCount: number }>> {
    try {
      const result = await persistenceService.syncPendingChanges();
      return createResponse(result.success, { syncedCount: result.syncedCount });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async clearCache(): Promise<PersistenceAPIResponse<{ cleared: boolean }>> {
    try {
      await persistenceService.clearCache();
      return createResponse(true, { cleared: true });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async startBackupScheduler(config?: {
    enabled?: boolean;
    intervalMinutes?: number;
    maxBackups?: number;
  }): Promise<PersistenceAPIResponse<{ started: boolean }>> {
    try {
      backupScheduler.start(config);
      return createResponse(true, { started: true });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async stopBackupScheduler(): Promise<PersistenceAPIResponse<{ stopped: boolean }>> {
    try {
      backupScheduler.stop();
      return createResponse(true, { stopped: true });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async getSchedulerStatus(): Promise<PersistenceAPIResponse<{
    isRunning: boolean;
    lastRunTime: string | null;
    nextRunTime: string | null;
    config: { enabled: boolean; intervalMinutes: number; maxBackups: number };
  }>> {
    try {
      const status = backupScheduler.getStatus();
      return createResponse(true, {
        isRunning: status.isRunning,
        lastRunTime: status.lastRunTime?.toISOString() || null,
        nextRunTime: status.nextRunTime?.toISOString() || null,
        config: status.config,
      });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async runTests(): Promise<PersistenceAPIResponse<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: Array<{ testName: string; passed: boolean; duration: number; error?: string }>;
  }>> {
    try {
      const report = await recoveryTestService.runAllTests();
      return createResponse(true, {
        totalTests: report.totalTests,
        passedTests: report.passedTests,
        failedTests: report.failedTests,
        results: report.results,
      });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },

  async generateTestReport(): Promise<PersistenceAPIResponse<{ report: string }>> {
    try {
      const report = await recoveryTestService.generateTestReport();
      return createResponse(true, { report });
    } catch (error) {
      return createResponse(false, undefined, String(error));
    }
  },
};
