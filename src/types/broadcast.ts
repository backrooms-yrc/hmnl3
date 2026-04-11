import type { Profile } from '@/types/types';

export interface BroadcastPage {
  id: string;
  user_id: string;
  username?: string;
  avatar_url?: string | null;
  title: string;
  description: string | null;
  html_content: string;
  cover_image: string | null;
  is_public: boolean;
  view_count: number;
  storage_used: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  _synced?: boolean;
  _lastModified?: string;
  _version?: number;
}

export interface BroadcastFile {
  id: string;
  page_id: string;
  filename: string;
  file_path?: string;
  file_data?: string;
  file_size: number;
  file_type: string;
  created_at: string;
  public_url?: string;
}

export interface UserInteraction {
  id: string;
  page_id: string;
  user_id: string;
  type: 'view' | 'favorite' | 'share' | 'bookmark';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SyncMetadata {
  lastSyncTime: string;
  pendingChanges: number;
  conflictCount: number;
  version: string;
}

export interface CacheState {
  pages: BroadcastPage[];
  files: [string, BroadcastFile[]][];
  interactions: UserInteraction[];
  lastUpdated: string;
  isDirty: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
}