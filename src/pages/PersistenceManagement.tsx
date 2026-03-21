import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { persistenceAPI } from '@/services/persistence-api';
import {
  Database,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
} from 'lucide-react';

interface BackupInfo {
  id: string;
  timestamp: string;
  size: number;
}

interface SystemStats {
  totalRecords: number;
  totalSize: number;
  lastBackup: string | null;
  cacheSize: number;
  backupCount: number;
  syncQueueSize: number;
}

export default function PersistenceManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<{
    isRunning: boolean;
    lastRunTime: string | null;
    nextRunTime: string | null;
  } | null>(null);
  const [testResults, setTestResults] = useState<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: Array<{ testName: string; passed: boolean; duration: number; error?: string }>;
  } | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const response = await persistenceAPI.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        console.error('加载统计信息失败:', response.error);
      }
    } catch (error) {
      console.error('加载统计信息异常:', error);
    }
  }, []);

  const loadBackups = useCallback(async () => {
    try {
      const response = await persistenceAPI.listBackups();
      if (response.success && response.data) {
        setBackups(response.data);
      } else {
        console.error('加载备份列表失败:', response.error);
      }
    } catch (error) {
      console.error('加载备份列表异常:', error);
    }
  }, []);

  const loadSchedulerStatus = useCallback(async () => {
    try {
      const response = await persistenceAPI.getSchedulerStatus();
      if (response.success && response.data) {
        setSchedulerStatus(response.data);
      } else {
        console.error('加载调度器状态失败:', response.error);
      }
    } catch (error) {
      console.error('加载调度器状态异常:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadBackups();
    loadSchedulerStatus();
  }, [loadStats, loadBackups, loadSchedulerStatus]);

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const response = await persistenceAPI.createBackup();
      if (response.success) {
        toast({
          title: '备份成功',
          description: `备份ID: ${response.data?.backupId}`,
        });
        loadBackups();
        loadStats();
      } else {
        toast({
          title: '备份失败',
          description: response.error,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    setLoading(true);
    try {
      const response = await persistenceAPI.restoreBackup(backupId);
      if (response.success) {
        toast({
          title: '恢复成功',
          description: response.data?.message,
        });
      } else {
        toast({
          title: '恢复失败',
          description: response.error,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    setLoading(true);
    try {
      const response = await persistenceAPI.deleteBackup(backupId);
      if (response.success) {
        toast({
          title: '删除成功',
          description: '备份已删除',
        });
        loadBackups();
        loadStats();
      } else {
        toast({
          title: '删除失败',
          description: response.error,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = async (backupId: string) => {
    try {
      const blob = await persistenceAPI.exportBackup(backupId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${backupId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({
          title: '导出成功',
          description: '备份文件已下载',
        });
      }
    } catch (error) {
      toast({
        title: '导出失败',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await persistenceAPI.importBackup(file);
      if (response.success) {
        toast({
          title: '导入成功',
          description: `备份ID: ${response.data?.backupId}`,
        });
        loadBackups();
      } else {
        toast({
          title: '导入失败',
          description: response.error,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    setLoading(true);
    try {
      const response = await persistenceAPI.clearCache();
      if (response.success) {
        toast({
          title: '清理成功',
          description: '缓存已清空',
        });
        loadStats();
      } else {
        toast({
          title: '清理失败',
          description: response.error,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScheduler = async () => {
    setLoading(true);
    try {
      if (schedulerStatus?.isRunning) {
        await persistenceAPI.stopBackupScheduler();
        toast({
          title: '已停止',
          description: '自动备份调度器已停止',
        });
      } else {
        await persistenceAPI.startBackupScheduler({
          enabled: true,
          intervalMinutes: 60,
          maxBackups: 10,
        });
        toast({
          title: '已启动',
          description: '自动备份调度器已启动',
        });
      }
      loadSchedulerStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    setLoading(true);
    try {
      const response = await persistenceAPI.runTests();
      if (response.success && response.data) {
        setTestResults(response.data);
        toast({
          title: '测试完成',
          description: `${response.data.passedTests}/${response.data.totalTests} 通过`,
        });
      } else {
        toast({
          title: '测试失败',
          description: response.error,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckConsistency = async () => {
    setLoading(true);
    try {
      const response = await persistenceAPI.checkConsistency();
      if (response.success && response.data) {
        toast({
          title: response.data.isValid ? '一致性检查通过' : '发现问题',
          description: response.data.isValid
            ? '所有数据一致性检查通过'
            : `发现 ${response.data.errorCount} 个问题`,
          variant: response.data.isValid ? 'default' : 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '从未';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据持久化管理</h1>
          <p className="text-muted-foreground">管理数据备份、恢复和一致性检查</p>
        </div>
        <Button onClick={() => { loadStats(); loadBackups(); loadSchedulerStatus(); }} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总记录数</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRecords || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">存储大小</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats?.totalSize || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">备份数量</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.backupCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">同步队列</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.syncQueueSize || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backups">备份管理</TabsTrigger>
          <TabsTrigger value="scheduler">定时备份</TabsTrigger>
          <TabsTrigger value="tests">恢复测试</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>备份操作</CardTitle>
              <CardDescription>创建、导入、导出和管理数据备份</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={handleCreateBackup} disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                创建备份
              </Button>
              <label>
                <Button variant="outlined" asChild disabled={loading}>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    导入备份
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
              <Button variant="outlined" onClick={handleCheckConsistency} disabled={loading}>
                <CheckCircle className="mr-2 h-4 w-4" />
                一致性检查
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>备份列表</CardTitle>
              <CardDescription>
                最近备份: {formatDate(stats?.lastBackup || null)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无备份
                </div>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{backup.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(backup.timestamp)} · {formatBytes(backup.size)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={() => handleExportBackup(backup.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={() => handleRestoreBackup(backup.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outlinedError"
                          onClick={() => handleDeleteBackup(backup.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>自动备份调度器</CardTitle>
              <CardDescription>配置定时自动备份</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">状态</p>
                  <p className="text-sm text-muted-foreground">
                    {schedulerStatus?.isRunning ? '运行中' : '已停止'}
                  </p>
                </div>
                <Button onClick={handleToggleScheduler} disabled={loading}>
                  {schedulerStatus?.isRunning ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      停止
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      启动
                    </>
                  )}
                </Button>
              </div>

              {schedulerStatus?.isRunning && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">上次运行</p>
                      <p className="font-medium">{formatDate(schedulerStatus.lastRunTime)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">下次运行</p>
                      <p className="font-medium">{formatDate(schedulerStatus.nextRunTime)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>恢复测试</CardTitle>
              <CardDescription>验证备份和恢复功能的完整性</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleRunTests} disabled={loading}>
                <Play className="mr-2 h-4 w-4" />
                运行测试
              </Button>

              {testResults && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant={testResults.failedTests === 0 ? 'default' : 'destructive'}>
                      {testResults.passedTests}/{testResults.totalTests} 通过
                    </Badge>
                    <Progress
                      value={(testResults.passedTests / testResults.totalTests) * 100}
                      className="flex-1"
                    />
                  </div>

                  <div className="space-y-2">
                    {testResults.results.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="font-medium">{result.testName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.duration}ms
                          {result.error && (
                            <span className="ml-2 text-destructive">{result.error}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>缓存管理</CardTitle>
              <CardDescription>管理本地缓存数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">缓存大小</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.cacheSize || 0} 条记录
                  </p>
                </div>
                <Button variant="outlinedError" onClick={handleClearCache} disabled={loading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  清空缓存
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统信息</CardTitle>
              <CardDescription>当前持久化系统状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">数据库类型</span>
                  <span>Supabase (PostgreSQL)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">本地存储</span>
                  <span>IndexedDB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">备份格式</span>
                  <span>JSON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">校验算法</span>
                  <span>SHA-256</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
