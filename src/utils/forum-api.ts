import ky from 'ky';
import type { ForumPost, ForumListResponse, ForumQueryParams } from '@/types/forum';
import { getApiUrl, type ApiType } from '@/utils/cors';

const STATIC_BASE_URL = 'https://hmediapost.newblock.online';

export function getFullImageUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `${STATIC_BASE_URL}${path}`;
}

class ForumAPI {
  private client: typeof ky;
  private apiType: ApiType = 'forum';

  constructor() {
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? '/api/forum' : 'https://hmediapost.newblock.online/api/friend';
    
    this.client = ky.create({
      prefixUrl: baseUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      hooks: {
        beforeRequest: [
          (request) => {
            request.headers.set('Accept', 'application/json');
          },
        ],
      },
    });
  }

  async getPosts(params?: ForumQueryParams): Promise<ForumListResponse> {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = String(params.page);
    if (params?.limit) searchParams.limit = String(params.limit);

    const data = await this.client.get('posts', { searchParams }).json<ForumListResponse>();
    return this.processPostImages(data) as ForumListResponse;
  }

  async getPostById(id: string): Promise<ForumPost> {
    const data = await this.client.get(`posts/${id}`).json<ForumPost>();
    return this.processSinglePostImages(data);
  }

  private processPostImages(data: ForumListResponse): ForumListResponse {
    return {
      ...data,
      posts: data.posts.map(post => this.processSinglePostImages(post))
    };
  }

  private processSinglePostImages(post: ForumPost): ForumPost {
    return {
      ...post,
      author: {
        ...post.author,
        avatar: getFullImageUrl(post.author.avatar) || post.author.avatar
      },
      content: this.processContentImages(post.content)
    };
  }

  private processContentImages(content?: string): string | undefined {
    if (!content) return content;
    return content.replace(
      /!\[([^\]]*)\]\((\/[^)]+)\)/g,
      (match, alt, path) => `![${alt}](${STATIC_BASE_URL}${path})`
    );
  }
}

export const forumAPI = new ForumAPI();
