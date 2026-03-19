// HMNL直播讨论站 - 直播互动API
// 提供直播互动（公告、投票、抽奖）的增删查功能

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

    // GET /live-interactions/:channelId - 获取频道的互动列表
    if (method === 'GET' && pathParts.length === 1) {
      const channelId = pathParts[0];
      const activeOnly = url.searchParams.get('active') === 'true';

      let query = supabaseClient
        .from('live_interactions')
        .select(`
          *,
          profiles(*)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: Array.isArray(data) ? data : [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /live-interactions - 创建互动
    if (method === 'POST' && pathParts.length === 0) {
      const body = await req.json();
      const { channel_id, type, title, content, expires_at } = body;

      if (!channel_id || !type || !title) {
        return new Response(
          JSON.stringify({ error: '频道ID、类型和标题不能为空' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('live_interactions')
        .insert({
          channel_id,
          user_id: user.id,
          type,
          title,
          content: content || {},
          is_active: true,
          expires_at: expires_at || null
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

    // PUT /live-interactions/:interactionId - 更新互动
    if (method === 'PUT' && pathParts.length === 1) {
      const interactionId = pathParts[0];

      const { data: interaction } = await supabaseClient
        .from('live_interactions')
        .select('user_id')
        .eq('id', interactionId)
        .maybeSingle();

      if (!interaction) {
        return new Response(
          JSON.stringify({ error: '互动不存在' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (interaction.user_id !== user.id) {
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

      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('live_interactions')
        .update(body)
        .eq('id', interactionId)
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
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /live-interactions/:interactionId - 删除互动
    if (method === 'DELETE' && pathParts.length === 1) {
      const interactionId = pathParts[0];

      const { data: interaction } = await supabaseClient
        .from('live_interactions')
        .select('user_id')
        .eq('id', interactionId)
        .maybeSingle();

      if (!interaction) {
        return new Response(
          JSON.stringify({ error: '互动不存在' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (interaction.user_id !== user.id) {
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
        .from('live_interactions')
        .delete()
        .eq('id', interactionId);

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
    console.error('直播互动API错误:', error);
    return new Response(
      JSON.stringify({ error: error.message || '服务器内部错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
