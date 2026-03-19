// HMNL直播讨论站 - AI模型API
// 提供AI模型的增删查功能

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

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin' || profile?.is_super_admin === true;

    const url = new URL(req.url);
    const pathParts = url.pathname.replace(/^\//, '').split('/').filter(Boolean);
    const method = req.method;

    // GET /ai-models - 获取AI模型列表
    if (method === 'GET' && pathParts.length === 0) {
      const activeOnly = url.searchParams.get('active') === 'true';

      let query = supabaseClient
        .from('ai_models')
        .select('*')
        .order('display_order', { ascending: true });

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

    // GET /ai-models/my - 获取用户的自定义模型
    if (method === 'GET' && pathParts[0] === 'my') {
      const { data, error } = await supabaseClient
        .from('ai_models')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_system', false)
        .order('created_at', { ascending: false });

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

    // POST /ai-models - 创建AI模型
    if (method === 'POST' && pathParts.length === 0) {
      const body = await req.json();
      const { model_name, display_name, description, supports_file_upload } = body;

      if (!model_name || !display_name) {
        return new Response(
          JSON.stringify({ error: '模型名称和外显名称不能为空' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('ai_models')
        .insert({
          model_name,
          display_name,
          description: description || null,
          is_active: true,
          is_system: isAdmin,
          supports_file_upload: supports_file_upload || false,
          display_order: 999,
          created_by: user.id
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

    // PUT /ai-models/:modelId - 更新AI模型
    if (method === 'PUT' && pathParts.length === 1) {
      const modelId = pathParts[0];

      const { data: model } = await supabaseClient
        .from('ai_models')
        .select('created_by, is_system')
        .eq('id', modelId)
        .maybeSingle();

      if (!model) {
        return new Response(
          JSON.stringify({ error: '模型不存在' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (model.created_by !== user.id && !isAdmin) {
        return new Response(
          JSON.stringify({ error: '无权限' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('ai_models')
        .update(body)
        .eq('id', modelId)
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

    // DELETE /ai-models/:modelId - 删除AI模型
    if (method === 'DELETE' && pathParts.length === 1) {
      const modelId = pathParts[0];

      const { data: model } = await supabaseClient
        .from('ai_models')
        .select('created_by, is_system')
        .eq('id', modelId)
        .maybeSingle();

      if (!model) {
        return new Response(
          JSON.stringify({ error: '模型不存在' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (model.is_system) {
        return new Response(
          JSON.stringify({ error: '系统模型不能删除' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (model.created_by !== user.id && !isAdmin) {
        return new Response(
          JSON.stringify({ error: '无权限' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseClient
        .from('ai_models')
        .delete()
        .eq('id', modelId);

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
    console.error('AI模型API错误:', error);
    return new Response(
      JSON.stringify({ error: error.message || '服务器内部错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
