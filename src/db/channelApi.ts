import { supabase } from './supabase';
import type { Channel } from '@/types/types';

// ==================== 频道 API ====================

export interface ChannelListResponse {
  success: boolean;
  data: Channel[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

export interface ChannelDetailResponse {
  success: boolean;
  data: Channel | null;
  message?: string;
}

export interface PlayerUrlResponse {
  success: boolean;
  data: {
    channel_id: string;
    channel_name: string;
    channel_url: string;
    player_url: string;
    m3u8_url: string | null;
    stream_id: string | null;
    is_live: boolean;
  } | null;
  message?: string;
}

export interface LiveStatusResponse {
  success: boolean;
  data: {
    channel_id: string;
    channel_name: string;
    is_live: boolean;
    viewer_count?: number;
  } | null;
  message?: string;
}

// 获取频道列表
export async function getChannelList(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<ChannelListResponse> {
  try {
    let query = supabase
      .from('channels')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('获取频道列表失败:', error);
    return {
      success: false,
      data: [],
      total: 0,
      page,
      limit,
      message: error instanceof Error ? error.message : '获取频道列表失败'
    };
  }
}

// 通过URL或ID获取频道详情
export async function getChannelDetail(channelUrlOrId: string): Promise<ChannelDetailResponse> {
  try {
    // 先尝试通过 channel_url 查找
    let { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('channel_url', channelUrlOrId)
      .maybeSingle();

    // 如果没找到，尝试通过 id 查找
    if (!data && !error) {
      const result = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelUrlOrId)
        .maybeSingle();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return {
      success: !!data,
      data,
      message: data ? undefined : '频道不存在'
    };
  } catch (error) {
    console.error('获取频道详情失败:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '获取频道详情失败'
    };
  }
}

// 获取播放器地址
export async function getPlayerUrl(channelUrlOrId: string): Promise<PlayerUrlResponse> {
  try {
    const channelResult = await getChannelDetail(channelUrlOrId);
    
    if (!channelResult.success || !channelResult.data) {
      return {
        success: false,
        data: null,
        message: channelResult.message || '频道不存在'
      };
    }

    const channel = channelResult.data;
    const baseUrl = window.location.origin;
    const playerUrl = `${baseUrl}/channel?url=${channel.channel_url || channel.id}`;

    return {
      success: true,
      data: {
        channel_id: channel.id,
        channel_name: channel.name,
        channel_url: channel.channel_url || channel.id,
        player_url: playerUrl,
        m3u8_url: channel.m3u8_url,
        stream_id: channel.stream_id,
        is_live: channel.is_live
      }
    };
  } catch (error) {
    console.error('获取播放器地址失败:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '获取播放器地址失败'
    };
  }
}

// 获取直播状态
export async function getLiveStatus(channelUrlOrId: string): Promise<LiveStatusResponse> {
  try {
    const channelResult = await getChannelDetail(channelUrlOrId);
    
    if (!channelResult.success || !channelResult.data) {
      return {
        success: false,
        data: null,
        message: channelResult.message || '频道不存在'
      };
    }

    const channel = channelResult.data;

    return {
      success: true,
      data: {
        channel_id: channel.id,
        channel_name: channel.name,
        is_live: channel.is_live
      }
    };
  } catch (error) {
    console.error('获取直播状态失败:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '获取直播状态失败'
    };
  }
}

// 批量获取直播状态
export async function getBatchLiveStatus(channelIds: string[]): Promise<{
  success: boolean;
  data: { channel_id: string; is_live: boolean }[];
  message?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('id, is_live')
      .in('id', channelIds);

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map(ch => ({
        channel_id: ch.id,
        is_live: ch.is_live
      }))
    };
  } catch (error) {
    console.error('批量获取直播状态失败:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : '批量获取直播状态失败'
    };
  }
}

// 搜索频道
export async function searchChannels(
  keyword: string,
  limit: number = 20
): Promise<ChannelListResponse> {
  return getChannelList(1, limit, keyword);
}

// 获取热门频道
export async function getHotChannels(limit: number = 10): Promise<ChannelListResponse> {
  try {
    const { data, error, count } = await supabase
      .from('channels')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_live', true)
      .order('like_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page: 1,
      limit
    };
  } catch (error) {
    console.error('获取热门频道失败:', error);
    return {
      success: false,
      data: [],
      total: 0,
      page: 1,
      limit,
      message: error instanceof Error ? error.message : '获取热门频道失败'
    };
  }
}

// 获取推荐频道
export async function getRecommendedChannels(limit: number = 10): Promise<ChannelListResponse> {
  try {
    const { data, error, count } = await supabase
      .from('channels')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('like_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page: 1,
      limit
    };
  } catch (error) {
    console.error('获取推荐频道失败:', error);
    return {
      success: false,
      data: [],
      total: 0,
      page: 1,
      limit,
      message: error instanceof Error ? error.message : '获取推荐频道失败'
    };
  }
}

// ==================== 直播间 URL 生成 ====================

export interface StreamUrlInfo {
  rtmp_push_url: string;
  rtmp_push_key: string;
  hls_play_url: string;
  flv_play_url: string;
}

// 获取推流地址信息
export function getStreamUrls(streamId: string): StreamUrlInfo {
  // 根据实际配置修改这些地址
  const rtmpServer = import.meta.env.VITE_RTMP_SERVER || 'rtmp://localhost:1935/live';
  const hlsServer = import.meta.env.VITE_HLS_SERVER || 'http://localhost:8080/live';
  
  return {
    rtmp_push_url: rtmpServer,
    rtmp_push_key: streamId,
    hls_play_url: `${hlsServer}/${streamId}.m3u8`,
    flv_play_url: `${hlsServer.replace('http', 'ws')}/${streamId}.flv`
  };
}

// 生成频道分享链接
export function generateShareUrl(channelUrl: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/channel?url=${channelUrl}`;
}

// 生成嵌入播放器代码
export function generateEmbedCode(channelUrl: string, width: string = '100%', height: string = '400px'): string {
  const embedUrl = generateShareUrl(channelUrl);
  return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
}
