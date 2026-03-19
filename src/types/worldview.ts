// 幻境界帖子平台类型定义

// 用户信息
export interface WorldviewUser {
  id: number; // API返回的是数字类型
  username: string;
  avatar?: string;
  bio?: string;
}

// 帖子对象
export interface Worldview {
  id: string;
  worldviewNumber: number;
  title: string;
  description: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  views: number;
  isPublic: boolean;
  commentsRestricted?: boolean;
  customCSS?: string;
  createdAt: string;
  updatedAt: string;
  author: WorldviewUser;
  likingUsers: WorldviewUser[];
}

// 帖子列表响应
export interface WorldviewListResponse {
  worldviews: Worldview[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: WorldviewUser;
}

// 创建帖子请求
export interface CreateWorldviewRequest {
  title: string;
  description: string;
  content: string;
  coverImage?: string;
  isPublic?: boolean;
  customCSS?: string;
  commentsRestricted?: boolean;
}

// 点赞响应
export interface LikeResponse {
  message: string;
  likesCount: number;
}

// 查询参数
export interface WorldviewQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  creator?: string;
  id?: string;
  wid?: string;
}
