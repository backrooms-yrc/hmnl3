import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // 处理CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // 获取请求数据
    const { streamer_id, amount, message } = await req.json();

    // 验证参数
    if (!streamer_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: '无效的打赏参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 获取用户信息
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: '未授权' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: '用户验证失败' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 不能打赏自己
    if (user.id === streamer_id) {
      return new Response(
        JSON.stringify({ error: '不能打赏自己' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 使用service_role客户端操作数据库
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 验证主播是否存在
    const { data: streamer, error: streamerError } = await supabaseAdmin
      .from('profiles')
      .select('id, username')
      .eq('id', streamer_id)
      .single();

    if (streamerError || !streamer) {
      return new Response(
        JSON.stringify({ error: '主播不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 扣除打赏者的幻梦币
    const description = message 
      ? `打赏${streamer.username}：${message}` 
      : `打赏${streamer.username}`;

    const { error: senderError } = await supabaseAdmin.rpc('update_wallet_balance', {
      p_user_id: user.id,
      p_amount: -amount,
      p_type: 'reward_send',
      p_description: description,
      p_related_user_id: streamer_id
    });

    if (senderError) {
      console.error('扣除打赏者幻梦币失败:', senderError);
      
      // 检查是否是余额不足
      if (senderError.message && senderError.message.includes('余额不足')) {
        return new Response(
          JSON.stringify({ error: '幻梦币余额不足' }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: '打赏失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 增加主播的幻梦币
    const { data: receiverWallet, error: receiverError } = await supabaseAdmin.rpc('update_wallet_balance', {
      p_user_id: streamer_id,
      p_amount: amount,
      p_type: 'reward_receive',
      p_description: `收到打赏`,
      p_related_user_id: user.id
    });

    if (receiverError) {
      console.error('增加主播幻梦币失败:', receiverError);
      
      // 回滚：退还打赏者的幻梦币
      await supabaseAdmin.rpc('update_wallet_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_type: 'refund',
        p_description: '打赏失败，退还幻梦币',
        p_related_user_id: streamer_id
      });
      
      return new Response(
        JSON.stringify({ error: '打赏失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 返回打赏成功
    return new Response(
      JSON.stringify({ 
        success: true,
        message: '打赏成功'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('打赏失败:', error);
    return new Response(
      JSON.stringify({ error: error.message || '打赏失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});