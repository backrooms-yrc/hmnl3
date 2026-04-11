import { supabase } from '@/db/supabase';
import { broadcastDB } from './broadcastDB';
import type { BroadcastPage, BroadcastFile, UserInteraction } from '@/types/broadcast';

interface PageVersion {
  id: string;
  page_id: string;
  version_number: number;
  data: Record<string, unknown>;
  created_by: string;
  created_at: string;
  change_summary?: string;
}

interface Permission {
  id: string;
  page_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  granted_by: string;
  granted_at: string;
  expires_at?: string | null;
}

interface BackupRecord {
  id: string;
  user_id: string;
  backup_type: 'full' | 'incremental' | 'manual' | 'auto';
  data_size: number;
  file_count: number;
  created_at: string;
  expires_at: string;
  storage_path: string;
  checksum: string;
}

class BroadcastServerAPI {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 300000; // 5分钟

  private setCache(key: string, data: unknown, ttl = this.CACHE_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('未登录或会话已过期');
    return user;
  }

  async verifyOwnership(pageId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      
      const { data, error } = await supabase
        .from('broadcast_pages')
        .select('id')
        .eq('id', pageId)
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  async checkPermission(pageId: string, requiredRole: 'owner' | 'editor' | 'viewer'): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      
      const { data: permission, error } = await supabase
        .from('broadcast_page_permissions')
        .select('*')
        .eq('page_id', pageId)
        .eq('user_id', user.id)
        .single();

      if (error || !permission) return false;

      const roleHierarchy: Record<string, number> = { owner: 3, editor: 2, viewer: 1 };
      return (roleHierarchy[permission.role] || 0) >= (roleHierarchy[requiredRole] || 0);
    } catch {
      return false;
    }
  }

  async createPage(pageData: {
    title: string;
    description?: string;
    html_content?: string;
    cover_image?: string;
    is_public?: boolean;
    config?: Record<string, unknown>;
  }): Promise<BroadcastPage> {
    const user = await this.getCurrentUser();

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    const newPage = {
      ...pageData,
      description: pageData.description || null,
      html_content: pageData.html_content || '',
      cover_image: pageData.cover_image || null,
      is_public: pageData.is_public ?? false,
      view_count: 0,
      storage_used: 0,
      version: 1,
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced',
      config: pageData.config || {},
    };

    const { data, error } = await supabase
      .from('broadcast_pages')
      .insert({
        ...newPage,
        user_id: user.id,
        username: profile?.username || user.email?.split('@')[0] || '用户',
        avatar_url: profile?.avatar_url || null,
      })
      .select()
      .single();

    if (error) throw new Error(`创建页面失败: ${error.message}`);

    await this.createPermission(data.id, user.id, 'owner');
    await this.createVersion(data.id, 1, newPage, '初始版本');

    this.clearCache(`pages_user_${user.id}`);
    
    return data;
  }

  async getPage(pageId: string): Promise<BroadcastPage & { permissions?: Permission[] }> {
    const cacheKey = `page_${pageId}`;
    const cached = this.getCache<BroadcastPage>(cacheKey);
    if (cached) return cached;

    try {
      let page: BroadcastPage | null = null;
      
      const { data, error } = await supabase
        .from('broadcast_pages')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url,
            is_verified,
            is_real_verified
          )
        `)
        .eq('id', pageId)
        .single();

      if (error || !data) throw new Error('页面不存在');

      page = {
        ...data,
        profiles: data.profiles,
      } as BroadcastPage;

      if (!page.is_public) {
        const hasAccess = await this.checkPermission(pageId, 'viewer');
        if (!hasAccess) throw new Error('无权访问此页面');
      }

      await this.incrementViewCount(pageId);

      this.setCache(cacheKey, page);

      return page;
    } catch (error) {
      console.error('获取页面失败:', error);
      throw error;
    }
  }

  async updatePage(
    pageId: string, 
    updates: Partial<{
      title: string;
      description: string;
      html_content: string;
      cover_image: string;
      is_public: boolean;
      config: Record<string, unknown>;
    }>
  ): Promise<BroadcastPage> {
    const isOwner = await this.verifyOwnership(pageId);
    const canEdit = await this.checkPermission(pageId, 'editor');

    if (!isOwner && !canEdit) throw new Error('无编辑权限');

    const currentPage = await this.getPage(pageId);
    const currentVersion = (currentPage as any).version || 0;
    const newVersion = Number(currentVersion) + 1;

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
      version: newVersion,
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced',
    };

    const { data, error } = await supabase
      .from('broadcast_pages')
      .update(updateData)
      .eq('id', pageId)
      .select()
      .single();

    if (error) throw new Error(`更新失败: ${error.message}`);

    await this.createVersion(
      pageId, 
      newVersion, 
      updates, 
      `v${newVersion}: ${Object.keys(updates).join(', ')}`
    );

    this.clearCache(`page_${pageId}`);

    return data;
  }

  async deletePage(pageId: string): Promise<void> {
    const isOwner = await this.verifyOwnership(pageId);
    if (!isOwner) throw new Error('只有创建者可以删除页面');

    const { error: filesError } = await supabase
      .from('broadcast_files')
      .delete()
      .eq('page_id', pageId);

    const { error: versionsError } = await supabase
      .from('broadcast_page_versions')
      .delete()
      .eq('page_id', pageId);

    const { error: permissionsError } = await supabase
      .from('broadcast_page_permissions')
      .delete()
      .eq('page_id', pageId);

    const { error: interactionsError } = await supabase
      .from('user_interactions')
      .delete()
      .eq('page_id', pageId);

    const { error } = await supabase
      .from('broadcast_pages')
      .delete()
      .eq('id', pageId);

    if (error) throw new Error(`删除失败: ${error.message}`);

    this.clearCache(`page_${pageId}`);
  }

  async getPublicPages(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'created_at' | 'updated_at' | 'view_count';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ data: BroadcastPage[]; count: number }> {
    const {
      page = 1,
      limit = 12,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params;

    const cacheKey = `public_pages_${page}_${limit}_${search}_${sortBy}_${sortOrder}`;
    const cached = this.getCache<{ data: BroadcastPage[]; count: number }>(cacheKey);
    if (cached) return cached;

    let query = supabase
      .from('broadcast_pages')
      .select('*', { count: 'exact' })
      .eq('is_public', true);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    
    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, from + limit - 1);

    if (error) throw new Error(`获取页面列表失败: ${error.message}`);

    const result = { data: data || [], count: count || 0 };
    this.setCache(cacheKey, result, 60000); // 列表缓存1分钟

    return result;
  }

  async getUserPages(userId?: string): Promise<BroadcastPage[]> {
    const user = userId ? { id: userId } : await this.getCurrentUser();

    const cacheKey = `pages_user_${user.id}`;
    const cached = this.getCache<BroadcastPage[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('broadcast_pages')
      .select('*')
      .or(`user_id.eq.${user.id},permissions.user_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`获取用户页面失败: ${error.message}`);

    this.setCache(cacheKey, data || []);
    return data || [];
  }

  async uploadFile(
    pageId: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<BroadcastFile> {
    const canEdit = await this.checkPermission(pageId, 'editor');
    if (!canEdit) throw new Error('无上传权限');

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mp3', 'wav'];
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      throw new Error(`不支持的文件类型，允许的类型: ${allowedTypes.join(', ')}`);
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('文件大小超过限制（最大10MB）');
    }

    const filePath = `broadcasts/${pageId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    try {
      const uploadOptions: Record<string, unknown> = {
        cacheControl: '3600',
        upsert: false,
      };

      const { data, error } = await supabase.storage
        .from('broadcast-files')
        .upload(filePath, file, uploadOptions);

      if (error) throw new Error(`上传失败: ${error.message}`);

      const { data: publicUrl } = supabase.storage
        .from('broadcast-files')
        .getPublicUrl(filePath);

      const fileRecord = {
        id: data?.id || generateUUID(),
        page_id: pageId,
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        public_url: publicUrl.publicUrl,
        created_at: new Date().toISOString(),
      };

      const { data: savedFile, error: saveError } = await supabase
        .from('broadcast_files')
        .insert(fileRecord)
        .select()
        .single();

      if (saveError) throw new Error(`保存文件记录失败: ${saveError.message}`);

      await supabase.rpc('increment_broadcast_storage', {
        page_id_input: pageId,
        size_input: file.size,
      });

      this.clearCache(`files_${pageId}`);

      return savedFile;
    } catch (error) {
      console.error('文件上传错误:', error);
      throw error;
    }
  }

  async getPageFiles(pageId: string): Promise<BroadcastFile[]> {
    const cacheKey = `files_${pageId}`;
    const cached = this.getCache<BroadcastFile[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('broadcast_files')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`获取文件列表失败: ${error.message}`);

    this.setCache(cacheKey, data || []);
    return data || [];
  }

  async deleteFile(fileId: string): Promise<void> {
    const { data: file, error: fetchError } = await supabase
      .from('broadcast_files')
      .select('page_id, file_path, file_size')
      .eq('id', fileId)
      .single();

    if (fetchError || !file) throw new Error('文件不存在');

    const canEdit = await this.checkPermission(file.page_id, 'editor');
    if (!canEdit) throw new Error('无删除权限');

    if (file.file_path) {
      await supabase.storage
        .from('broadcast-files')
        .remove([file.file_path]);
    }

    const { error: deleteError } = await supabase
      .from('broadcast_files')
      .delete()
      .eq('id', fileId);

    if (deleteError) throw new Error(`删除失败: ${deleteError.message}`);

    if (file.file_size) {
      await supabase.rpc('decrement_broadcast_storage', {
        page_id_input: file.page_id,
        size_input: file.file_size,
      });
    }

    this.clearCache(`files_${file.page_id}`);
  }

  async createPermission(pageId: string, userId: string, role: 'owner' | 'editor' | 'viewer'): Promise<Permission> {
    const isOwner = await this.verifyOwnership(pageId);
    if (!isOwner && role === 'owner') throw new Error('只有所有者可以授予所有者权限');

    const { data, error } = await supabase
      .from('broadcast_page_permissions')
      .upsert({
        page_id: pageId,
        user_id: userId,
        role,
        granted_by: (await this.getCurrentUser()).id,
        granted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`授权失败: ${error.message}`);

    this.clearCache(`perms_${pageId}`);
    return data;
  }

  async removePermission(pageId: string, userId: string): Promise<void> {
    const isOwner = await this.verifyOwnership(pageId);
    if (!isOwner) throw new Error('只有所有者可以移除权限');

    const { error } = await supabase
      .from('broadcast_page_permissions')
      .delete()
      .eq('page_id', pageId)
      .eq('user_id', userId);

    if (error) throw new Error(`移除权限失败: ${error.message}`);

    this.clearCache(`perms_${pageId}`);
  }

  async getPagePermissions(pageId: string): Promise<Permission[]> {
    const cacheKey = `perms_${pageId}`;
    const cached = this.getCache<Permission[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('broadcast_page_permissions')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('page_id', pageId);

    if (error) throw new Error(`获取权限列表失败: ${error.message}`);

    this.setCache(cacheKey, data || []);
    return data || [];
  }

  async createVersion(
    pageId: string, 
    versionNumber: number, 
    changes: Record<string, unknown>,
    summary?: string
  ): Promise<PageVersion> {
    const { data, error } = await supabase
      .from('broadcast_page_versions')
      .insert({
        page_id: pageId,
        version_number: versionNumber,
        data: changes,
        created_by: (await this.getCurrentUser()).id,
        change_summary: summary || `版本 ${versionNumber}`,
      })
      .select()
      .single();

    if (error) throw new Error(`创建版本失败: ${error.message}`);

    this.clearCache(`versions_${pageId}`);
    return data;
  }

  async getVersions(pageId: string): Promise<PageVersion[]> {
    const { data, error } = await supabase
      .from('broadcast_page_versions')
      .select('*')
      .eq('page_id', pageId)
      .order('version_number', { ascending: false });

    if (error) throw new Error(`获取版本历史失败: ${error.message}`);

    return data || [];
  }

  async rollbackToVersion(pageId: string, versionNumber: number): Promise<BroadcastPage> {
    const isOwner = await this.verifyOwnership(pageId);
    if (!isOwner) throw new Error('只有所有者可以回滚版本');

    const { data: version, error: versionError } = await supabase
      .from('broadcast_page_versions')
      .select('data')
      .eq('page_id', pageId)
      .eq('version_number', versionNumber)
      .single();

    if (versionError || !version) throw new Error('版本不存在');

    return this.updatePage(pageId, version.data as Parameters<typeof this.updatePage>[1]);
  }

  async recordInteraction(interaction: Omit<UserInteraction, 'id'>): Promise<UserInteraction> {
    const { data, error } = await supabase
      .from('user_interactions')
      .insert({
        ...interaction,
        id: `${interaction.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })
      .select()
      .single();

    if (error) throw new Error(`记录交互失败: ${error.message}`);

    return data;
  }

  async incrementViewCount(pageId: string): Promise<void> {
    await supabase.rpc('increment_broadcast_view', { page_id_input: pageId });
  }

  async createBackup(userId: string, type: 'full' | 'incremental' | 'manual' = 'manual'): Promise<BackupRecord> {
    const pages = await this.getUserPages(userId);
    const allFiles: BroadcastFile[] = [];

    for (const page of pages) {
      const files = await this.getPageFiles(page.id);
      allFiles.push(...files);
    }

    const backupData = {
      version: '2.0.0',
      created_at: new Date().toISOString(),
      user_id: userId,
      pages,
      files: allFiles.map(f => ({
        id: f.id,
        page_id: f.page_id,
        filename: f.filename,
        file_type: f.file_type,
        file_size: f.file_size,
        public_url: f.public_url,
      })),
      metadata: {
        total_pages: pages.length,
        total_files: allFiles.length,
        total_storage: allFiles.reduce((sum, f) => sum + f.file_size, 0),
      },
    };

    const jsonString = JSON.stringify(backupData);
    const checksum = await this.calculateChecksum(jsonString);
    const dataBlob = new Blob([jsonString], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);

    const backupRecord = {
      id: generateUUID(),
      user_id: userId,
      backup_type: type,
      data_size: new Blob([jsonString]).size,
      file_count: allFiles.length,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      storage_path: dataUrl,
      checksum,
    };

    const { data, error } = await supabase
      .from('broadcast_backups')
      .insert(backupRecord)
      .select()
      .single();

    if (error) throw new Error(`创建备份失败: ${error.message}`);

    return data;
  }

  async restoreBackup(backupId: string): Promise<{ pages: number; files: number; errors: string[] }> {
    const { data: backup, error: fetchError } = await supabase
      .from('broadcast_backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (fetchError || !backup) throw new Error('备份不存在');

    const response = await fetch(backup.storage_path);
    const backupData = await response.json();

    const errors: string[] = [];
    let restoredPages = 0;
    let restoredFiles = 0;

    for (const page of backupData.pages || []) {
      try {
        await this.createPage({
          title: `[恢复] ${page.title}`,
          description: page.description || undefined,
          html_content: page.html_content || undefined,
          cover_image: page.cover_image || undefined,
          is_public: page.is_public,
        });
        restoredPages++;
      } catch (error) {
        errors.push(`恢复页面 "${page.title}" 失败: ${error}`);
      }
    }

    return { pages: restoredPages, files: restoredFiles, errors };
  }

  async getUserBackups(userId: string): Promise<BackupRecord[]> {
    const { data, error } = await supabase
      .from('broadcast_backups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`获取备份列表失败: ${error.message}`);

    return data || [];
  }

  async deleteBackup(backupId: string): Promise<void> {
    const { error } = await supabase
      .from('broadcast_backups')
      .delete()
      .eq('id', backupId);

    if (error) throw new Error(`删除备份失败: ${error.message}`);
  }

  async autoSync(): Promise<{
    synced: number;
    conflicts: number;
    errors: string[];
  }> {
    const user = await this.getCurrentUser();
    const localPages = await broadcastDB.getAllPages();
    let synced = 0;
    let conflicts = 0;
    const errors: string[] = [];

    for (const localPage of localPages) {
      if (!localPage._synced) {
        try {
          const serverPage = await this.getPage(localPage.id).catch(() => null);

          if (!serverPage) {
            await this.createPage({
              title: localPage.title,
              description: localPage.description || undefined,
              html_content: localPage.html_content || undefined,
              cover_image: localPage.cover_image || undefined,
              is_public: localPage.is_public,
            });
            synced++;
          } else {
            const localModified = new Date(localPage._lastModified || 0).getTime();
            const serverModified = new Date(serverPage.updated_at).getTime();

            if (localModified > serverModified) {
              await this.updatePage(serverPage.id, {
                title: localPage.title,
                description: localPage.description || undefined,
                html_content: localPage.html_content || undefined,
              });
              synced++;
            } else {
              conflicts++;
            }
          }

          await broadcastDB.updatePage(localPage.id, { _synced: true });
        } catch (error) {
          errors.push(`同步页面 ${localPage.id} 失败: ${error}`);
        }
      }
    }

    return { synced, conflicts, errors };
  }

  private async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  clearAllCaches(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const broadcastServerAPI = new BroadcastServerAPI();
export default broadcastServerAPI;