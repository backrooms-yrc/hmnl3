import { supabase } from '@/db/supabase';
import type { Channel, Profile } from '@/types/types';
import type {
  ApiResponse,
  LiveRoomUrlRequest,
  LiveRoomUrlData,
  PlayerUrlRequest,
  PlayerUrlData,
  ChannelInfoRequest,
  ChannelInfoData,
  ChannelListRequest,
  PaginatedResponse,
  LiveStatusData,
  BatchLiveStatusRequest,
  BatchLiveStatusData,
  API_BASE_URL,
  API_ERROR_CODES,
} from '@/types/live-api';

const RTMP_SERVER = import.meta.env.VITE_RTMP_SERVER || 'rtmp://localhost:1935/live';
const HLS_SERVER = import.meta.env.VITE_HLS_SERVER || 'http://localhost:8080/live';
const WEB_BASE_URL = import.meta.env.VITE_WEB_BASE_URL || 'https://hmnl3.20110208.xyz';

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
}

function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    message,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
}

async function findChannel(channelId?: string, channelUrl?: string): Promise<Channel | null> {
  if (!channelId && !channelUrl) {
    return null;
  }

  if (channelUrl) {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('channel_url', channelUrl)
      .maybeSingle();
    
    if (!error && data) return data;
  }

  if (channelId) {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .maybeSingle();
    
    if (!error && data) return data;
  }

  return null;
}

async function getChannelOwner(userId: string | null): Promise<Pick<Profile, 'id' | 'username' | 'avatar_url' | 'is_verified'> | null> {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, is_verified')
    .eq('id', userId)
    .maybeSingle();
  
  return error ? null : data;
}

export const LiveApi = {
  async getLiveRoomUrl(params: LiveRoomUrlRequest): Promise<ApiResponse<LiveRoomUrlData>> {
    try {
      let channel: Channel | null = null;

      if (params.stream_id) {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .eq('stream_id', params.stream_id)
          .maybeSingle();
        
        if (error) throw error;
        channel = data;
      } else {
        channel = await findChannel(params.channel_id, params.channel_url);
      }

      if (!channel) {
        return createErrorResponse(
          API_ERROR_CODES.CHANNEL_NOT_FOUND,
          '频道不存在',
          { provided_params: params }
        );
      }

      if (!channel.is_active) {
        return createErrorResponse(
          API_ERROR_CODES.CHANNEL_INACTIVE,
          '该频道已停用',
          { channel_id: channel.id }
        );
      }

      const streamId = channel.stream_id;
      const liveRoomData: LiveRoomUrlData = {
        channel_id: channel.id,
        channel_name: channel.name,
        channel_url: channel.channel_url,
        stream_id: streamId,
        rtmp_push_url: RTMP_SERVER,
        rtmp_push_key: streamId,
        hls_play_url: `${HLS_SERVER}/${streamId}.m3u8`,
        flv_play_url: `${HLS_SERVER.replace('http', 'ws')}/${streamId}.flv`,
        web_play_url: `${WEB_BASE_URL}/channel/${channel.channel_url}`,
        is_live: channel.is_live,
        created_at: channel.created_at,
      };

      return createSuccessResponse(liveRoomData);
    } catch (error) {
      console.error('获取直播间URL失败:', error);
      return createErrorResponse(
        API_ERROR_CODES.INTERNAL_ERROR,
        '获取直播间URL失败',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  },

  async getPlayerUrl(params: PlayerUrlRequest): Promise<ApiResponse<PlayerUrlData>> {
    try {
      const channel = await findChannel(params.channel_id, params.channel_url);

      if (!channel) {
        return createErrorResponse(
          API_ERROR_CODES.CHANNEL_NOT_FOUND,
          '频道不存在',
          { provided_params: { channel_id: params.channel_id, channel_url: params.channel_url } }
        );
      }

      if (!channel.is_active) {
        return createErrorResponse(
          API_ERROR_CODES.CHANNEL_INACTIVE,
          '该频道已停用',
          { channel_id: channel.id }
        );
      }

      const format = params.format || 'auto';
      const quality = params.quality || 'auto';
      const channelUrl = channel.channel_url;

      const playerUrl = `${WEB_BASE_URL}/player/${channelUrl}`;
      const embedUrl = `${WEB_BASE_URL}/embed/${channelUrl}`;

      const streamUrls = {
        hls: channel.m3u8_url || (channel.stream_id ? `${HLS_SERVER}/${channel.stream_id}.m3u8` : null),
        flv: channel.stream_id ? `${HLS_SERVER.replace('http', 'ws')}/${channel.stream_id}.flv` : null,
      };

      const playerData: PlayerUrlData = {
        channel_id: channel.id,
        channel_name: channel.name,
        channel_url: channelUrl,
        player_url: playerUrl,
        embed_url: embedUrl,
        stream_urls: streamUrls,
        stream_id: channel.stream_id,
        is_live: channel.is_live,
        quality,
        format,
      };

      return createSuccessResponse(playerData);
    } catch (error) {
      console.error('获取播放器URL失败:', error);
      return createErrorResponse(
        API_ERROR_CODES.INTERNAL_ERROR,
        '获取播放器URL失败',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  },

  async getChannelInfo(params: ChannelInfoRequest): Promise<ApiResponse<ChannelInfoData>> {
    try {
      const channel = await findChannel(params.channel_id, params.channel_url);

      if (!channel) {
        return createErrorResponse(
          API_ERROR_CODES.CHANNEL_NOT_FOUND,
          '频道不存在',
          { provided_params: { channel_id: params.channel_id, channel_url: params.channel_url } }
        );
      }

      const owner = await getChannelOwner(channel.user_id);

      let stats = undefined;
      if (params.include_stats) {
        const { count: totalViews } = await supabase
          .from('channel_views')
          .select('*', { count: 'exact', head: true })
          .eq('channel_id', channel.id);

        const { count: followers } = await supabase
          .from('channel_follows')
          .select('*', { count: 'exact', head: true })
          .eq('channel_id', channel.id);

        stats = {
          total_views: totalViews || 0,
          total_likes: channel.like_count || 0,
          followers: followers || 0,
        };
      }

      const channelInfo: ChannelInfoData = {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        cover_image: channel.cover_image,
        channel_url: channel.channel_url,
        stream_id: channel.stream_id,
        is_live: channel.is_live,
        is_active: channel.is_active,
        like_count: channel.like_count,
        viewer_count: channel.is_live ? Math.floor(Math.random() * 1000) + 100 : 0,
        owner: owner ? {
          id: owner.id,
          username: owner.username,
          avatar_url: owner.avatar_url,
          is_verified: owner.is_verified,
        } : undefined,
        stats,
        created_at: channel.created_at,
        updated_at: channel.updated_at,
      };

      return createSuccessResponse(channelInfo);
    } catch (error) {
      console.error('获取频道信息失败:', error);
      return createErrorResponse(
        API_ERROR_CODES.INTERNAL_ERROR,
        '获取频道信息失败',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  },

  async getChannelList(params: ChannelListRequest = {}): Promise<ApiResponse<PaginatedResponse<ChannelInfoData>>> {
    try {
      const page = params.page || 1;
      const limit = Math.min(params.limit || 20, 100);
      const offset = (page - 1) * limit;

      let query = supabase
        .from('channels')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      if (params.is_live !== undefined) {
        query = query.eq('is_live', params.is_live);
      }

      const sortColumn = params.sort_by || 'created_at';
      const sortOrder = params.sort_order || 'desc';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      const channels = await Promise.all(
        (data || []).map(async (channel) => {
          const owner = await getChannelOwner(channel.user_id);
          return {
            id: channel.id,
            name: channel.name,
            description: channel.description,
            cover_image: channel.cover_image,
            channel_url: channel.channel_url,
            stream_id: channel.stream_id,
            is_live: channel.is_live,
            is_active: channel.is_active,
            like_count: channel.like_count,
            viewer_count: channel.is_live ? Math.floor(Math.random() * 1000) + 100 : 0,
            owner: owner ? {
              id: owner.id,
              username: owner.username,
              avatar_url: owner.avatar_url,
              is_verified: owner.is_verified,
            } : undefined,
            created_at: channel.created_at,
            updated_at: channel.updated_at,
          } as ChannelInfoData;
        })
      );

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return createSuccessResponse({
        items: channels,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      });
    } catch (error) {
      console.error('获取频道列表失败:', error);
      return createErrorResponse(
        API_ERROR_CODES.INTERNAL_ERROR,
        '获取频道列表失败',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  },

  async getLiveStatus(params: { channel_id?: string; channel_url?: string }): Promise<ApiResponse<LiveStatusData>> {
    try {
      const channel = await findChannel(params.channel_id, params.channel_url);

      if (!channel) {
        return createErrorResponse(
          API_ERROR_CODES.CHANNEL_NOT_FOUND,
          '频道不存在',
          { provided_params: params }
        );
      }

      const liveStatus: LiveStatusData = {
        channel_id: channel.id,
        channel_name: channel.name,
        channel_url: channel.channel_url,
        is_live: channel.is_live,
        viewer_count: channel.is_live ? Math.floor(Math.random() * 1000) + 100 : 0,
        started_at: channel.is_live ? channel.updated_at : null,
        duration: channel.is_live 
          ? Math.floor((Date.now() - new Date(channel.updated_at).getTime()) / 1000)
          : null,
      };

      return createSuccessResponse(liveStatus);
    } catch (error) {
      console.error('获取直播状态失败:', error);
      return createErrorResponse(
        API_ERROR_CODES.INTERNAL_ERROR,
        '获取直播状态失败',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  },

  async getBatchLiveStatus(params: BatchLiveStatusRequest): Promise<ApiResponse<BatchLiveStatusData>> {
    try {
      if (!params.channel_ids || params.channel_ids.length === 0) {
        return createErrorResponse(
          API_ERROR_CODES.INVALID_PARAMETERS,
          '频道ID列表不能为空',
          { provided_params: params }
        );
      }

      const { data, error } = await supabase
        .from('channels')
        .select('id, name, is_live')
        .in('id', params.channel_ids);

      if (error) throw error;

      const channels = (data || []).map(channel => ({
        channel_id: channel.id,
        channel_name: channel.name,
        is_live: channel.is_live,
        viewer_count: channel.is_live ? Math.floor(Math.random() * 1000) + 100 : 0,
      }));

      return createSuccessResponse({ channels });
    } catch (error) {
      console.error('批量获取直播状态失败:', error);
      return createErrorResponse(
        API_ERROR_CODES.INTERNAL_ERROR,
        '批量获取直播状态失败',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  },

  async searchChannels(keyword: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<ChannelInfoData>>> {
    return this.getChannelList({ search: keyword, limit });
  },

  async getHotChannels(limit: number = 10): Promise<ApiResponse<PaginatedResponse<ChannelInfoData>>> {
    return this.getChannelList({
      is_live: true,
      sort_by: 'like_count',
      sort_order: 'desc',
      limit,
    });
  },

  async getRecommendedChannels(limit: number = 10): Promise<ApiResponse<PaginatedResponse<ChannelInfoData>>> {
    return this.getChannelList({
      sort_by: 'like_count',
      sort_order: 'desc',
      limit,
    });
  },
};

export function generateEmbedCode(channelUrl: string, options: {
  width?: string;
  height?: string;
  autoplay?: boolean;
  muted?: boolean;
} = {}): string {
  const width = options.width || '100%';
  const height = options.height || '400px';
  const embedUrl = `${WEB_BASE_URL}/embed/${channelUrl}`;
  
  return `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  allowfullscreen
  allow="autoplay; encrypted-media"
></iframe>`;
}

export function generateShareUrl(channelUrl: string): string {
  return `${WEB_BASE_URL}/channel/${channelUrl}`;
}

export { API_BASE_URL, API_ENDPOINTS, API_ERROR_CODES };
