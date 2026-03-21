import { persistenceService } from './persistence-service';
import type { ConsistencyCheckResult, ConsistencyError } from '@/types/persistence';

interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: unknown;
}

interface RecoveryTestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
}

class RecoveryTestService {
  async runAllTests(): Promise<RecoveryTestReport> {
    console.log('[RecoveryTest] 开始运行恢复测试...');
    
    const results: TestResult[] = [];
    
    results.push(await this.testBackupCreation());
    results.push(await this.testBackupIntegrity());
    results.push(await this.testBackupRestore());
    results.push(await this.testChecksumVerification());
    results.push(await this.testCachePersistence());
    results.push(await this.testSyncQueue());
    results.push(await this.testConsistencyCheck());
    
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed).length;
    
    const report: RecoveryTestReport = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests,
      failedTests,
      results,
    };
    
    console.log(`[RecoveryTest] 测试完成: ${passedTests}/${results.length} 通过`);
    
    return report;
  }

  private async testBackupCreation(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const backup = await persistenceService.createBackup();
      
      if (!backup.metadata || !backup.data) {
        throw new Error('备份数据结构无效');
      }
      
      if (!backup.metadata.checksum) {
        throw new Error('备份校验和缺失');
      }
      
      return {
        testName: '备份创建测试',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          backupId: backup.metadata.id,
          tables: Object.keys(backup.data),
          size: backup.metadata.size,
        },
      };
    } catch (error) {
      return {
        testName: '备份创建测试',
        passed: false,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  private async testBackupIntegrity(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const backups = await persistenceService.listBackups();
      
      if (backups.length === 0) {
        throw new Error('没有可用的备份');
      }
      
      const latestBackup = backups[0];
      
      if (!latestBackup.id || !latestBackup.timestamp) {
        throw new Error('备份元数据不完整');
      }
      
      return {
        testName: '备份完整性测试',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          backupCount: backups.length,
          latestBackupId: latestBackup.id,
          latestBackupTime: latestBackup.timestamp,
        },
      };
    } catch (error) {
      return {
        testName: '备份完整性测试',
        passed: false,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  private async testBackupRestore(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const backups = await persistenceService.listBackups();
      
      if (backups.length === 0) {
        throw new Error('没有可用的备份进行恢复测试');
      }
      
      const testBackupId = backups[0].id;
      const result = await persistenceService.restoreBackup(testBackupId);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return {
        testName: '备份恢复测试',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          backupId: testBackupId,
          message: result.message,
        },
      };
    } catch (error) {
      return {
        testName: '备份恢复测试',
        passed: false,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  private async testChecksumVerification(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const backup = await persistenceService.createBackup();
      
      const testBackupId = backup.metadata.id;
      const backupString = await (await import('./indexeddb-service')).indexedDBService.getBackup(testBackupId);
      
      if (!backupString) {
        throw new Error('无法读取备份数据');
      }
      
      const parsedBackup = JSON.parse(backupString);
      
      if (parsedBackup.metadata.checksum !== backup.metadata.checksum) {
        throw new Error('校验和不匹配');
      }
      
      return {
        testName: '校验和验证测试',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          checksum: backup.metadata.checksum.substring(0, 16) + '...',
        },
      };
    } catch (error) {
      return {
        testName: '校验和验证测试',
        passed: false,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  private async testCachePersistence(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const testKey = 'test_cache_key';
      const testValue = { data: 'test_data', timestamp: Date.now() };
      
      await persistenceService.cacheData(testKey, testValue, 60000);
      
      const retrieved = await persistenceService.getCachedData<typeof testValue>(testKey);
      
      if (!retrieved || retrieved.data !== testValue.data) {
        throw new Error('缓存数据不匹配');
      }
      
      await persistenceService.clearCache();
      
      return {
        testName: '缓存持久化测试',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        testName: '缓存持久化测试',
        passed: false,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  private async testSyncQueue(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await persistenceService.queueChange('test_table', 'insert', { id: 'test_id', data: 'test' });
      
      const status = persistenceService.getSyncStatus();
      
      if (status.pendingChanges < 1) {
        throw new Error('同步队列未正确记录变更');
      }
      
      const syncResult = await persistenceService.syncPendingChanges();
      
      return {
        testName: '同步队列测试',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          pendingChanges: status.pendingChanges,
          syncedCount: syncResult.syncedCount,
        },
      };
    } catch (error) {
      return {
        testName: '同步队列测试',
        passed: false,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  private async testConsistencyCheck(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const result = await persistenceService.checkConsistency();
      
      return {
        testName: '一致性检查测试',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          isValid: result.isValid,
          errorCount: result.errors.length,
          timestamp: result.timestamp,
        },
      };
    } catch (error) {
      return {
        testName: '一致性检查测试',
        passed: false,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  async generateTestReport(): Promise<string> {
    const report = await this.runAllTests();
    
    let output = '# 数据恢复测试报告\n\n';
    output += `**测试时间:** ${report.timestamp}\n\n`;
    output += `**测试结果:** ${report.passedTests}/${report.totalTests} 通过\n\n`;
    
    output += '## 测试详情\n\n';
    
    for (const result of report.results) {
      const status = result.passed ? '✅' : '❌';
      output += `### ${status} ${result.testName}\n\n`;
      output += `- **耗时:** ${result.duration}ms\n`;
      output += `- **状态:** ${result.passed ? '通过' : '失败'}\n`;
      
      if (result.error) {
        output += `- **错误:** ${result.error}\n`;
      }
      
      if (result.details) {
        output += `- **详情:** \`${JSON.stringify(result.details)}\`\n`;
      }
      
      output += '\n';
    }
    
    return output;
  }
}

export const recoveryTestService = new RecoveryTestService();
