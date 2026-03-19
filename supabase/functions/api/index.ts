// HMNL直播讨论站 - 统一API接口
// 提供RESTful API访问所有功能

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestContext {
  supabase: ReturnType<typeof createClient>;
  userId: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// 创建Supabase客户端
function createSupabaseClient(authHeader?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = authHeader?.replace('Bearer ', '') || Deno.env.get('SUPABASE_ANON_KEY')!;
  
  return createClient(supabaseUrl, supabaseKey);
}

// 获取请求上下文（用户信息和权限）
async function getRequestContext(req: Request): Promise<RequestContext> {
  const authHeader = req.headers.get('Authorization');
  const supabase = createSupabaseClient(authHeader);
  
  let userId: string | null = null;
  let isAdmin = false;
  let isSuperAdmin = false;
  
  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      
      // 获取用户角色
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_super_admin')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile) {
        isAdmin = profile.role === 'admin' || profile.is_super_admin === true;
        isSuperAdmin = profile.is_super_admin === true;
      }
    }
  }
  
  return { supabase, userId, isAdmin, isSuperAdmin };
}

// 错误响应
function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// 成功响应
function successResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({ data }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ==================== 用户管理 API ====================

async function handleProfilesAPI(req: Request, ctx: RequestContext, pathParts: string[]) {
  const method = req.method;
  
  // GET /api/profiles/:userId - 获取用户信息
  if (method === 'GET' && pathParts.length === 1) {
    const userId = pathParts[0];
    const { data, error } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) return errorResponse(error.message);
    if (!data) return errorResponse('用户不存在', 404);
    
    return successResponse({
      ...data,
      titles: Array.isArray(data.titles) ? data.titles : []
    });
  }
  
  // PUT /api/profiles/:userId - 更新用户信息
  if (method === 'PUT' && pathParts.length === 1) {
    const userId = pathParts[0];
    if (!ctx.userId) return errorResponse('未授权', 401);
    if (ctx.userId !== userId && !ctx.isAdmin) return errorResponse('无权限', 403);
    
    const body = await req.json();
    const { data, error } = await ctx.supabase
      .from('profiles')
      .update(body)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse({
      ...data,
      titles: Array.isArray(data.titles) ? data.titles : []
    });
  }
  
  // GET /api/profiles - 获取所有用户（管理员）
  if (method === 'GET' && pathParts.length === 0) {
    if (!ctx.isAdmin) return errorResponse('需要管理员权限', 403);
    
    const { data, error } = await ctx.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return errorResponse(error.message);
    
    const profiles = Array.isArray(data) ? data.map(profile => ({
      ...profile,
      titles: Array.isArray(profile.titles) ? profile.titles : []
    })) : [];
    
    return successResponse(profiles);
  }
  
  return errorResponse('不支持的操作', 405);
}

// ==================== 帖子管理 API ====================

async function handlePostsAPI(req: Request, ctx: RequestContext, pathParts: string[]) {
  const method = req.method;
  const url = new URL(req.url);
  
  // GET /api/posts - 获取帖子列表
  if (method === 'GET' && pathParts.length === 0) {
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';
    
    let query = ctx.supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*)
      `);
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) return errorResponse(error.message);
    return successResponse(Array.isArray(data) ? data : []);
  }
  
  // GET /api/posts/:postId - 获取帖子详情
  if (method === 'GET' && pathParts.length === 1) {
    const postId = pathParts[0];
    const { data, error } = await ctx.supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*)
      `)
      .eq('id', postId)
      .maybeSingle();
    
    if (error) return errorResponse(error.message);
    if (!data) return errorResponse('帖子不存在', 404);
    
    // 增加浏览次数
    await ctx.supabase.rpc('increment_post_view_count', { post_id: postId });
    
    return successResponse(data);
  }
  
  // POST /api/posts - 创建帖子
  if (method === 'POST' && pathParts.length === 0) {
    if (!ctx.userId) return errorResponse('未授权', 401);
    
    const body = await req.json();
    const { title, content } = body;
    
    if (!title || !content) {
      return errorResponse('标题和内容不能为空');
    }
    
    const { data, error } = await ctx.supabase
      .from('posts')
      .insert({ title, content, author_id: ctx.userId })
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*)
      `)
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
  }
  
  // PUT /api/posts/:postId - 更新帖子
  if (method === 'PUT' && pathParts.length === 1) {
    const postId = pathParts[0];
    if (!ctx.userId) return errorResponse('未授权', 401);
    
    // 检查权限
    const { data: post } = await ctx.supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .maybeSingle();
    
    if (!post) return errorResponse('帖子不存在', 404);
    if (post.author_id !== ctx.userId && !ctx.isAdmin) {
      return errorResponse('无权限', 403);
    }
    
    const body = await req.json();
    const { data, error } = await ctx.supabase
      .from('posts')
      .update(body)
      .eq('id', postId)
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*)
      `)
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse(data);
  }
  
  // DELETE /api/posts/:postId - 删除帖子
  if (method === 'DELETE' && pathParts.length === 1) {
    const postId = pathParts[0];
    if (!ctx.userId) return errorResponse('未授权', 401);
    
    // 检查权限
    const { data: post } = await ctx.supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .maybeSingle();
    
    if (!post) return errorResponse('帖子不存在', 404);
    if (post.author_id !== ctx.userId && !ctx.isAdmin) {
      return errorResponse('无权限', 403);
    }
    
    const { error } = await ctx.supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) return errorResponse(error.message);
    return successResponse({ message: '删除成功' });
  }
  
  return errorResponse('不支持的操作', 405);
}

// ==================== 评论管理 API ====================

async function handleCommentsAPI(req: Request, ctx: RequestContext, pathParts: string[]) {
  const method = req.method;
  const url = new URL(req.url);
  
  // GET /api/comments?post_id=xxx - 获取帖子的评论
  if (method === 'GET' && pathParts.length === 0) {
    const postId = url.searchParams.get('post_id');
    if (!postId) return errorResponse('缺少post_id参数');
    
    const { data, error } = await ctx.supabase
      .from('comments')
      .select(`
        *,
        author:profiles!comments_author_id_fkey(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) return errorResponse(error.message);
    return successResponse(Array.isArray(data) ? data : []);
  }
  
  // POST /api/comments - 创建评论
  if (method === 'POST' && pathParts.length === 0) {
    if (!ctx.userId) return errorResponse('未授权', 401);
    
    const body = await req.json();
    const { post_id, content } = body;
    
    if (!post_id || !content) {
      return errorResponse('帖子ID和内容不能为空');
    }
    
    const { data, error } = await ctx.supabase
      .from('comments')
      .insert({ post_id, content, author_id: ctx.userId })
      .select(`
        *,
        author:profiles!comments_author_id_fkey(*)
      `)
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
  }
  
  // DELETE /api/comments/:commentId - 删除评论
  if (method === 'DELETE' && pathParts.length === 1) {
    const commentId = pathParts[0];
    if (!ctx.userId) return errorResponse('未授权', 401);
    
    // 检查权限
    const { data: comment } = await ctx.supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .maybeSingle();
    
    if (!comment) return errorResponse('评论不存在', 404);
    if (comment.author_id !== ctx.userId && !ctx.isAdmin) {
      return errorResponse('无权限', 403);
    }
    
    const { error } = await ctx.supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) return errorResponse(error.message);
    return successResponse({ message: '删除成功' });
  }
  
  return errorResponse('不支持的操作', 405);
}

// ==================== 聊天消息 API ====================

async function handleChatAPI(req: Request, ctx: RequestContext, pathParts: string[]) {
  const method = req.method;
  const url = new URL(req.url);
  
  // GET /api/chat/messages - 获取聊天消息
  if (method === 'GET' && pathParts[0] === 'messages') {
    const limit = parseInt(url.searchParams.get('limit') || '100');
    
    const { data, error } = await ctx.supabase
      .from('chat_messages')
      .select(`
        *,
        author:profiles!chat_messages_author_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) return errorResponse(error.message);
    
    const messages = Array.isArray(data) ? data.map(msg => ({
      ...msg,
      author: {
        ...msg.author,
        titles: Array.isArray(msg.author?.titles) ? msg.author.titles : []
      }
    })).reverse() : [];
    
    return successResponse(messages);
  }
  
  // POST /api/chat/messages - 发送聊天消息
  if (method === 'POST' && pathParts[0] === 'messages') {
    if (!ctx.userId) return errorResponse('未授权', 401);
    
    const body = await req.json();
    const { content } = body;
    
    if (!content) return errorResponse('消息内容不能为空');
    
    const { data, error } = await ctx.supabase
      .from('chat_messages')
      .insert({ content, author_id: ctx.userId })
      .select(`
        *,
        author:profiles!chat_messages_author_id_fkey(*)
      `)
      .single();
    
    if (error) return errorResponse(error.message);
    
    return successResponse({
      ...data,
      author: {
        ...data.author,
        titles: Array.isArray(data.author?.titles) ? data.author.titles : []
      }
    }, 201);
  }
  
  // DELETE /api/chat/messages/:messageId - 删除聊天消息
  if (method === 'DELETE' && pathParts[0] === 'messages' && pathParts.length === 2) {
    const messageId = pathParts[1];
    if (!ctx.userId) return errorResponse('未授权', 401);
    
    // 检查权限
    const { data: message } = await ctx.supabase
      .from('chat_messages')
      .select('author_id')
      .eq('id', messageId)
      .maybeSingle();
    
    if (!message) return errorResponse('消息不存在', 404);
    if (message.author_id !== ctx.userId && !ctx.isAdmin) {
      return errorResponse('无权限', 403);
    }
    
    const { error } = await ctx.supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);
    
    if (error) return errorResponse(error.message);
    return successResponse({ message: '删除成功' });
  }
  
  return errorResponse('不支持的操作', 405);
}

// ==================== 通知 API ====================

async function handleNotificationsAPI(req: Request, ctx: RequestContext, pathParts: string[]) {
  const method = req.method;
  
  if (!ctx.userId) return errorResponse('未授权', 401);
  
  // GET /api/notifications - 获取通知列表
  if (method === 'GET' && pathParts.length === 0) {
    const { data, error } = await ctx.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('created_at', { ascending: false });
    
    if (error) return errorResponse(error.message);
    return successResponse(Array.isArray(data) ? data : []);
  }
  
  // GET /api/notifications/unread-count - 获取未读通知数量
  if (method === 'GET' && pathParts[0] === 'unread-count') {
    const { count, error } = await ctx.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ctx.userId)
      .eq('is_read', false);
    
    if (error) return errorResponse(error.message);
    return successResponse({ count: count || 0 });
  }
  
  // PUT /api/notifications/:notificationId/read - 标记通知为已读
  if (method === 'PUT' && pathParts.length === 2 && pathParts[1] === 'read') {
    const notificationId = pathParts[0];
    
    const { error } = await ctx.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', ctx.userId);
    
    if (error) return errorResponse(error.message);
    return successResponse({ message: '已标记为已读' });
  }
  
  // PUT /api/notifications/read-all - 标记所有通知为已读
  if (method === 'PUT' && pathParts[0] === 'read-all') {
    const { error } = await ctx.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', ctx.userId)
      .eq('is_read', false);
    
    if (error) return errorResponse(error.message);
    return successResponse({ message: '已标记所有通知为已读' });
  }
  
  // DELETE /api/notifications/:notificationId - 删除通知
  if (method === 'DELETE' && pathParts.length === 1) {
    const notificationId = pathParts[0];
    
    const { error } = await ctx.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', ctx.userId);
    
    if (error) return errorResponse(error.message);
    return successResponse({ message: '删除成功' });
  }
  
  return errorResponse('不支持的操作', 405);
}

// ==================== 频道管理 API ====================

async function handleChannelsAPI(req: Request, ctx: RequestContext, pathParts: string[]) {
  const method = req.method;
  const url = new URL(req.url);
  
  // GET /api/channels - 获取频道列表
  if (method === 'GET' && pathParts.length === 0) {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    
    let query = ctx.supabase
      .from('channels')
      .select(`
        *,
        creator:profiles!created_by(id, username, role, is_super_admin, avatar_url),
        owner:profiles!user_id(id, username, avatar_url)
      `, { count: 'exact' })
      .eq('is_active', true);
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) return errorResponse(error.message);
    
    return successResponse({
      channels: Array.isArray(data) ? data : [],
      total: count || 0,
      page,
      limit
    });
  }
  
  // GET /api/channels/:channelId - 获取频道详情
  if (method === 'GET' && pathParts.length === 1) {
    const channelId = pathParts[0];
    
    const { data, error } = await ctx.supabase
      .from('channels')
      .select(`
        *,
        creator:profiles!created_by(id, username, role, is_super_admin, avatar_url),
        owner:profiles!user_id(id, username, avatar_url)
      `)
      .eq('id', channelId)
      .maybeSingle();
    
    if (error) return errorResponse(error.message);
    if (!data) return errorResponse('频道不存在', 404);
    
    return successResponse(data);
  }
  
  // POST /api/channels - 创建频道（管理员）
  if (method === 'POST' && pathParts.length === 0) {
    if (!ctx.isAdmin) return errorResponse('需要管理员权限', 403);
    
    const body = await req.json();
    const { data, error } = await ctx.supabase
      .from('channels')
      .insert({
        ...body,
        created_by: ctx.userId,
        is_active: true,
        is_live: false
      })
      .select()
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
  }
  
  // PUT /api/channels/:channelId - 更新频道
  if (method === 'PUT' && pathParts.length === 1) {
    const channelId = pathParts[0];
    if (!ctx.isAdmin) return errorResponse('需要管理员权限', 403);
    
    const body = await req.json();
    const { data, error } = await ctx.supabase
      .from('channels')
      .update(body)
      .eq('id', channelId)
      .select()
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse(data);
  }
  
  // DELETE /api/channels/:channelId - 删除频道
  if (method === 'DELETE' && pathParts.length === 1) {
    const channelId = pathParts[0];
    if (!ctx.isAdmin) return errorResponse('需要管理员权限', 403);
    
    const { error } = await ctx.supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
    
    if (error) return errorResponse(error.message);
    return successResponse({ message: '删除成功' });
  }
  
  return errorResponse('不支持的操作', 405);
}

// ==================== 举报管理 API ====================

async function handleReportsAPI(req: Request, ctx: RequestContext, pathParts: string[]) {
  const method = req.method;
  
  // GET /api/reports - 获取举报列表
  if (method === 'GET' && pathParts.length === 0) {
    if (!ctx.userId) return errorResponse('未授权', 401);
    
    let query = ctx.supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(*),
        handler:profiles!reports_handled_by_fkey(*)
      `);
    
    // 管理员可以看所有举报，普通用户只能看自己的
    if (!ctx.isAdmin) {
      query = query.eq('reporter_id', ctx.userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) return errorResponse(error.message);
    return successResponse(Array.isArray(data) ? data : []);
  }
  
  // POST /api/reports - 创建举报
  if (method === 'POST' && pathParts.length === 0) {
    if (!ctx.userId) return errorResponse('未授权', 401);
    
    const body = await req.json();
    const { report_type, target_id, reason } = body;
    
    if (!report_type || !target_id || !reason) {
      return errorResponse('举报类型、目标ID和原因不能为空');
    }
    
    // 检查是否已举报过
    const { data: existing } = await ctx.supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', ctx.userId)
      .eq('report_type', report_type)
      .eq('target_id', target_id)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (existing) {
      return errorResponse('您已经举报过该内容，请等待处理');
    }
    
    const { data, error } = await ctx.supabase
      .from('reports')
      .insert({
        reporter_id: ctx.userId,
        report_type,
        target_id,
        reason,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
  }
  
  // PUT /api/reports/:reportId - 处理举报（管理员）
  if (method === 'PUT' && pathParts.length === 1) {
    const reportId = pathParts[0];
    if (!ctx.isAdmin) return errorResponse('需要管理员权限', 403);
    
    const body = await req.json();
    const { status, admin_note } = body;
    
    if (!status) return errorResponse('状态不能为空');
    
    const { data, error } = await ctx.supabase
      .from('reports')
      .update({
        status,
        handled_by: ctx.userId,
        handled_at: new Date().toISOString(),
        admin_note: admin_note || null
      })
      .eq('id', reportId)
      .select()
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse(data);
  }
  
  return errorResponse('不支持的操作', 405);
}

// ==================== 公告管理 API ====================

async function handleAnnouncementsAPI(req: Request, ctx: RequestContext, pathParts: string[]) {
  const method = req.method;
  
  // GET /api/announcements - 获取公告列表
  if (method === 'GET' && pathParts.length === 0) {
    const url = new URL(req.url);
    const activeOnly = url.searchParams.get('active') === 'true';
    
    let query = ctx.supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) return errorResponse(error.message);
    return successResponse(Array.isArray(data) ? data : []);
  }
  
  // POST /api/announcements - 创建公告（管理员）
  if (method === 'POST' && pathParts.length === 0) {
    if (!ctx.isAdmin) return errorResponse('需要管理员权限', 403);
    
    const body = await req.json();
    const { data, error } = await ctx.supabase
      .from('announcements')
      .insert(body)
      .select()
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
  }
  
  // PUT /api/announcements/:announcementId - 更新公告（管理员）
  if (method === 'PUT' && pathParts.length === 1) {
    const announcementId = pathParts[0];
    if (!ctx.isAdmin) return errorResponse('需要管理员权限', 403);
    
    const body = await req.json();
    const { data, error } = await ctx.supabase
      .from('announcements')
      .update(body)
      .eq('id', announcementId)
      .select()
      .single();
    
    if (error) return errorResponse(error.message);
    return successResponse(data);
  }
  
  // DELETE /api/announcements/:announcementId - 删除公告（管理员）
  if (method === 'DELETE' && pathParts.length === 1) {
    const announcementId = pathParts[0];
    if (!ctx.isAdmin) return errorResponse('需要管理员权限', 403);
    
    const { error } = await ctx.supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId);
    
    if (error) return errorResponse(error.message);
    return successResponse({ message: '删除成功' });
  }
  
  return errorResponse('不支持的操作', 405);
}

// ==================== 主路由处理 ====================

Deno.serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.replace(/^\//, '').split('/').filter(Boolean);
    
    // 获取请求上下文
    const ctx = await getRequestContext(req);
    
    // 路由分发
    if (pathParts[0] === 'profiles') {
      return await handleProfilesAPI(req, ctx, pathParts.slice(1));
    }
    
    if (pathParts[0] === 'posts') {
      return await handlePostsAPI(req, ctx, pathParts.slice(1));
    }
    
    if (pathParts[0] === 'comments') {
      return await handleCommentsAPI(req, ctx, pathParts.slice(1));
    }
    
    if (pathParts[0] === 'chat') {
      return await handleChatAPI(req, ctx, pathParts.slice(1));
    }
    
    if (pathParts[0] === 'notifications') {
      return await handleNotificationsAPI(req, ctx, pathParts.slice(1));
    }
    
    if (pathParts[0] === 'channels') {
      return await handleChannelsAPI(req, ctx, pathParts.slice(1));
    }
    
    if (pathParts[0] === 'reports') {
      return await handleReportsAPI(req, ctx, pathParts.slice(1));
    }
    
    if (pathParts[0] === 'announcements') {
      return await handleAnnouncementsAPI(req, ctx, pathParts.slice(1));
    }
    
    // 根路径返回API信息
    if (pathParts.length === 0) {
      return successResponse({
        name: 'HMNL直播讨论站 API',
        version: '1.0.0',
        endpoints: [
          '/profiles',
          '/posts',
          '/comments',
          '/chat',
          '/notifications',
          '/channels',
          '/reports',
          '/announcements'
        ]
      });
    }
    
    return errorResponse('未找到该API端点', 404);
    
  } catch (error) {
    console.error('API错误:', error);
    return errorResponse(
      error instanceof Error ? error.message : '服务器内部错误',
      500
    );
  }
});
