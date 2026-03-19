// HMNL直播讨论站 - AI对话API
// 提供AI对话的增删查功能

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

    // GET /ai-conversations - 获取用户的对话列表
    if (method === 'GET' && pathParts.length === 0) {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const { data, error } = await supabaseClient
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

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

    // GET /ai-conversations/:conversationId - 获取对话详情
    if (method === 'GET' && pathParts.length === 1) {
      const conversationId = pathParts[0];

      const { data, error } = await supabaseClient
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: '对话不存在' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /ai-conversations/:conversationId/messages - 获取对话的消息
    if (method === 'GET' && pathParts.length === 2 && pathParts[1] === 'messages') {
      const conversationId = pathParts[0];

      const { data, error } = await supabaseClient
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

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

    // POST /ai-conversations - 创建新对话
    if (method === 'POST' && pathParts.length === 0) {
      const body = await req.json();
      const { title, model_name } = body;

      if (!model_name) {
        return new Response(
          JSON.stringify({ error: '模型名称不能为空' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: title || '新对话',
          model_name
        })
        .select()
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

    // PUT /ai-conversations/:conversationId - 更新对话
    if (method === 'PUT' && pathParts.length === 1) {
      const conversationId = pathParts[0];

      const { data: conversation } = await supabaseClient
        .from('ai_conversations')
        .select('user_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (!conversation) {
        return new Response(
          JSON.stringify({ error: '对话不存在' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (conversation.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: '无权限' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('ai_conversations')
        .update(body)
        .eq('id', conversationId)
        .select()
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

    // DELETE /ai-conversations/:conversationId - 删除对话
    if (method === 'DELETE' && pathParts.length === 1) {
      const conversationId = pathParts[0];

      const { data: conversation } = await supabaseClient
        .from('ai_conversations')
        .select('user_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (!conversation) {
        return new Response(
          JSON.stringify({ error: '对话不存在' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (conversation.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: '无权限' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseClient
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

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
    console.error('AI对话API错误:', error);
    return new Response(
      JSON.stringify({ error: error.message || '服务器内部错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
