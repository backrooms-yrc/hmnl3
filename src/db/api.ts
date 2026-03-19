import { supabase } from './supabase';
import type { Profile, Post, Comment, ChatMessage, Notification, Report, ReportType, ReportStatus, Channel, Announcement, BroadcastPage, BroadcastFile } from '@/types/types';

// ==================== Profiles ====================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  
  // 确保 titles 字段始终是数组
  if (data) {
    return {
      ...data,
      titles: Array.isArray(data.titles) ? data.titles : []
    };
  }
  
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  
  // 确保 titles 字段始终是数组
  return {
    ...data,
    titles: Array.isArray(data.titles) ? data.titles : []
  };
}

// 更新用户直播状态
export async function updateLiveStatus(userId: string, isLive: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_live: isLive })
    .eq('id', userId);

  if (error) throw error;
}

// 获取用户直播状态
export async function getLiveStatus(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_live')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.is_live ?? false;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // 确保 titles 字段始终是数组
  const profiles = Array.isArray(data) ? data.map(profile => ({
    ...profile,
    titles: Array.isArray(profile.titles) ? profile.titles : []
  })) : [];
  
  return profiles;
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateUserTitle(userId: string, title: string | null): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ title })
    .eq('id', userId);

  if (error) {
    console.error('更新用户单个头衔失败:', error);
    throw error;
  }
}

export async function updateUserTitles(userId: string, titles: string[]): Promise<void> {
  // 确保 titles 是一个有效的数组
  const validTitles = Array.isArray(titles) ? titles.filter(t => t && t.trim()) : [];
  
  console.log('更新用户头衔:', { userId, titles: validTitles });
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ titles: validTitles })
    .eq('id', userId)
    .select('id, username, titles');

  if (error) {
    console.error('更新用户头衔失败:', error);
    throw error;
  }
  
  console.log('更新用户头衔成功:', data);
}

export async function updateUserVerified(userId: string, isVerified: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_verified: isVerified })
    .eq('id', userId);

  if (error) throw error;
}

// 更新用户入驻状态
export async function updateUserStreamer(userId: string, isStreamer: boolean): Promise<void> {
  // 更新入驻状态
  const { error } = await supabase
    .from('profiles')
    .update({ is_streamer: isStreamer })
    .eq('id', userId);

  if (error) throw error;

  // 如果是设置为入驻用户，检查是否需要创建频道
  if (isStreamer) {
    // 获取用户的频道信息
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('channel_name, channel_description, channel_logo, stream_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('获取用户频道信息失败:', profileError);
      return;
    }

    // 如果用户有频道信息，检查channels表中是否已存在
    if (profile?.channel_name && profile?.stream_id) {
      const { data: existingChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', userId)
        .eq('stream_id', profile.stream_id)
        .maybeSingle();

      // 如果不存在，则创建频道记录
      if (!existingChannel) {
        // 生成频道URL
        let url = generateChannelUrl();
        while (await checkChannelUrlExists(url)) {
          url = generateChannelUrl();
        }
        const { error: createError } = await supabase
          .from('channels')
          .insert({
            user_id: userId,
            stream_id: profile.stream_id,
            name: profile.channel_name,
            description: profile.channel_description || '',
            cover_image: profile.channel_logo || null,
            channel_url: url,
            like_count: 0,
            is_active: true,
            is_live: false,
            created_by: userId,
          });

        if (createError) {
          console.error('创建频道记录失败:', createError);
        } else {
          console.log('已自动创建频道记录:', profile.channel_name);
        }
      }
    }
  }
}

// 实名认证
export async function verifyRealName(
  userId: string,
  name: string,
  idCard: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('开始实名认证:', { userId, name: name.substring(0, 1) + '**', idCard: idCard.substring(0, 6) + '********' + idCard.slice(-4) });
    
    // 调用身份证二要素认证API
    const apiUrl = `https://api-integrations.appmiaoda.com/app-883oyd7kz475/api-AalZ7kOrgk8L/idcard`;
    console.log('API请求URL:', apiUrl);
    console.log('请求参数:', { name: name.substring(0, 1) + '**', idcard: idCard.substring(0, 6) + '********' + idCard.slice(-4) });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': import.meta.env.VITE_APP_ID,
      },
      body: JSON.stringify({
        name: name,
        idcard: idCard,
      }),
    });

    console.log('API响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API请求失败，响应内容:', errorText);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API响应结果:', result);

    // 检查API响应
    if (result.showapi_res_code !== 0) {
      console.error('API返回错误:', result.showapi_res_error);
      throw new Error(result.showapi_res_error || 'API返回错误');
    }

    const body = result.showapi_res_body;
    console.log('API响应body:', body);

    // code: 0=匹配，1=不匹配，2=无此身份证号码
    if (body.code === 0) {
      // 认证成功，更新数据库
      console.log('身份验证成功，更新数据库...');
      const idCardLast4 = idCard.slice(-4);
      const { error } = await supabase
        .from('profiles')
        .update({
          real_name: name,
          id_card_last4: idCardLast4,
          id_card_number: idCard, // 保存完整身份证号码（仅超管可查看）
          is_real_verified: true,
        })
        .eq('id', userId);

      if (error) {
        console.error('数据库更新失败:', error);
        throw error;
      }

      console.log('实名认证成功');
      return { success: true, message: '实名认证成功' };
    } else if (body.code === 1) {
      console.log('姓名与身份证号不匹配');
      return { success: false, message: '姓名与身份证号不匹配' };
    } else if (body.code === 2) {
      console.log('无此身份证号码');
      return { success: false, message: '无此身份证号码' };
    } else {
      console.log('认证失败:', body.msg);
      return { success: false, message: body.msg || '认证失败' };
    }
  } catch (error) {
    console.error('实名认证错误:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '认证过程出错，请稍后重试',
    };
  }
}

// 修改实名信息
export async function updateRealNameInfo(
  userId: string,
  name: string,
  idCard: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('开始修改实名信息:', { userId, name: name.substring(0, 1) + '**', idCard: idCard.substring(0, 6) + '********' + idCard.slice(-4) });
    
    // 调用身份证二要素认证API
    const apiUrl = `https://api-integrations.appmiaoda.com/app-883oyd7kz475/api-AalZ7kOrgk8L/idcard`;
    console.log('API请求URL:', apiUrl);
    console.log('请求参数:', { name: name.substring(0, 1) + '**', idcard: idCard.substring(0, 6) + '********' + idCard.slice(-4) });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': import.meta.env.VITE_APP_ID,
      },
      body: JSON.stringify({
        name: name,
        idcard: idCard,
      }),
    });

    console.log('API响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API请求失败，响应内容:', errorText);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API响应结果:', result);

    // 检查API响应
    if (result.showapi_res_code !== 0) {
      console.error('API返回错误:', result.showapi_res_error);
      throw new Error(result.showapi_res_error || 'API返回错误');
    }

    const body = result.showapi_res_body;
    console.log('API响应body:', body);

    // code: 0=匹配，1=不匹配，2=无此身份证号码
    if (body.code === 0) {
      // 认证成功，更新数据库
      console.log('身份验证成功，更新数据库...');
      const idCardLast4 = idCard.slice(-4);
      const { error } = await supabase
        .from('profiles')
        .update({
          real_name: name,
          id_card_last4: idCardLast4,
          id_card_number: idCard, // 保存完整身份证号码（仅超管可查看）
          is_real_verified: true,
        })
        .eq('id', userId);

      if (error) {
        console.error('数据库更新失败:', error);
        throw error;
      }

      // 获取用户信息
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('username, user_id')
        .eq('id', userId)
        .maybeSingle();

      // 通知所有管理员（包括超管）
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, username')
        .or('role.eq.admin,is_super_admin.eq.true');

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'real_name_update',
          title: '实名信息更新通知',
          content: `用户 ${userProfile?.username || '未知用户'}（ID: ${userProfile?.user_id || 'N/A'}）修改了实名认证信息，请及时查看。`,
          link: `/admin`,
        }));

        await supabase
          .from('notifications')
          .insert(notifications);
      }

      console.log('实名信息修改成功');
      return { success: true, message: '实名信息修改成功，已通知管理员审核' };
    } else if (body.code === 1) {
      console.log('姓名与身份证号不匹配');
      return { success: false, message: '姓名与身份证号不匹配' };
    } else if (body.code === 2) {
      console.log('无此身份证号码');
      return { success: false, message: '无此身份证号码' };
    } else {
      console.log('认证失败:', body.msg);
      return { success: false, message: body.msg || '认证失败' };
    }
  } catch (error) {
    console.error('修改实名信息错误:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '修改过程出错，请稍后重试',
    };
  }
}

// ==================== Avatar Upload ====================

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  // 删除旧头像
  await supabase.storage
    .from('app-883oyd7kz475_avatars')
    .remove([fileName]);

  // 上传新头像
  const { error: uploadError } = await supabase.storage
    .from('app-883oyd7kz475_avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // 获取公开URL
  const { data } = supabase.storage
    .from('app-883oyd7kz475_avatars')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function updateAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) throw error;
}

// ==================== Posts ====================

export async function getPosts(limit = 20, offset = 0): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function searchPosts(query: string, limit = 20): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getPost(postId: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .eq('id', postId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createPost(title: string, content: string, authorId: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({ title, content, author_id: authorId })
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(postId: string, updates: { title?: string; content?: string }): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

export async function incrementPostViewCount(postId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_post_view_count', { post_id: postId });
  
  // 如果RPC不存在，使用备用方法
  if (error) {
    const { data: post } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', postId)
      .maybeSingle();
    
    if (post) {
      await supabase
        .from('posts')
        .update({ view_count: post.view_count + 1 })
        .eq('id', postId);
    }
  }
}

// 获取用户发布的帖子
export async function getUserPosts(userId: string, limit = 20, offset = 0): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取用户统计信息
export async function getUserStats(userId: string): Promise<{ postCount: number; commentCount: number }> {
  const [postsResult, commentsResult] = await Promise.all([
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId),
    supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId),
  ]);

  return {
    postCount: postsResult.count || 0,
    commentCount: commentsResult.count || 0,
  };
}

// ==================== Comments ====================

export async function getComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createComment(postId: string, content: string, authorId: string): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, content, author_id: authorId })
    .select(`
      *,
      author:profiles!comments_author_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

// ==================== Chat Messages ====================

export async function getChatMessages(limit = 100): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      author:profiles!chat_messages_author_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  // 确保作者的 titles 字段始终是数组
  const messages = Array.isArray(data) ? data.map(msg => ({
    ...msg,
    author: {
      ...msg.author,
      titles: Array.isArray(msg.author?.titles) ? msg.author.titles : []
    }
  })) : [];
  
  return messages.reverse();
}

export async function createChatMessage(content: string, authorId: string): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ content, author_id: authorId })
    .select(`
      *,
      author:profiles!chat_messages_author_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  
  // 确保作者的 titles 字段始终是数组
  return {
    ...data,
    author: {
      ...data.author,
      titles: Array.isArray(data.author?.titles) ? data.author.titles : []
    }
  };
}

export async function deleteChatMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
}

export async function getChatMessage(messageId: string): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      author:profiles!chat_messages_author_id_fkey(*)
    `)
    .eq('id', messageId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ==================== Notifications ====================

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  content: string,
  link?: string
): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, title, content, link: link || null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}

// ==================== 入驻申请 ====================

/**
 * 获取所有管理员（包括超级管理员）
 */
export async function getAllAdmins(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or('role.eq.admin,is_super_admin.eq.true');

  if (error) {
    console.error('获取管理员列表失败:', error);
    throw error;
  }
  
  console.log('获取到的管理员列表:', data);
  return Array.isArray(data) ? data : [];
}

/**
 * 申请入驻本站
 * 向所有管理员发送通知
 */
export async function applyForSettlement(userId: string, username: string): Promise<void> {
  console.log('开始申请入驻，用户ID:', userId, '用户名:', username);
  
  // 获取所有管理员
  const admins = await getAllAdmins();
  
  console.log('管理员数量:', admins.length);
  
  if (admins.length === 0) {
    throw new Error('系统中没有管理员，无法处理入驻申请');
  }

  // 向每个管理员发送通知
  const notifications = admins.map(admin => ({
    user_id: admin.id,
    type: 'settlement_application',
    title: '新的入驻申请',
    content: `用户 ${username}（ID: ${userId}）申请入驻本站，请及时处理。`,
    link: `/user/${userId}`,
  }));

  console.log('准备插入的通知:', notifications);

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('插入通知失败:', error);
    throw error;
  }
  
  console.log('申请入驻成功，已发送通知给所有管理员');
}

// ==================== Reports ====================

// 创建举报
export async function createReport(
  reporterId: string,
  reportType: ReportType,
  targetId: string,
  reason: string
): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      report_type: reportType,
      target_id: targetId,
      reason,
      status: 'pending'
    })
    .select()
    .single(); // 使用 single 因为我们期望返回一条记录

  if (error) {
    console.error('创建举报失败，详细错误:', error);
    throw error;
  }
  if (!data) throw new Error('创建举报失败：未返回数据');
  return data;
}

// 获取所有举报（管理员）
export async function getAllReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(*),
      handler:profiles!reports_handled_by_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取用户自己的举报
export async function getUserReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(*),
      handler:profiles!reports_handled_by_fkey(*)
    `)
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取待处理举报数量
export async function getPendingReportsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) throw error;
  return count || 0;
}

// 处理举报
export async function handleReport(
  reportId: string,
  handlerId: string,
  status: ReportStatus,
  adminNote?: string
): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .update({
      status: status,
      handled_by: handlerId,
      handled_at: new Date().toISOString(),
      admin_note: adminNote || null
    })
    .eq('id', reportId)
    .select()
    .single(); // 使用 single 因为我们期望返回一条记录

  if (error) {
    console.error('更新举报状态失败，详细错误:', error);
    throw error;
  }
  if (!data) throw new Error('更新举报状态失败：未返回数据');
  return data;
}

// 获取举报详情
export async function getReportById(reportId: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(*),
      handler:profiles!reports_handled_by_fkey(*)
    `)
    .eq('id', reportId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 检查是否已举报过
export async function checkIfAlreadyReported(
  reporterId: string,
  reportType: ReportType,
  targetId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', reporterId)
    .eq('report_type', reportType)
    .eq('target_id', targetId)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) {
    console.error('检查举报记录失败，详细错误:', error);
    throw error;
  }
  return !!data;
}

// ==================== 人脸识别相关 ====================

// 更新用户人脸信息
export async function updateUserFace(
  userId: string,
  faceToken: string
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      face_token: faceToken,
      face_registered: true,
    })
    .eq('id', userId);

  if (error) throw error;
}

// 删除用户人脸信息
export async function deleteUserFace(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      face_token: null,
      face_registered: false,
    })
    .eq('id', userId);

  if (error) throw error;
}

// 通过手机号查找用户
export async function getProfileByPhone(phone: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (error) throw error;
  
  if (data) {
    return {
      ...data,
      titles: Array.isArray(data.titles) ? data.titles : []
    };
  }
  
  return data;
}

// ==================== Channels ====================

// 获取所有活跃频道（用于首页显示，包含管理员频道和用户频道）
export async function getAllChannels(page: number = 1, limit: number = 10, search: string = '') {
  try {
    // 只从channels表查询所有频道（包括管理员创建的和用户创建的）
    let query = supabase
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

    if (error) throw error;

    // 统一格式化数据
    const formattedData = (data || []).map((ch: any) => {
      // 判断频道来源：根据is_admin_channel字段判断
      const isAdminChannel = ch.is_admin_channel === true;
      
      return {
        id: ch.id,
        stream_id: ch.stream_id,
        name: ch.name,
        description: ch.description,
        cover_image: ch.cover_image,
        m3u8_url: ch.m3u8_url, // 自定义m3u8链接
        channel_url: ch.channel_url,
        like_count: ch.like_count || 0,
        is_active: ch.is_active,
        is_live: ch.is_live,
        is_admin_channel: ch.is_admin_channel,
        created_at: ch.created_at,
        created_by: ch.created_by,
        user_id: ch.user_id,
        creator: ch.creator,
        owner: ch.owner,
        source: isAdminChannel ? 'admin' as const : 'user' as const,
      };
    });

    return { 
      data: formattedData, 
      count: count || 0
    };
  } catch (error) {
    console.error('getAllChannels查询错误:', error);
    throw error;
  }
}

// 管理后台专用：获取所有频道（包括禁用的，只从channels表查询）
export async function getAllChannelsForAdmin(page: number = 1, limit: number = 10, search: string = '') {
  try {
    // 只从channels表查询所有频道（包括禁用的）
    let query = supabase
      .from('channels')
      .select(`
        *,
        creator:profiles!created_by(id, username, role, is_super_admin, avatar_url),
        owner:profiles!user_id(id, username, avatar_url, role)
      `, { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,stream_id.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // 统一格式化数据
    const formattedData = (data || []).map((ch: any) => {
      // 判断频道来源：根据is_admin_channel字段判断
      const isAdminChannel = ch.is_admin_channel === true;
      
      return {
        id: ch.id,
        stream_id: ch.stream_id,
        name: ch.name,
        description: ch.description,
        cover_image: ch.cover_image,
        m3u8_url: ch.m3u8_url, // 自定义m3u8链接
        channel_url: ch.channel_url,
        like_count: ch.like_count || 0,
        is_active: ch.is_active,
        is_live: ch.is_live,
        is_admin_channel: ch.is_admin_channel,
        created_at: ch.created_at,
        created_by: ch.created_by,
        user_id: ch.user_id,
        creator: ch.creator,
        owner: ch.owner,
        source: isAdminChannel ? 'admin' as const : 'user' as const,
      };
    });

    return { 
      data: formattedData, 
      count: count || 0
    };
  } catch (error) {
    console.error('getAllChannelsForAdmin查询错误:', error);
    throw error;
  }
}

export async function getStreamerChannels(page: number = 1, limit: number = 10, search: string = '') {
  let query = supabase
    .from('profiles')
    .select('id, username, stream_id, channel_name, channel_description, channel_logo, avatar_url, created_at', { count: 'exact' })
    .eq('is_streamer', true)
    .not('stream_id', 'is', null);

  if (search) {
    query = query.or(`channel_name.ilike.%${search}%,channel_description.ilike.%${search}%,username.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

export async function createChannel(channel: {
  stream_id?: string; // 推流ID可选（使用自定义m3u8链接时可以不填）
  channel_name: string;
  channel_description?: string;
  channel_logo?: string;
  m3u8_url?: string | null; // 自定义m3u8链接
  channel_url?: string; // 自定义频道URL
}) {
  console.log('创建频道，输入参数:', channel);
  
  // 生成或验证频道URL
  let url = channel.channel_url?.trim();
  if (!url) {
    url = generateChannelUrl();
    while (await checkChannelUrlExists(url)) {
      url = generateChannelUrl();
    }
  } else {
    // 验证用户输入的URL
    if (url.length < 3 || url.length > 20) {
      throw new Error('频道URL长度应在3-20个字符之间');
    }
    if (!/^[a-z0-9_-]+$/.test(url)) {
      throw new Error('频道URL只能包含小写字母、数字、下划线和连字符');
    }
    if (await checkChannelUrlExists(url)) {
      throw new Error('该频道URL已被使用，请选择其他URL');
    }
  }
  
  const insertData = {
    stream_id: channel.stream_id?.trim() || null, // 空字符串转为null
    name: channel.channel_name,
    description: channel.channel_description || null,
    cover_image: channel.channel_logo || null,
    m3u8_url: channel.m3u8_url?.trim() || null, // 空字符串转为null
    channel_url: url,
    like_count: 0,
    is_admin_channel: true,
    is_active: true,
    created_by: (await supabase.auth.getUser()).data.user?.id
  };
  
  console.log('插入数据库的数据:', insertData);
  
  const { data, error } = await supabase
    .from('channels')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('创建频道失败:', error);
    throw error;
  }
  
  console.log('创建频道成功:', data);
  return data;
}

export async function updateChannel(id: string, updates: Partial<{
  stream_id: string | null; // 推流ID可选
  channel_name: string;
  channel_description: string;
  channel_logo: string;
  m3u8_url: string | null; // 自定义m3u8链接
  is_active: boolean;
  is_admin_channel: boolean;
  is_live: boolean;
}>) {
  // 字段映射：前端字段名 -> 数据库字段名
  const dbUpdates: any = {};
  
  if (updates.stream_id !== undefined) dbUpdates.stream_id = updates.stream_id?.trim() || null; // 空字符串转为null
  if (updates.channel_name !== undefined) dbUpdates.name = updates.channel_name;
  if (updates.channel_description !== undefined) dbUpdates.description = updates.channel_description;
  if (updates.channel_logo !== undefined) dbUpdates.cover_image = updates.channel_logo;
  if (updates.m3u8_url !== undefined) dbUpdates.m3u8_url = updates.m3u8_url?.trim() || null; // 空字符串转为null
  if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
  if (updates.is_admin_channel !== undefined) dbUpdates.is_admin_channel = updates.is_admin_channel;
  if (updates.is_live !== undefined) dbUpdates.is_live = updates.is_live;

  const { data, error } = await supabase
    .from('channels')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChannel(id: string) {
  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 上传频道台标
export async function uploadChannelLogo(channelId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${channelId}_${Date.now()}.${fileExt}`;

  // 上传台标
  const { error: uploadError } = await supabase.storage
    .from('channel-logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // 获取公开URL
  const { data } = supabase.storage
    .from('channel-logos')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// ==================== Announcements ====================

export async function getActiveAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAnnouncement(announcement: {
  title: string;
  content: string;
  image_url?: string;
  display_order?: number;
}) {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      ...announcement,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAnnouncement(id: string, updates: Partial<{
  title: string;
  content: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}>) {
  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==================== Storage ====================

// ==================== 频道管理 API（多频道支持）====================

/**
 * 获取用户的所有频道（根据user_id或created_by）
 */
export async function getChannelsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .or(`user_id.eq.${userId},created_by.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * 获取所有活跃频道（用于主页展示）
 */
export async function getAllActiveChannels() {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * 获取单个频道详情
 */
export async function getChannelById(channelId: string) {
  const { data, error } = await supabase
    .from('channels')
    .select(`
      *,
      user_profile:profiles!channels_user_id_fkey(username, avatar_url, is_verified),
      created_by_profile:profiles!channels_created_by_fkey(username, avatar_url, is_verified)
    `)
    .eq('id', channelId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * 创建新频道
 */
export async function createNewChannel(channelData: {
  name: string;
  description?: string;
  stream_id: string;
  cover_image?: string;
  channel_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  let channelUrl: string;
  let attempts = 0;
  const maxAttempts = 10;

  // 验证用户提供的URL格式
  const isValidUrl = (url: string): boolean => {
    // 允许大小写字母、数字，长度8-16位
    const pattern = /^[a-zA-Z0-9]{8,16}$/;
    return pattern.test(url);
  };

  // 如果用户提供了URL且格式正确
  if (channelData.channel_url && isValidUrl(channelData.channel_url)) {
    const urlExists = await checkChannelUrlExists(channelData.channel_url);
    if (urlExists) {
      throw new Error('该频道URL已被使用，请选择其他URL');
    }
    channelUrl = channelData.channel_url;
    console.log('创建频道，使用用户提供的URL:', channelUrl);
  } else {
    // 自动生成URL
    do {
      channelUrl = generateChannelUrl();
      attempts++;
    } while (await checkChannelUrlExists(channelUrl) && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      throw new Error('无法生成唯一的频道URL，请稍后重试');
    }
    
    console.log('创建频道，自动生成URL:', channelUrl);
  }

  const { data, error } = await supabase
    .from('channels')
    .insert({
      ...channelData,
      channel_url: channelUrl,
      user_id: user.id,
      created_by: user.id,
      is_active: true,
      is_live: false,
      like_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 更新频道信息
 */
export async function updateChannelInfo(channelId: string, updates: {
  name?: string;
  description?: string;
  stream_id?: string;
  cover_image?: string;
  is_live?: boolean;
  channel_url?: string;
}) {
  // 如果更新了URL，先验证格式和唯一性
  if (updates.channel_url) {
    const isValidUrl = (url: string): boolean => {
      const pattern = /^[a-zA-Z0-9]{8,16}$/;
      return pattern.test(url);
    };

    if (!isValidUrl(updates.channel_url)) {
      throw new Error('频道URL格式不正确，必须是8-16位字母数字组合');
    }

    const urlExists = await checkChannelUrlExists(updates.channel_url);
    if (urlExists) {
      throw new Error('该频道URL已被使用，请选择其他URL');
    }
  }

  const { error } = await supabase
    .from('channels')
    .update(updates)
    .eq('id', channelId);

  if (error) throw error;
}

/**
 * 删除频道
 */
export async function deleteUserChannel(channelId: string) {
  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('id', channelId);

  if (error) throw error;
}

/**
 * 更新频道直播状态
 */
export async function updateChannelLiveStatus(channelId: string, isLive: boolean) {
  const { error } = await supabase
    .from('channels')
    .update({ is_live: isLive })
    .eq('id', channelId);

  if (error) throw error;
}

// 生成随机频道URL
function generateChannelUrl(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8 + Math.floor(Math.random() * 9); // 8-16位
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 检查频道URL是否已存在
export async function checkChannelUrlExists(url: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('channels')
    .select('id')
    .eq('channel_url', url)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// 频道存在性预检查（支持ID或URL）
export async function checkChannelExists(identifier: string): Promise<boolean> {
  // 先尝试通过 channel_url 查找
  let { data, error } = await supabase
    .from('channels')
    .select('id')
    .eq('channel_url', identifier)
    .maybeSingle();

  // 如果没找到，尝试通过 id 查找
  if (!data && !error) {
    const result = await supabase
      .from('channels')
      .select('id')
      .eq('id', identifier)
      .maybeSingle();
    data = result.data;
  }

  if (error) throw error;
  return !!data;
}

// 通过频道URL或ID获取频道
export async function getChannelByUrl(channelUrl: string): Promise<Channel | null> {
  // 先尝试通过 channel_url 查找
  let { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('channel_url', channelUrl)
    .maybeSingle();

  // 如果没找到，尝试通过 id 查找（兼容旧数据）
  if (!data && !error) {
    const result = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelUrl)
      .maybeSingle();
    data = result.data;
    error = result.error;
  }

  if (error) throw error;
  return data;
}

// 为现有频道添加随机URL
export async function addChannelUrlToExistingChannels() {
  // 先获取所有频道
  const { data: allChannels } = await supabase
    .from('channels')
    .select('id, channel_url');

  console.log('addChannelUrlToExistingChannels 所有频道:', allChannels);

  // 过滤出没有有效channel_url的频道
  const channelsWithoutUrl = allChannels?.filter((ch: any) => !ch.channel_url) || [];

  console.log('addChannelUrlToExistingChannels 没有URL的频道:', channelsWithoutUrl);

  if (channelsWithoutUrl.length > 0) {
    for (const channel of channelsWithoutUrl) {
      let url = generateChannelUrl();
      while (await checkChannelUrlExists(url)) {
        url = generateChannelUrl();
      }
      await supabase
        .from('channels')
        .update({ channel_url: url, like_count: 0 })
        .eq('id', channel.id);
      console.log(`为频道 ${channel.id} 生成了URL: ${url}`);
    }
  }
}

// 点赞频道
export async function likeChannel(channelId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  // 检查是否已经点赞
  const { data: existingLike } = await supabase
    .from('channel_likes')
    .select('id')
    .eq('channel_id', channelId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingLike) throw new Error('已经点赞过了');

  // 添加点赞记录
  const { error: insertError } = await supabase
    .from('channel_likes')
    .insert({
      channel_id: channelId,
      user_id: user.id,
    });

  if (insertError) throw insertError;

  // 增加点赞数
  const { error: updateError } = await supabase.rpc('increment_channel_likes', { channel_id: channelId });
  if (updateError) {
    // 如果RPC不存在，使用备用方法
    const { data: channel } = await supabase
      .from('channels')
      .select('like_count')
      .eq('id', channelId)
      .maybeSingle();
    
    if (channel) {
      await supabase
        .from('channels')
        .update({ like_count: (channel.like_count || 0) + 1 })
        .eq('id', channelId);
    }
  }
}

// 取消点赞
export async function unlikeChannel(channelId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  // 删除点赞记录
  const { error: deleteError } = await supabase
    .from('channel_likes')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', user.id);

  if (deleteError) throw deleteError;

  // 减少点赞数
  const { error: updateError } = await supabase.rpc('decrement_channel_likes', { channel_id: channelId });
  if (updateError) {
    // 如果RPC不存在，使用备用方法
    const { data: channel } = await supabase
      .from('channels')
      .select('like_count')
      .eq('id', channelId)
      .maybeSingle();
    
    if (channel) {
      await supabase
        .from('channels')
        .update({ like_count: Math.max(0, (channel.like_count || 0) - 1) })
        .eq('id', channelId);
    }
  }
}

// 检查用户是否已点赞频道
export async function checkUserLikedChannel(channelId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('channel_likes')
    .select('id')
    .eq('channel_id', channelId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// ==================== 频道聊天 API ====================

/**
 * 获取频道聊天消息
 */
export async function getChannelMessages(channelId: string, limit = 100) {
  const { data, error } = await supabase
    .from('channel_messages')
    .select(`
      *,
      profiles(username, avatar_url, is_verified, is_real_verified, titles)
    `)
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).reverse();
}

/**
 * 发送频道聊天消息
 */
export async function sendChannelMessage(channelId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { data, error } = await supabase
    .from('channel_messages')
    .insert({
      channel_id: channelId,
      user_id: user.id,
      content,
    })
    .select(`
      *,
      profiles(username, avatar_url, is_verified, is_real_verified, titles)
    `)
    .single();

  if (error) throw error;
  return data;
}

// ==================== 直播互动 API ====================

/**
 * 获取频道的所有互动
 */
export async function getChannelInteractions(channelId: string) {
  const { data, error } = await supabase
    .from('live_interactions')
    .select(`
      *,
      profiles(username, avatar_url)
    `)
    .eq('channel_id', channelId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * 创建互动（公告/投票/抽奖）
 */
export async function createInteraction(interactionData: {
  channel_id: string;
  type: 'announcement' | 'poll' | 'lottery';
  title: string;
  content: any;
  expires_at?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { data, error } = await supabase
    .from('live_interactions')
    .insert({
      ...interactionData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 更新互动
 */
export async function updateInteraction(interactionId: string, updates: {
  title?: string;
  content?: any;
  is_active?: boolean;
  expires_at?: string;
}) {
  const { error } = await supabase
    .from('live_interactions')
    .update(updates)
    .eq('id', interactionId);

  if (error) throw error;
}

/**
 * 删除互动
 */
export async function deleteInteraction(interactionId: string) {
  const { error } = await supabase
    .from('live_interactions')
    .delete()
    .eq('id', interactionId);

  if (error) throw error;
}

/**
 * 参与投票
 */
export async function votePoll(interactionId: string, optionIndex: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { error } = await supabase
    .from('poll_votes')
    .insert({
      interaction_id: interactionId,
      user_id: user.id,
      option_index: optionIndex,
    });

  if (error) throw error;
}

/**
 * 获取投票结果
 */
export async function getPollResults(interactionId: string) {
  const { data, error } = await supabase
    .from('poll_votes')
    .select('option_index')
    .eq('interaction_id', interactionId);

  if (error) throw error;
  return data || [];
}

/**
 * 参与抽奖
 */
export async function participateLottery(interactionId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { error } = await supabase
    .from('lottery_participants')
    .insert({
      interaction_id: interactionId,
      user_id: user.id,
    });

  if (error) throw error;
}

/**
 * 获取抽奖参与者
 */
export async function getLotteryParticipants(interactionId: string) {
  const { data, error } = await supabase
    .from('lottery_participants')
    .select(`
      *,
      profiles(username, avatar_url)
    `)
    .eq('interaction_id', interactionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * 设置抽奖中奖者
 */
export async function setLotteryWinners(interactionId: string, winnerIds: string[]) {
  // 先重置所有参与者的中奖状态
  await supabase
    .from('lottery_participants')
    .update({ is_winner: false })
    .eq('interaction_id', interactionId);

  // 设置中奖者
  const { error } = await supabase
    .from('lottery_participants')
    .update({ is_winner: true })
    .eq('interaction_id', interactionId)
    .in('id', winnerIds);

  if (error) throw error;
}

/**
 * 注销用户账号（删除所有相关数据）
 */
export async function deleteUserAccount(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    throw new Error('无权限执行此操作');
  }

  // 删除用户的所有数据（通过数据库级联删除）
  // 1. 删除profiles记录（会级联删除相关数据）
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) throw profileError;

  // 2. 删除auth用户
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
  if (authError) {
    // 如果auth删除失败，尝试通过RPC删除
    console.warn('Auth删除失败，尝试通过RPC删除:', authError);
  }

  return true;
}

// ==================== 弹窗公告管理 ====================

// 获取所有弹窗公告（管理员）
export async function getAllPopupAnnouncements() {
  const { data, error } = await supabase
    .from('popup_announcements')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取激活的弹窗公告（用户）
export async function getActivePopupAnnouncements() {
  const { data, error } = await supabase
    .from('popup_announcements')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 创建弹窗公告
export async function createPopupAnnouncement(announcement: {
  title: string;
  content: string;
  is_active?: boolean;
  priority?: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('popup_announcements')
    .insert({
      ...announcement,
      created_by: user?.id || null,
      is_active: announcement.is_active ?? true,
      priority: announcement.priority ?? 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 更新弹窗公告
export async function updatePopupAnnouncement(
  id: string,
  updates: {
    title?: string;
    content?: string;
    is_active?: boolean;
    priority?: number;
  }
) {
  const { data, error } = await supabase
    .from('popup_announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 删除弹窗公告
export async function deletePopupAnnouncement(id: string) {
  const { error } = await supabase
    .from('popup_announcements')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 切换弹窗公告激活状态
export async function togglePopupAnnouncementStatus(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('popup_announcements')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================== User Location ====================

/**
 * 更新用户位置信息
 * @param userId 用户ID
 * @param city 城市名称
 * @param ipAddress IP地址
 */
export async function updateUserLocation(
  userId: string,
  city: string,
  ipAddress: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('更新用户位置信息:', { userId, city, ipAddress });

    const { error } = await supabase
      .from('profiles')
      .update({
        city: city,
        ip_address: ipAddress,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('更新用户位置信息失败:', error);
      throw error;
    }

    console.log('用户位置信息更新成功');
    return { success: true, message: '位置信息更新成功' };
  } catch (error) {
    console.error('更新用户位置信息错误:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '更新位置信息失败',
    };
  }
}

// ==================== 订阅与钱包 ====================

// 获取用户钱包信息
export async function getWallet(userId: string) {
  const { data, error } = await supabase
    .from('wallet')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 获取钱包交易记录
export async function getWalletTransactions(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select(`
      *,
      related_user:profiles!wallet_transactions_related_user_id_fkey(id, username, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// 每日签到
export async function dailyCheckIn() {
  const { data, error } = await supabase.functions.invoke('daily_check_in', {
    method: 'POST',
  });

  if (error) throw error;
  return data;
}

// 检查今天是否已签到
export async function checkTodayCheckIn(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_check_in')
    .select('id')
    .eq('user_id', userId)
    .eq('check_in_date', today)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// 消耗幻梦币
export async function consumeCoins(amount: number, description: string) {
  const { data, error } = await supabase.functions.invoke('consume_coins', {
    method: 'POST',
    body: { amount, description },
  });

  if (error) throw error;
  return data;
}

// 打赏主播
export async function rewardStreamer(streamerId: string, amount: number, message?: string) {
  const { data, error } = await supabase.functions.invoke('reward_streamer', {
    method: 'POST',
    body: { streamer_id: streamerId, amount, message },
  });

  if (error) throw error;
  return data;
}

// 获取用户订阅信息
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 获取所有订阅记录
export async function getUserSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// 创建订阅订单
export async function createSubscriptionOrder(subscriptionType: 'monthly' | 'continuous_monthly') {
  const { data, error } = await supabase.functions.invoke('create_subscription_order', {
    method: 'POST',
    body: { subscription_type: subscriptionType },
  });

  if (error) throw error;
  return data;
}

// 创建幻梦币充值订单
export async function createCoinRechargeOrder(skuCode: string) {
  const { data, error } = await supabase.functions.invoke('create_coin_recharge_order', {
    method: 'POST',
    body: { sku_code: skuCode },
  });

  if (error) throw error;
  return data;
}

// 获取订单详情
export async function getOrder(orderNo: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        sku:sku(*)
      )
    `)
    .eq('order_no', orderNo)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 获取用户订单列表
export async function getUserOrders(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// 获取SKU列表
export async function getSKUs() {
  const { data, error } = await supabase
    .from('sku')
    .select('*')
    .order('price', { ascending: true });

  if (error) throw error;
  return data;
}

// 获取指定SKU
export async function getSKU(skuCode: string) {
  const { data, error } = await supabase
    .from('sku')
    .select('*')
    .eq('sku_code', skuCode)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ==================== AI Models ====================

export async function getAllAIModels() {
  const { data, error } = await supabase
    .from('ai_models')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getAllAIModelsForAdmin() {
  const { data, error } = await supabase
    .from('ai_models')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createAIModel(model: {
  model_name: string;
  display_name: string;
  description?: string;
  display_order?: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { data, error } = await supabase
    .from('ai_models')
    .insert({
      ...model,
      created_by: user.id,
      is_system: false,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSystemAIModel(model: {
  model_name: string;
  display_name: string;
  description?: string;
  display_order?: number;
}) {
  const { data, error } = await supabase
    .from('ai_models')
    .insert({
      ...model,
      created_by: null,
      is_system: true,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAIModel(
  id: string,
  updates: {
    model_name?: string;
    display_name?: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
  }
) {
  const { data, error } = await supabase
    .from('ai_models')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAIModel(id: string) {
  const { error } = await supabase
    .from('ai_models')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==================== 实名认证 ====================

// 调用身份证二要素认证API
export async function verifyIdCard(idcard: string, name: string, userId: string) {
  const { data, error } = await supabase.functions.invoke('verify-idcard', {
    body: { idcard, name, userId }
  });

  if (error) throw error;
  return data;
}

// 获取用户实名信息（根据权限返回不同内容）
export async function getUserVerificationInfo(userId: string, viewerId: string) {
  // 获取查看者的信息
  const { data: viewer } = await supabase
    .from('profiles')
    .select('role, numeric_id')
    .eq('id', viewerId)
    .maybeSingle();

  // 获取目标用户的实名信息，同时检查is_verified和is_real_verified
  const { data: user, error } = await supabase
    .from('profiles')
    .select('real_name, id_card, is_verified, is_real_verified, numeric_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!user) return null;

  // 根据权限返回不同内容
  const isAdmin = viewer?.role === 'admin';
  const isSelf = viewerId === userId;

  // 兼容旧字段：is_verified或is_real_verified任一为true即视为已认证
  const isVerified = user.is_verified || user.is_real_verified || false;

  return {
    is_verified: isVerified,
    real_name: user.real_name 
      ? (isAdmin || isSelf ? user.real_name : maskName(user.real_name))
      : null,
    id_card: isAdmin ? user.id_card : null, // 只有管理员可以看到身份证号
    numeric_id: user.numeric_id
  };
}

// 姓名打码函数
function maskName(name: string): string {
  if (!name || name.length < 2) return name;
  // 保留姓氏，其他字符用*替换
  return name.charAt(0) + '*'.repeat(name.length - 1);
}

// 获取所有已实名用户列表（管理员专用）
export async function getVerifiedUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, numeric_id, username, real_name, is_verified, created_at')
    .eq('is_verified', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// 更新实名信息（用户修改实名信息）
export async function updateVerificationInfo(userId: string, realName: string, idCard: string) {
  // 先调用认证API验证
  const verifyResult = await verifyIdCard(idCard, realName, userId);
  
  if (!verifyResult.success) {
    throw new Error(verifyResult.error || '实名认证失败');
  }

  return verifyResult;
}

// ==================== 放送广场 (localStorage 实现) ====================

const BROADCAST_STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB
const BROADCAST_PAGES_KEY = 'broadcast_pages';
const BROADCAST_FILES_KEY = 'broadcast_files';

interface LocalBroadcastPage {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  title: string;
  description: string | null;
  html_content: string;
  cover_image: string | null;
  is_public: boolean;
  view_count: number;
  storage_used: number;
  created_at: string;
  updated_at: string;
}

interface LocalBroadcastFile {
  id: string;
  page_id: string;
  filename: string;
  file_data: string; // base64
  file_size: number;
  file_type: string;
  created_at: string;
}

function generateId(): string {
  return 'bp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getBroadcastPages(): LocalBroadcastPage[] {
  try {
    const data = localStorage.getItem(BROADCAST_PAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveBroadcastPages(pages: LocalBroadcastPage[]): void {
  localStorage.setItem(BROADCAST_PAGES_KEY, JSON.stringify(pages));
}

function getStoredBroadcastFiles(): LocalBroadcastFile[] {
  try {
    const data = localStorage.getItem(BROADCAST_FILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveBroadcastFiles(files: LocalBroadcastFile[]): void {
  localStorage.setItem(BROADCAST_FILES_KEY, JSON.stringify(files));
}

// 获取所有公开的放送页面
export async function getPublicBroadcastPages(page: number = 1, limit: number = 12, search: string = '') {
  const allPages = getBroadcastPages();
  let filtered = allPages.filter(p => p.is_public);
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchLower) || 
      (p.description && p.description.toLowerCase().includes(searchLower))
    );
  }
  
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const start = (page - 1) * limit;
  const paginatedData = filtered.slice(start, start + limit);
  
  return { 
    data: paginatedData.map(p => ({
      ...p,
      profiles: {
        id: p.user_id,
        username: p.username,
        avatar_url: p.avatar_url,
        is_verified: false,
        is_real_verified: false
      }
    })), 
    count: filtered.length 
  };
}

// 获取用户的放送页面
export async function getUserBroadcastPages(userId: string) {
  const allPages = getBroadcastPages();
  return allPages
    .filter(p => p.user_id === userId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

// 获取单个放送页面
export async function getBroadcastPage(pageId: string) {
  const allPages = getBroadcastPages();
  const page = allPages.find(p => p.id === pageId);
  
  if (!page) return null;
  
  return {
    ...page,
    profiles: {
      id: page.user_id,
      username: page.username,
      avatar_url: page.avatar_url,
      is_verified: false,
      is_real_verified: false
    }
  };
}

// 创建放送页面
export async function createBroadcastPage(pageData: {
  title: string;
  description?: string;
  html_content?: string;
  cover_image?: string;
  is_public?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  
  const newPage: LocalBroadcastPage = {
    id: generateId(),
    user_id: user.id,
    username: profile?.username || '用户',
    avatar_url: profile?.avatar_url || null,
    title: pageData.title,
    description: pageData.description || null,
    html_content: pageData.html_content || '',
    cover_image: pageData.cover_image || null,
    is_public: pageData.is_public ?? false,
    view_count: 0,
    storage_used: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  const allPages = getBroadcastPages();
  allPages.push(newPage);
  saveBroadcastPages(allPages);
  
  return newPage;
}

// 更新放送页面
export async function updateBroadcastPage(pageId: string, updates: {
  title?: string;
  description?: string;
  html_content?: string;
  cover_image?: string;
  is_public?: boolean;
}) {
  const allPages = getBroadcastPages();
  const index = allPages.findIndex(p => p.id === pageId);
  
  if (index === -1) throw new Error('页面不存在');
  
  allPages[index] = {
    ...allPages[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  saveBroadcastPages(allPages);
  return allPages[index];
}

// 删除放送页面
export async function deleteBroadcastPage(pageId: string) {
  const allPages = getBroadcastPages();
  const filtered = allPages.filter(p => p.id !== pageId);
  saveBroadcastPages(filtered);
  
  // 删除相关文件
  const allFiles = getStoredBroadcastFiles();
  const remainingFiles = allFiles.filter(f => f.page_id !== pageId);
  saveBroadcastFiles(remainingFiles);
}

// 增加页面浏览量
export async function incrementBroadcastPageView(pageId: string) {
  const allPages = getBroadcastPages();
  const index = allPages.findIndex(p => p.id === pageId);
  
  if (index !== -1) {
    allPages[index].view_count += 1;
    saveBroadcastPages(allPages);
  }
}

// 获取用户存储空间使用情况
export async function getUserStorageUsed(userId: string): Promise<number> {
  const allPages = getBroadcastPages();
  return allPages
    .filter(p => p.user_id === userId)
    .reduce((total, page) => total + (page.storage_used || 0), 0);
}

// 上传放送页面文件 (存储为 base64)
export async function uploadBroadcastFile(pageId: string, file: File): Promise<LocalBroadcastFile & { public_url: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');
  
  // 检查存储空间
  const currentStorage = await getUserStorageUsed(user.id);
  if (currentStorage + file.size > BROADCAST_STORAGE_LIMIT) {
    throw new Error('存储空间不足，最多可使用5MB');
  }
  
  // 转换为 base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  const newFile: LocalBroadcastFile = {
    id: generateId(),
    page_id: pageId,
    filename: file.name,
    file_data: base64,
    file_size: file.size,
    file_type: file.type,
    created_at: new Date().toISOString(),
  };
  
  const allFiles = getStoredBroadcastFiles();
  allFiles.push(newFile);
  saveBroadcastFiles(allFiles);
  
  // 更新页面存储使用量
  const allPages = getBroadcastPages();
  const pageIndex = allPages.findIndex(p => p.id === pageId);
  if (pageIndex !== -1) {
    allPages[pageIndex].storage_used += file.size;
    saveBroadcastPages(allPages);
  }
  
  return {
    ...newFile,
    public_url: base64,
  };
}

// 获取页面的所有文件
export async function getBroadcastFiles(pageId: string) {
  const allFiles = getStoredBroadcastFiles();
  return allFiles
    .filter(f => f.page_id === pageId)
    .map(f => ({
      ...f,
      public_url: f.file_data,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// 删除放送文件
export async function deleteBroadcastFile(fileId: string) {
  const allFiles = getStoredBroadcastFiles();
  const file = allFiles.find(f => f.id === fileId);
  
  if (!file) throw new Error('文件不存在');
  
  const remainingFiles = allFiles.filter(f => f.id !== fileId);
  saveBroadcastFiles(remainingFiles);
  
  // 更新页面存储使用量
  const allPages = getBroadcastPages();
  const pageIndex = allPages.findIndex(p => p.id === file.page_id);
  if (pageIndex !== -1) {
    allPages[pageIndex].storage_used = Math.max(0, allPages[pageIndex].storage_used - file.file_size);
    saveBroadcastPages(allPages);
  }
}

// 上传放送页面封面 (存储为 base64)
export async function uploadBroadcastCover(pageId: string, file: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  const allPages = getBroadcastPages();
  const index = allPages.findIndex(p => p.id === pageId);
  
  if (index !== -1) {
    allPages[index].cover_image = base64;
    allPages[index].updated_at = new Date().toISOString();
    saveBroadcastPages(allPages);
  }
  
  return base64;
}

