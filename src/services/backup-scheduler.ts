import { persistenceService } from './persistence-service';
import type { BackupMetadata } from '@/types/persistence';

interface SchedulerConfig {
  enabled: boolean;
  intervalMinutes: number;
  maxBackups: number;
  autoCleanup: boolean;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  enabled: true,
  intervalMinutes: 60,
  maxBackups: 10,
  autoCleanup: true,
};

class BackupScheduler {
  private config: SchedulerConfig = DEFAULT_CONFIG;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private lastRunTime: Date | null = null;
  private nextRunTime: Date | null = null;

  start(config?: Partial<SchedulerConfig>): void {
    if (this.isRunning) {
      console.log('[BackupScheduler] 调度器已在运行');
      return;
    }

    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (!this.config.enabled) {
      console.log('[BackupScheduler] 自动备份已禁用');
      return;
    }

    const intervalMs = this.config.intervalMinutes * 60 * 1000;
    
    this.intervalId = setInterval(async () => {
      await this.runBackup();
    }, intervalMs);

    this.isRunning = true;
    this.nextRunTime = new Date(Date.now() + intervalMs);
    
    console.log(`[BackupScheduler] 调度器已启动，间隔: ${this.config.intervalMinutes} 分钟`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    this.nextRunTime = null;
    
    console.log('[BackupScheduler] 调度器已停止');
  }

  private async runBackup(): Promise<void> {
    console.log('[BackupScheduler] 开始执行自动备份...');
    
    try {
      await persistenceService.createBackup();
      this.lastRunTime = new Date();
      
      if (this.config.autoCleanup) {
        await this.cleanupOldBackups();
      }
      
      const intervalMs = this.config.intervalMinutes * 60 * 1000;
      this.nextRunTime = new Date(Date.now() + intervalMs);
      
      console.log('[BackupScheduler] 自动备份完成');
    } catch (error) {
      console.error('[BackupScheduler] 自动备份失败:', error);
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    const backups = await persistenceService.listBackups();
    
    if (backups.length > this.config.maxBackups) {
      const toDelete = backups
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(this.config.maxBackups);
      
      for (const backup of toDelete) {
        await persistenceService.deleteBackup(backup.id);
        console.log(`[BackupScheduler] 已删除旧备份: ${backup.id}`);
      }
    }
  }

  async runManualBackup(): Promise<BackupMetadata | null> {
    console.log('[BackupScheduler] 执行手动备份...');
    
    try {
      const backup = await persistenceService.createBackup();
      this.lastRunTime = new Date();
      
      return backup.metadata;
    } catch (error) {
      console.error('[BackupScheduler] 手动备份失败:', error);
      return null;
    }
  }

  getStatus(): {
    isRunning: boolean;
    lastRunTime: Date | null;
    nextRunTime: Date | null;
    config: SchedulerConfig;
  } {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      nextRunTime: this.nextRunTime,
      config: this.config,
    };
  }

  updateConfig(config: Partial<SchedulerConfig>): void {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      this.stop();
    }
    
    this.config = { ...this.config, ...config };
    
    if (wasRunning && this.config.enabled) {
      this.start();
    }
  }
}

export const backupScheduler = new BackupScheduler();
