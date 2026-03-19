export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: ApiError;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface LiveRoomUrlRequest {
  channel_id?: string;
  channel_url?: string;
  stream_id?: string;
}

export interface LiveRoomUrlData {
  channel_id: string;
  channel_name: string;
  channel_url: string;
  stream_id: string;
  rtmp_push_url: string;
  rtmp_push_key: string;
  hls_play_url: string;
  flv_play_url: string;
  web_play_url: string;
  is_live: boolean;
  created_at: string;
}

export interface PlayerUrlRequest {
  channel_id?: string;
  channel_url?: string;
  format?: 'hls' | 'flv' | 'auto';
  quality?: 'high' | 'medium' | 'low' | 'auto';
}

export interface PlayerUrlData {
  channel_id: string;
  channel_name: string;
  channel_url: string;
  player_url: string;
  embed_url: string;
  stream_urls: {
    hls: string | null;
    flv: string | null;
  };
  stream_id: string | null;
  is_live: boolean;
  quality: string;
  format: string;
}

export interface ChannelInfoRequest {
  channel_id?: string;
  channel_url?: string;
  include_stats?: boolean;
}

export interface ChannelInfoData {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  channel_url: string;
  stream_id: string;
  is_live: boolean;
  is_active: boolean;
  like_count: number;
  viewer_count?: number;
  owner?: {
    id: string;
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  stats?: {
    total_views: number;
    total_likes: number;
    followers: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ChannelListRequest extends PaginationParams {
  search?: string;
  is_live?: boolean;
  sort_by?: 'created_at' | 'like_count' | 'viewer_count';
  sort_order?: 'asc' | 'desc';
}

export interface LiveStatusData {
  channel_id: string;
  channel_name: string;
  channel_url: string;
  is_live: boolean;
  viewer_count: number;
  started_at: string | null;
  duration: number | null;
}

export interface BatchLiveStatusRequest {
  channel_ids: string[];
}

export interface BatchLiveStatusData {
  channels: {
    channel_id: string;
    channel_name: string;
    is_live: boolean;
    viewer_count: number;
  }[];
}

export const API_BASE_URL = 'https://hmnl3.20110208.xyz';
export const API_VERSION = 'v1';
export const API_PREFIX = '/api';

export const API_ENDPOINTS = {
  liveRoomUrl: `${API_PREFIX}/${API_VERSION}/live/room-url`,
  playerUrl: `${API_PREFIX}/${API_VERSION}/live/player-url`,
  channelInfo: `${API_PREFIX}/${API_VERSION}/channel/info`,
  channelList: `${API_PREFIX}/${API_VERSION}/channel/list`,
  liveStatus: `${API_PREFIX}/${API_VERSION}/live/status`,
  batchLiveStatus: `${API_PREFIX}/${API_VERSION}/live/status/batch`,
  searchChannels: `${API_PREFIX}/${API_VERSION}/channel/search`,
  hotChannels: `${API_PREFIX}/${API_VERSION}/channel/hot`,
  recommendedChannels: `${API_PREFIX}/${API_VERSION}/channel/recommended`,
} as const;

export const API_ERROR_CODES = {
  CHANNEL_NOT_FOUND: 'CHANNEL_NOT_FOUND',
  CHANNEL_INACTIVE: 'CHANNEL_INACTIVE',
  STREAM_NOT_AVAILABLE: 'STREAM_NOT_AVAILABLE',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
