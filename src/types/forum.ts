export interface ForumUser {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export interface ForumPost {
  id: string;
  PostNumber: number;
  title: string;
  description: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: ForumUser;
}

export interface ForumListResponse {
  posts: ForumPost[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface ForumQueryParams {
  page?: number;
  limit?: number;
}
