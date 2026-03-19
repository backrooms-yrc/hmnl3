const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const PROD_ORIGINS = [
  'https://hmnl3.20110208.xyz',
  'https://nchat.live',
  'https://hmediapost.newblock.online',
  'https://worldviewplatform.newblock.online',
];

export const DEFAULT_CORS_CONFIG = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] as const,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-App-Id',
    'X-Request-Id',
    'Cache-Control',
  ] as const,
  exposedHeaders: ['Content-Range', 'X-Total-Count', 'X-Request-Id'] as const,
  credentials: true,
  maxAge: 86400,
};

export function getAllowedOrigins(): string[] {
  const isDev = import.meta.env.DEV;
  return isDev ? [...DEV_ORIGINS, ...PROD_ORIGINS] : PROD_ORIGINS;
}

export function isOriginAllowed(origin: string): boolean {
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

export function getCorsHeaders(origin?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': DEFAULT_CORS_CONFIG.methods.join(', '),
    'Access-Control-Allow-Headers': DEFAULT_CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Expose-Headers': DEFAULT_CORS_CONFIG.exposedHeaders.join(', '),
    'Access-Control-Max-Age': String(DEFAULT_CORS_CONFIG.maxAge),
  };

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    if (DEFAULT_CORS_CONFIG.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

export type ApiType = 'forum' | 'worldview' | 'ai' | 'live' | 'default';

export function getApiUrl(endpoint: string, apiType: ApiType = 'default'): string {
  const isDev = import.meta.env.DEV;
  
  if (isDev) {
    switch (apiType) {
      case 'forum':
        return `/api/forum${endpoint}`;
      case 'worldview':
        return `/api/worldview${endpoint}`;
      case 'ai':
        return `/api/ai${endpoint}`;
      case 'live':
        return `/api/live${endpoint}`;
      default:
        return endpoint;
    }
  }
  
  const prodUrls: Record<Exclude<ApiType, 'default'>, string> = {
    forum: 'https://hmediapost.newblock.online/api/friend',
    worldview: 'https://worldviewplatform.newblock.online/api',
    ai: 'https://d.lconai.com',
    live: 'https://nchat.live/api',
  };
  
  if (apiType !== 'default') {
    return `${prodUrls[apiType]}${endpoint}`;
  }
  
  return endpoint;
}

export function createCorsAwareHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = localStorage.getItem('worldview_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  return {
    ...defaultHeaders,
    ...customHeaders,
  };
}

export async function corsFetch<T>(
  url: string,
  options: RequestInit = {},
  apiType: ApiType = 'default'
): Promise<T> {
  const fullUrl = getApiUrl(url, apiType);
  const headers = createCorsAwareHeaders(options.headers as Record<string, string>);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    mode: 'cors',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text() as unknown as T;
}

export const API_ENDPOINTS_CONFIG = {
  forum: {
    baseUrl: 'https://hmediapost.newblock.online/api/friend',
    devProxy: '/api/forum',
  },
  worldview: {
    baseUrl: 'https://worldviewplatform.newblock.online/api',
    devProxy: '/api/worldview',
  },
  ai: {
    baseUrl: 'https://d.lconai.com',
    devProxy: '/api/ai',
  },
  live: {
    baseUrl: 'https://nchat.live/api',
    devProxy: '/api/live',
  },
  supabase: {
    baseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  },
};
