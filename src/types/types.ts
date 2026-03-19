// 数据库类型定义

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  numeric_id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  title: string | null; // 保留用于向后兼容
  titles: string[] | null; // 新的多头衔字段，允许为 null
  is_verified: boolean;
  is_super_admin: boolean; // 超级管理员标识
  real_name: string | null; // 实名认证姓名
  id_card_last4: string | null; // 身份证后4位（用于显示）
  id_card_number: string | null; // 完整身份证号码（仅超管可查看）
  is_real_verified: boolean; // 是否已实名认证
  phone: string | null; // 手机号
  phone_password: string | null; // 手机号登录密码（内部使用）
  face_token: string | null; // 人脸识别token
  face_registered: boolean; // 是否已注册人脸
  is_streamer: boolean; // 是否为入驻主播
  stream_id: string | null; // 推流ID
  channel_name: string | null; // 频道名称
  channel_description: string | null; // 频道简介
  channel_logo: string | null; // 台标URL
  is_live: boolean; // 是否正在直播
  city: string | null; // 用户所在城市（根据IP自动定位）
  ip_address: string | null; // 用户最后登录IP地址
  last_login_at: string | null; // 用户最后登录时间
  is_vip: boolean; // 是否为会员
  vip_expire_at: string | null; // 会员到期时间
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  user_id: string | null;
  stream_id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  is_live: boolean;
  is_active: boolean;
  m3u8_url: string | null; // 自定义m3u8直播流链接
  channel_url: string; // 频道唯一URL
  like_count: number; // 点赞数
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PopupAnnouncement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  priority: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ChatMessage {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  link: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export type ReportType = 'message' | 'post' | 'user';
export type ReportStatus = 'pending' | 'resolved' | 'rejected';

export interface Report {
  id: string;
  reporter_id: string;
  report_type: ReportType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  handled_by: string | null;
  handled_at: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
  handler?: Profile;
}

// 频道聊天消息类型
export interface ChannelMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

// 直播互动类型
export type InteractionType = 'announcement' | 'poll' | 'lottery';

export interface LiveInteraction {
  id: string;
  channel_id: string;
  user_id: string;
  type: InteractionType;
  title: string;
  content: any; // JSONB类型，根据type不同存储不同结构
  is_active: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  profiles?: Profile;
}

// 公告内容结构
export interface AnnouncementContent {
  text: string;
}

// 投票内容结构
export interface PollContent {
  options: string[]; // 投票选项
  allow_multiple: boolean; // 是否允许多选
}

// 抽奖内容结构
export interface LotteryContent {
  prize: string; // 奖品描述
  winner_count: number; // 中奖人数
  rules: string; // 抽奖规则
}

// 投票记录
export interface PollVote {
  id: string;
  interaction_id: string;
  user_id: string;
  option_index: number;
  created_at: string;
}

// 抽奖参与者
export interface LotteryParticipant {
  id: string;
  interaction_id: string;
  user_id: string;
  is_winner: boolean;
  created_at: string;
  profiles?: Profile;
}

// 频道点赞
export interface ChannelLike {
  id: string;
  channel_id: string;
  user_id: string;
  created_at: string;
}

// 订阅与钱包相关类型

// 订阅类型
export type SubscriptionType = 'monthly' | 'continuous_monthly';

// 订阅状态
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

// 会员订阅
export interface Subscription {
  id: string;
  user_id: string;
  subscription_type: SubscriptionType;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

// 钱包交易类型
export type WalletTransactionType = 'sign_in' | 'recharge' | 'consume' | 'reward_send' | 'reward_receive' | 'refund';

// 幻梦币钱包
export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

// 幻梦币交易记录
export interface WalletTransaction {
  id: string;
  user_id: string;
  type: WalletTransactionType;
  amount: number;
  balance_after: number;
  description: string | null;
  related_order_id: string | null;
  related_user_id: string | null;
  created_at: string;
  related_user?: Profile;
}

// 每日签到记录
export interface DailyCheckIn {
  id: string;
  user_id: string;
  check_in_date: string;
  reward_amount: number;
  created_at: string;
}

// 订单类型
export type OrderType = 'subscription' | 'coin_recharge' | 'product';

// 订单状态
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded' | 'partial_refunded';

// 订单
export interface Order {
  id: string;
  order_no: string;
  user_id: string;
  order_type: OrderType;
  status: OrderStatus;
  wechat_pay_url: string | null;
  total_amount: number;
  subscription_type: string | null;
  coin_amount: number | null;
  created_at: string;
  updated_at: string;
}

// SKU
export interface SKU {
  id: string;
  sku_code: string;
  name: string;
  description: string | null;
  price: number;
  inventory_total: number;
  inventory_available: number;
  inventory_reserved: number;
  inventory_sold: number;
  created_at: string;
  updated_at: string;
}

// 订单明细
export interface OrderItem {
  id: string;
  order_id: string;
  sku_code: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku_snapshot: SKU;
  created_at: string;
}

// AI模型
export interface AIModel {
  id: string;
  model_name: string; // 请求体模型名称
  display_name: string; // 外显名称
  description: string | null; // 简介
  is_active: boolean; // 是否启用
  is_system: boolean; // 是否系统默认模型
  supports_file_upload: boolean; // 是否支持文件上传
  display_order: number; // 显示顺序
  created_by: string | null; // 创建者ID
  created_at: string;
  updated_at: string;
}

// AI对话
export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  model_name: string;
  created_at: string;
  updated_at: string;
}

// AI消息
export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

// 放送页面（直播间独立页面）
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
}

// 放送页面文件
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
