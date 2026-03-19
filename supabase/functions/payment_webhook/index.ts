import { createClient } from 'jsr:@supabase/supabase-js@2';

// 商户配置
const MERCHANT_ID = '10344';
const MERCHANT_KEY = 'Cib4YWCCwLTm4YcqhupP';

// 纯JavaScript实现的MD5算法
function md5(string: string): string {
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift));
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, q), addUnsigned(x, t)), s), b);
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function convertToWordArray(string: string): number[] {
    const wordArray: number[] = [];
    // 使用TextEncoder处理UTF-8编码
    const utf8Bytes = new TextEncoder().encode(string);
    for (let i = 0; i < utf8Bytes.length * 8; i += 8) {
      wordArray[i >> 5] |= (utf8Bytes[i / 8] & 0xFF) << (i % 32);
    }
    return wordArray;
  }

  function wordToHex(value: number): string {
    let hex = '';
    for (let i = 0; i < 4; i++) {
      hex += ((value >> (i * 8 + 4)) & 0x0F).toString(16) + ((value >> (i * 8)) & 0x0F).toString(16);
    }
    return hex;
  }

  const utf8Bytes = new TextEncoder().encode(string);
  const x = convertToWordArray(string);
  let a = 0x67452301;
  let b = 0xEFCDAB89;
  let c = 0x98BADCFE;
  let d = 0x10325476;

  x[utf8Bytes.length * 8 >> 5] |= 0x80 << (utf8Bytes.length * 8 % 32);
  x[(((utf8Bytes.length * 8 + 64) >>> 9) << 4) + 14] = utf8Bytes.length * 8;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, x[i + 0], 7, 0xD76AA478);
    d = md5ff(d, a, b, c, x[i + 1], 12, 0xE8C7B756);
    c = md5ff(c, d, a, b, x[i + 2], 17, 0x242070DB);
    b = md5ff(b, c, d, a, x[i + 3], 22, 0xC1BDCEEE);
    a = md5ff(a, b, c, d, x[i + 4], 7, 0xF57C0FAF);
    d = md5ff(d, a, b, c, x[i + 5], 12, 0x4787C62A);
    c = md5ff(c, d, a, b, x[i + 6], 17, 0xA8304613);
    b = md5ff(b, c, d, a, x[i + 7], 22, 0xFD469501);
    a = md5ff(a, b, c, d, x[i + 8], 7, 0x698098D8);
    d = md5ff(d, a, b, c, x[i + 9], 12, 0x8B44F7AF);
    c = md5ff(c, d, a, b, x[i + 10], 17, 0xFFFF5BB1);
    b = md5ff(b, c, d, a, x[i + 11], 22, 0x895CD7BE);
    a = md5ff(a, b, c, d, x[i + 12], 7, 0x6B901122);
    d = md5ff(d, a, b, c, x[i + 13], 12, 0xFD987193);
    c = md5ff(c, d, a, b, x[i + 14], 17, 0xA679438E);
    b = md5ff(b, c, d, a, x[i + 15], 22, 0x49B40821);

    a = md5gg(a, b, c, d, x[i + 1], 5, 0xF61E2562);
    d = md5gg(d, a, b, c, x[i + 6], 9, 0xC040B340);
    c = md5gg(c, d, a, b, x[i + 11], 14, 0x265E5A51);
    b = md5gg(b, c, d, a, x[i + 0], 20, 0xE9B6C7AA);
    a = md5gg(a, b, c, d, x[i + 5], 5, 0xD62F105D);
    d = md5gg(d, a, b, c, x[i + 10], 9, 0x02441453);
    c = md5gg(c, d, a, b, x[i + 15], 14, 0xD8A1E681);
    b = md5gg(b, c, d, a, x[i + 4], 20, 0xE7D3FBC8);
    a = md5gg(a, b, c, d, x[i + 9], 5, 0x21E1CDE6);
    d = md5gg(d, a, b, c, x[i + 14], 9, 0xC33707D6);
    c = md5gg(c, d, a, b, x[i + 3], 14, 0xF4D50D87);
    b = md5gg(b, c, d, a, x[i + 8], 20, 0x455A14ED);
    a = md5gg(a, b, c, d, x[i + 13], 5, 0xA9E3E905);
    d = md5gg(d, a, b, c, x[i + 2], 9, 0xFCEFA3F8);
    c = md5gg(c, d, a, b, x[i + 7], 14, 0x676F02D9);
    b = md5gg(b, c, d, a, x[i + 12], 20, 0x8D2A4C8A);

    a = md5hh(a, b, c, d, x[i + 5], 4, 0xFFFA3942);
    d = md5hh(d, a, b, c, x[i + 8], 11, 0x8771F681);
    c = md5hh(c, d, a, b, x[i + 11], 16, 0x6D9D6122);
    b = md5hh(b, c, d, a, x[i + 14], 23, 0xFDE5380C);
    a = md5hh(a, b, c, d, x[i + 1], 4, 0xA4BEEA44);
    d = md5hh(d, a, b, c, x[i + 4], 11, 0x4BDECFA9);
    c = md5hh(c, d, a, b, x[i + 7], 16, 0xF6BB4B60);
    b = md5hh(b, c, d, a, x[i + 10], 23, 0xBEBFBC70);
    a = md5hh(a, b, c, d, x[i + 13], 4, 0x289B7EC6);
    d = md5hh(d, a, b, c, x[i + 0], 11, 0xEAA127FA);
    c = md5hh(c, d, a, b, x[i + 3], 16, 0xD4EF3085);
    b = md5hh(b, c, d, a, x[i + 6], 23, 0x04881D05);
    a = md5hh(a, b, c, d, x[i + 9], 4, 0xD9D4D039);
    d = md5hh(d, a, b, c, x[i + 12], 11, 0xE6DB99E5);
    c = md5hh(c, d, a, b, x[i + 15], 16, 0x1FA27CF8);
    b = md5hh(b, c, d, a, x[i + 2], 23, 0xC4AC5665);

    a = md5ii(a, b, c, d, x[i + 0], 6, 0xF4292244);
    d = md5ii(d, a, b, c, x[i + 7], 10, 0x432AFF97);
    c = md5ii(c, d, a, b, x[i + 14], 15, 0xAB9423A7);
    b = md5ii(b, c, d, a, x[i + 5], 21, 0xFC93A039);
    a = md5ii(a, b, c, d, x[i + 12], 6, 0x655B59C3);
    d = md5ii(d, a, b, c, x[i + 3], 10, 0x8F0CCC92);
    c = md5ii(c, d, a, b, x[i + 10], 15, 0xFFEFF47D);
    b = md5ii(b, c, d, a, x[i + 1], 21, 0x85845DD1);
    a = md5ii(a, b, c, d, x[i + 8], 6, 0x6FA87E4F);
    d = md5ii(d, a, b, c, x[i + 15], 10, 0xFE2CE6E0);
    c = md5ii(c, d, a, b, x[i + 6], 15, 0xA3014314);
    b = md5ii(b, c, d, a, x[i + 13], 21, 0x4E0811A1);
    a = md5ii(a, b, c, d, x[i + 4], 6, 0xF7537E82);
    d = md5ii(d, a, b, c, x[i + 11], 10, 0xBD3AF235);
    c = md5ii(c, d, a, b, x[i + 2], 15, 0x2AD7D2BB);
    b = md5ii(b, c, d, a, x[i + 9], 21, 0xEB86D391);

    a = addUnsigned(a, olda);
    b = addUnsigned(b, oldb);
    c = addUnsigned(c, oldc);
    d = addUnsigned(d, oldd);
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// MD5签名验证
function verifySign(params: Record<string, any>, key: string, receivedSign: string): boolean {
  const filteredParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== '' && v !== null && v !== undefined && k !== 'sign' && k !== 'sign_type') {
      filteredParams[k] = String(v);
    }
  }

  const sortedKeys = Object.keys(filteredParams).sort();
  const signStr = sortedKeys.map(k => `${k}=${filteredParams[k]}`).join('&') + key;

  const calculatedSign = md5(signStr);

  return calculatedSign === receivedSign;
}

Deno.serve(async (req) => {
  try {
    // 易支付回调使用GET请求
    const url = new URL(req.url);
    const params: Record<string, string> = {};
    
    // 获取所有查询参数
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('[YZFPay Webhook] 收到支付回调:', JSON.stringify(params));

    // 验证必要参数
    if (!params.pid || !params.out_trade_no || !params.trade_status || !params.sign) {
      console.error('[YZFPay Webhook] 缺少必要参数');
      return new Response('fail', { status: 400 });
    }

    // 验证商户ID
    if (params.pid !== MERCHANT_ID) {
      console.error('[YZFPay Webhook] 商户ID不匹配');
      return new Response('fail', { status: 400 });
    }

    // 验证签名
    const signValid = verifySign(params, MERCHANT_KEY, params.sign);
    if (!signValid) {
      console.error('[YZFPay Webhook] 签名验证失败');
      return new Response('fail', { status: 400 });
    }

    // 检查支付状态
    if (params.trade_status !== 'TRADE_SUCCESS') {
      console.log(`[YZFPay Webhook] 支付状态不是成功: ${params.trade_status}`);
      return new Response('success', { status: 200 });
    }

    const orderNo = params.out_trade_no;
    const yzfTradeNo = params.trade_no;

    // 使用service_role客户端操作数据库
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 查询订单
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (orderError || !order) {
      console.error('[YZFPay Webhook] 订单不存在:', orderNo);
      return new Response('fail', { status: 404 });
    }

    // 使用乐观锁更新订单状态
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        yzf_trade_no: yzfTradeNo,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .eq('status', 'pending') // 乐观锁：只有pending状态才能更新
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.log('[YZFPay Webhook] 订单已处理或状态不匹配');
      return new Response('success', { status: 200 });
    }

    console.log(`[YZFPay Webhook] 订单状态更新成功: ${orderNo}`);

    // 根据订单类型执行后续逻辑
    if (order.order_type === 'subscription') {
      // 处理订阅订单
      await handleSubscriptionOrder(supabaseAdmin, order);
    } else if (order.order_type === 'coin_recharge') {
      // 处理充值订单
      await handleCoinRechargeOrder(supabaseAdmin, order);
    }

    // 返回success表示接收成功
    return new Response('success', { status: 200 });

  } catch (error) {
    console.error('[YZFPay Webhook] 处理回调失败:', error);
    return new Response('fail', { status: 500 });
  }
});

// 处理订阅订单
async function handleSubscriptionOrder(supabaseAdmin: any, order: any) {
  try {
    console.log(`[Subscription] 处理订阅订单: ${order.order_no}`);

    // 计算订阅时间
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 创建订阅记录
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: order.user_id,
        subscription_type: order.subscription_type,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: order.subscription_type === 'continuous_monthly',
        order_id: order.id
      });

    if (subError) {
      console.error('[Subscription] 创建订阅记录失败:', subError);
      throw subError;
    }

    // 更新用户会员状态
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_vip: true,
        vip_expire_at: endDate.toISOString()
      })
      .eq('id', order.user_id);

    if (profileError) {
      console.error('[Subscription] 更新用户会员状态失败:', profileError);
      throw profileError;
    }

    console.log(`[Subscription] 订阅订单处理成功: ${order.order_no}`);
  } catch (error) {
    console.error('[Subscription] 处理订阅订单失败:', error);
    throw error;
  }
}

// 处理充值订单
async function handleCoinRechargeOrder(supabaseAdmin: any, order: any) {
  try {
    console.log(`[CoinRecharge] 处理充值订单: ${order.order_no}, 金额: ${order.coin_amount}`);

    // 调用RPC函数更新钱包余额
    const { error: walletError } = await supabaseAdmin.rpc('update_wallet_balance', {
      p_user_id: order.user_id,
      p_amount: order.coin_amount,
      p_type: 'recharge',
      p_description: `充值${order.coin_amount}幻梦币`,
      p_related_user_id: null
    });

    if (walletError) {
      console.error('[CoinRecharge] 更新钱包余额失败:', walletError);
      throw walletError;
    }

    console.log(`[CoinRecharge] 充值订单处理成功: ${order.order_no}`);
  } catch (error) {
    console.error('[CoinRecharge] 处理充值订单失败:', error);
    throw error;
  }
}
