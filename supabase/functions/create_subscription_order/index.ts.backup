import { createClient } from 'jsr:@supabase/supabase-js@2';
import ShortUniqueId from 'npm:short-unique-id';

// 商户配置（新易支付系统）
const MERCHANT_ID = '17371';
const MERCHANT_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDI32tgedtUw3vV
/v8cX9pzESOoXlczSpxar0gv4vL/JR2Tw+aW31HTsBm7CDx2W5i/QKnuHW2VSSx0
KSzSwsXmM8cstyWvS/yX9mN4uRoD7K98CJnGrTWhf11mvQ+s/h8l4516vBbjb7gJ
fz8EwX9NDfAb+kQIRvnFzRVaj9kLRIaQOyiTKZ3VLCAiIec1OcSU1gUTy84VE9Qc
7dncAbkNvvmJQ1bBDMpVmsmP64GvbuRXfWEnqFAyDaTsxRnFc6h6MYPUojuZ7HLx
rWYWiuwHhvPIIcRLig44ZaqnYLjkSQyhHzkB4Lqz7nZM6WQIAX5diZuiKZlpXrUD
eGE2IYY/AgMBAAECggEANyFytAjd1LbOTx5sYBpCt2AV3EkAP9iTbyQ6eMIeFT7X
jk2vBOuH5sSnWzjYd1eOZbdWrD6xa86of70pSzMf452EZdZiZmlBi2eZR3HuHPOh
+jXWFrxFQuzU8rSjD8SzQc/l0eC7m3J3HUwqPKDq0ngn1VXrxCXOuaYe3Tsrw7Zv
iWoJQ1A31Pfmj/c/RdNhlbuHL7eJ4scyVJ81EoZReZC3vsoh2Hoy8yLKHxFGFsnJ
XtRg3fvEDB80boi/jU7zuoD1XB8PO8ndZvurbuMo9PSrudQkUavqhBhpSM7Z3hVc
zPmddREt3rCHNawuWeXNENQCVBL0ffynbTm/4bZIUQKBgQDkQYS+zw3Pe8ReKzbV
Kxji6z1aHzGg73TurDd81CdkwesxCw7M6uCZmHl7550aDuS8Qbrrxw1aarUcG0lq
bYJLmOUyIYSBCFsKX2OYFiONfcD+vaWDUbHBilq04m1Po8h8mm/IRW+cNCB01xCU
zVj6LM+LLXSAeabjJqhYvvV0ZwKBgQDhSdY92pMsBmBvQuiE+u7c1gdTnxGfBEXT
5Om/QMNYAzXXN2Z4opREPy0ZMs+0cGSUnQAakaCU22GxOmNq09Re5QRrIcvbvyrj
mW6W/CsVJ1xe7HToYZxZfStgUzBCe8qhU/niamWMi/toqEgFnEM5Y7wrIFyQLVe6
8y8BSSf4aQKBgQCD2bj1g6NlpAfloa7V6kRA6EQTaAuB/HCeYgrXZ7GtyTqzpMCS
7GZ7MxGR2lPstoe4m3t/MQdsoFEoADcjbEikpJhYofXpl0sHrdxZAQjedbLjM+eE
+M7mjqYg8N7V7zUjjQ5fMITtRUsuUwE4A3qPYQ0uRz6R7DPT6QO75+rfpwKBgFyy
mvq8cw4MWaWuLCp7bclkL4OS0hdSFMFJUXymUzplp8O0Qe+lRciHDjFuHNSr4lbb
+uzzutVFJ39a/Qk5vAqHxTenok/66tTXjw+FFt0PYwyT0s7DSyfvPufVkufoM8oJ
2an2CW65MmsvwuK8F1UH2qcMG8ofPhfodBDdXxrxAoGAEIYWzgCZc/u5jOY20Fjs
ebM4GvCaEMB9Xz0j4UaSx6kl/D6aUXSFkBagqI/SbA6bpFFcFxhcrgcsdkhIeHYx
yg33XSOjwrJAd2UDA3+OMnBa1Ik8VQ3evG5Wy9p68YBsAf2d+F8acXOs4r3NVx8L
XFYW4O3lVepQ1MDKEN+/X20=
-----END PRIVATE KEY-----`;

// 生成订单号
function generateOrderNo() {
  const uid = new ShortUniqueId({ length: 8 });
  const yymmdd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `ORD-${yymmdd}-${uid.rnd()}`;
}

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

// MD5签名算法
function md5Sign(params: Record<string, any>, key: string): string {
  // 1. 过滤空值和sign、sign_type参数
  const filteredParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== '' && v !== null && v !== undefined && k !== 'sign' && k !== 'sign_type') {
      filteredParams[k] = String(v);
    }
  }

  // 2. 按参数名ASCII码排序
  const sortedKeys = Object.keys(filteredParams).sort();

  // 3. 拼接成URL键值对格式
  const signStr = sortedKeys.map(k => `${k}=${filteredParams[k]}`).join('&') + key;

  // 4. MD5加密（小写）
  return md5(signStr);
}

// 创建易支付订单（返回表单提交参数）
async function createYZFPayOrder(
  outTradeNo: string,
  amount: number,
  name: string,
  notifyUrl: string,
  returnUrl: string,
  clientIp: string
): Promise<{ success: boolean; formData?: Record<string, string>; submitUrl?: string; error?: string }> {
  try {
    const params = {
      pid: MERCHANT_ID,
      type: 'wxpay', // 默认使用微信支付
      out_trade_no: outTradeNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: name,
      money: amount.toFixed(2),
      sitename: 'HMNL直播讨论站',
      clientip: clientIp,
      device: 'pc',
      sign_type: 'MD5',
    };

    console.log(`[YZFPay] 准备生成签名，参数:`, JSON.stringify(params));

    // 生成签名
    const sign = md5Sign(params, MERCHANT_KEY);

    console.log(`[YZFPay] 签名生成成功: ${sign}`);

    // 返回表单提交参数
    const formData = {
      ...params,
      sign: sign,
    };

    console.log(`[YZFPay] 创建订单: outTradeNo=${outTradeNo}, amount=${amount}, name=${name}`);

    return {
      success: true,
      formData: formData,
      submitUrl: 'https://mzf.yuvps.com/xpay/epay/submit.php',
    };
  } catch (err) {
    console.error(`[YZFPay] 请求异常:`, err);
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
}

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
    const { subscription_type } = await req.json();

    // 验证参数
    if (!subscription_type || !['monthly', 'continuous_monthly'].includes(subscription_type)) {
      return new Response(
        JSON.stringify({ error: '无效的订阅类型' }),
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

    // 确定SKU
    let skuCode: string;
    if (subscription_type === 'monthly') {
      skuCode = 'monthly_subscription';
    } else {
      // 检查是否是首次订阅
      const { data: existingSubs } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      skuCode = existingSubs && existingSubs.length > 0 
        ? 'continuous_monthly_renew' 
        : 'continuous_monthly_first';
    }

    // 获取SKU信息
    const { data: sku, error: skuError } = await supabaseAdmin
      .from('sku')
      .select('*')
      .eq('sku_code', skuCode)
      .single();

    if (skuError || !sku) {
      console.error('SKU查询失败:', skuError);
      return new Response(
        JSON.stringify({ error: 'SKU不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 生成订单号
    const orderNo = generateOrderNo();

    // 创建订单
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_no: orderNo,
        user_id: user.id,
        order_type: 'subscription',
        status: 'pending',
        total_amount: sku.price,
        subscription_type: subscription_type
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('订单创建失败:', orderError);
      return new Response(
        JSON.stringify({ error: '订单创建失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 创建订单明细
    await supabaseAdmin
      .from('order_items')
      .insert({
        order_id: order.id,
        sku_code: skuCode,
        quantity: 1,
        unit_price: sku.price,
        total_price: sku.price,
        sku_snapshot: sku
      });

    // 创建易支付订单
    const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment_webhook`;
    // 支付完成后跳转到订单详情页（从请求头获取前端URL）
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || '';
    const returnUrl = `${origin}/order/${orderNo}`;
    const description = subscription_type === 'monthly' ? '会员月卡' : '连续包月会员';
    
    // 获取客户端IP（从请求头中获取）
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    const payResult = await createYZFPayOrder(
      orderNo,
      parseFloat(sku.price),
      description,
      notifyUrl,
      returnUrl,
      clientIp
    );

    if (!payResult.success) {
      console.error('易支付订单创建失败:', payResult.error);
      return new Response(
        JSON.stringify({ 
          error: '支付订单创建失败',
          order_no: orderNo 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 返回订单号和表单提交参数
    return new Response(
      JSON.stringify({ 
        success: true,
        order_no: orderNo,
        form_data: payResult.formData,
        submit_url: payResult.submitUrl,
        payment_method: 'form_submit' // 标识使用表单提交方式
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('创建订阅订单失败:', error);
    return new Response(
      JSON.stringify({ error: error.message || '创建订阅订单失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});