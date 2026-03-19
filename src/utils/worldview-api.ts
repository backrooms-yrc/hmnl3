import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  Worldview,
  WorldviewListResponse,
  CreateWorldviewRequest,
  LikeResponse,
  WorldviewQueryParams,
} from '@/types/worldview';

const STATIC_BASE_URL = 'https://worldviewplatform.newblock.online';

const TOKEN_KEY = 'worldview_token';
const USER_KEY = 'worldview_user';

export function getFullImageUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `${STATIC_BASE_URL}${path}`;
}

class WorldviewAPI {
  private client: AxiosInstance;

  constructor() {
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? '/api/worldview' : 'https://worldviewplatform.newblock.online/api';
    
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message: string; details?: string[] }>) => {
        if (error.response?.status === 401) {
          this.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await this.client.post<LoginResponse>('/auth/login', credentials);
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  logout(): void {
    this.clearAuth();
  }

  getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async getWorldviews(params?: WorldviewQueryParams): Promise<WorldviewListResponse> {
    const { data } = await this.client.get<WorldviewListResponse>('/worldviews', { params });
    return data;
  }

  async getRecentWorldviews(limit: number = 6): Promise<{ worldviews: Worldview[] }> {
    const { data } = await this.client.get<{ worldviews: Worldview[] }>('/worldviews/recent', {
      params: { limit },
    });
    return data;
  }

  async getWorldviewById(id: string): Promise<Worldview> {
    const { data } = await this.client.get<Worldview>(`/worldviews/${id}`);
    return data;
  }

  async getUserWorldviews(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<WorldviewListResponse> {
    const { data } = await this.client.get<WorldviewListResponse>(`/worldviews/user/${userId}`, {
      params: { page, limit },
    });
    return data;
  }

  async createWorldview(worldview: CreateWorldviewRequest): Promise<Worldview> {
    const { data } = await this.client.post<Worldview>('/worldviews', worldview);
    return data;
  }

  async toggleLike(id: string): Promise<LikeResponse> {
    const { data } = await this.client.post<LikeResponse>(`/worldviews/${id}/like`);
    return data;
  }

  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private setUser(user: unknown): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export const worldviewAPI = new WorldviewAPI();
