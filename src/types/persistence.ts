export type StorageType = 'indexeddb' | 'localstorage' | 'memory';

export interface PersistenceConfig {
  storageType: StorageType;
  dbName: string;
  version: number;
  enableBackup: boolean;
  backupInterval: number;
  maxBackups: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  encryptionKey?: string;
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  size: number;
  tables: string[];
  checksum: string;
  version: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, unknown[]>;
}

export interface ConsistencyCheckResult {
  isValid: boolean;
  errors: ConsistencyError[];
  timestamp: string;
}

export interface ConsistencyError {
  table: string;
  recordId: string;
  field: string;
  expected: unknown;
  actual: unknown;
  message: string;
}

export interface SyncStatus {
  lastSyncTime: string | null;
  pendingChanges: number;
  isSyncing: boolean;
  lastSyncError: string | null;
}

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  version: string;
}

export interface PersistenceStats {
  totalRecords: number;
  totalSize: number;
  lastBackup: string | null;
  cacheHitRate: number;
  averageResponseTime: number;
}
