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
    const { amount, description } = await req.json();

    // 验证参数
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: '无效的消费金额' }),
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

    // 使用service_role客户端操作数据库
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 扣除幻梦币（负数表示消费）
    const { data: wallet, error: walletError } = await supabaseAdmin.rpc('update_wallet_balance', {
      p_user_id: user.id,
      p_amount: -amount,
      p_type: 'consume',
      p_description: description || '消费幻梦币'
    });

    if (walletError) {
      console.error('消费幻梦币失败:', walletError);
      
      // 检查是否是余额不足
      if (walletError.message && walletError.message.includes('余额不足')) {
        return new Response(
          JSON.stringify({ error: '幻梦币余额不足' }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: '消费失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 返回消费成功
    return new Response(
      JSON.stringify({ 
        success: true,
        balance: wallet.balance
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('消费幻梦币失败:', error);
    return new Response(
      JSON.stringify({ error: error.message || '消费失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});