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

// RSA签名函数
async function rsaSign(params: Record<string, any>): Promise<string> {
  try {
    // 1. 过滤空值和sign、sign_type参数
    const filteredParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== '' && value !== null && value !== undefined && key !== 'sign' && key !== 'sign_type') {
        filteredParams[key] = String(value);
      }
    }

    // 2. 按ASCII码排序
    const sortedKeys = Object.keys(filteredParams).sort();

    // 3. 拼接成key=value&key=value格式
    const signStr = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&');

    console.log(`[RSA] 待签名字符串: ${signStr}`);

    // 4. 使用Web Crypto API进行RSA签名
    // 导入私钥
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = MERCHANT_PRIVATE_KEY
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    // 签名
    const encoder = new TextEncoder();
    const data = encoder.encode(signStr);
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      data
    );

    // Base64编码
    const signBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    
    console.log(`[RSA] 签名结果: ${signBase64.substring(0, 50)}...`);

    return signBase64;
  } catch (error) {
    console.error('[RSA] 签名失败:', error);
    throw error;
  }
}

// 创建易支付订单（返回表单提交参数）
async function createYZFPayOrder(
  outTradeNo: string,
  amount: number,
  name: string,
  notifyUrl: string,
  returnUrl: string
): Promise<{ success: boolean; formData?: Record<string, string>; submitUrl?: string; error?: string }> {
  try {
    // 获取当前时间戳（10位）
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const params = {
      pid: MERCHANT_ID,
      type: 'wxpay', // 默认使用微信支付
      out_trade_no: outTradeNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: name,
      money: amount.toFixed(2),
      timestamp: timestamp,
      sign_type: 'RSA',
    };

    console.log(`[YZFPay] 准备生成签名，参数:`, JSON.stringify(params));

    // 生成RSA签名
    const sign = await rsaSign(params);

    console.log(`[YZFPay] 签名生成成功`);

    // 返回表单提交参数
    const formData = {
      ...params,
      sign: sign,
    };

    console.log(`[YZFPay] 创建订单: outTradeNo=${outTradeNo}, amount=${amount}, name=${name}`);

    return {
      success: true,
      formData: formData,
      submitUrl: 'https://pay.myzfw.com/api/pay/submit',
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
    const { sku_code } = await req.json();

    // 验证参数
    if (!sku_code) {
      return new Response(
        JSON.stringify({ error: '缺少SKU代码' }),
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

    // 获取SKU信息
    const { data: sku, error: skuError } = await supabaseAdmin
      .from('sku')
      .select('*')
      .eq('sku_code', sku_code)
      .single();

    if (skuError || !sku) {
      console.error('SKU查询失败:', skuError);
      return new Response(
        JSON.stringify({ error: 'SKU不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 验证SKU类型
    if (sku.sku_type !== 'coin_recharge') {
      return new Response(
        JSON.stringify({ error: '无效的SKU类型' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
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
        order_type: 'coin_recharge',
        status: 'pending',
        total_amount: sku.price,
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

    // 获取幻梦币数量
    const coinAmount = sku.coin_amount || 0;

    // 创建订单明细
    await supabaseAdmin
      .from('order_items')
      .insert({
        order_id: order.id,
        sku_code: sku_code,
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
    const description = `充值${coinAmount}幻梦币`;
    
    const payResult = await createYZFPayOrder(
      orderNo,
      parseFloat(sku.price),
      description,
      notifyUrl,
      returnUrl
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
        payment_method: 'form_submit', // 标识使用表单提交方式
        coin_amount: coinAmount
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('创建充值订单失败:', error);
    return new Response(
      JSON.stringify({ error: error.message || '创建充值订单失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
