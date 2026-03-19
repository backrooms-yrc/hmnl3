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

    // 检查今天是否已签到
    const today = new Date().toISOString().split('T')[0];
    const { data: existingCheckIn } = await supabaseAdmin
      .from('daily_check_in')
      .select('id')
      .eq('user_id', user.id)
      .eq('check_in_date', today)
      .single();

    if (existingCheckIn) {
      return new Response(
        JSON.stringify({ error: '今天已经签到过了' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 签到奖励（10幻梦币）
    const rewardAmount = 10;

    // 记录签到
    const { error: checkInError } = await supabaseAdmin
      .from('daily_check_in')
      .insert({
        user_id: user.id,
        check_in_date: today,
        reward_amount: rewardAmount
      });

    if (checkInError) {
      console.error('记录签到失败:', checkInError);
      return new Response(
        JSON.stringify({ error: '签到失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 增加幻梦币
    const { data: wallet, error: walletError } = await supabaseAdmin.rpc('update_wallet_balance', {
      p_user_id: user.id,
      p_amount: rewardAmount,
      p_type: 'sign_in',
      p_description: '每日签到奖励'
    });

    if (walletError) {
      console.error('更新钱包失败:', walletError);
      return new Response(
        JSON.stringify({ error: '签到失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 返回签到成功
    return new Response(
      JSON.stringify({ 
        success: true,
        reward_amount: rewardAmount,
        balance: wallet.balance
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('签到失败:', error);
    return new Response(
      JSON.stringify({ error: error.message || '签到失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});