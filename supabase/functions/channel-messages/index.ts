// HMNL直播讨论站 - 频道聊天消息API
// 提供频道聊天消息的增删查功能

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: '未授权' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.replace(/^\//, '').split('/').filter(Boolean);
    const method = req.method;

    // GET /channel-messages/:channelId - 获取频道聊天消息
    if (method === 'GET' && pathParts.length === 1) {
      const channelId = pathParts[0];
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const { data, error } = await supabaseClient
        .from('channel_messages')
        .select(`
          *,
          profiles(*)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const messages = Array.isArray(data) ? data.reverse() : [];
      return new Response(
        JSON.stringify({ data: messages }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /channel-messages - 发送频道聊天消息
    if (method === 'POST' && pathParts.length === 0) {
      const body = await req.json();
      const { channel_id, content } = body;

      if (!channel_id || !content) {
        return new Response(
          JSON.stringify({ error: '频道ID和内容不能为空' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('channel_messages')
        .insert({
          channel_id,
          user_id: user.id,
          content
        })
        .select(`
          *,
          profiles(*)
        `)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /channel-messages/:messageId - 删除频道聊天消息
    if (method === 'DELETE' && pathParts.length === 1) {
      const messageId = pathParts[0];

      const { data: message } = await supabaseClient
        .from('channel_messages')
        .select('user_id')
        .eq('id', messageId)
        .maybeSingle();

      if (!message) {
        return new Response(
          JSON.stringify({ error: '消息不存在' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (message.user_id !== user.id) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, is_super_admin')
          .eq('id', user.id)
          .maybeSingle();

        const isAdmin = profile?.role === 'admin' || profile?.is_super_admin === true;
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: '无权限' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const { error } = await supabaseClient
        .from('channel_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: '删除成功' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: '不支持的操作' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('频道聊天消息API错误:', error);
    return new Response(
      JSON.stringify({ error: error.message || '服务器内部错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
