import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  idcard: string;
  name: string;
  userId: string;
}

interface ApiResponse {
  showapi_res_code: number;
  showapi_res_error: string;
  showapi_res_body: {
    ret_code: number;
    code: number;
    msg: string;
    sex?: string;
    birthday?: string;
    province?: string;
    city?: string;
    county?: string;
    address?: string;
  };
}

Deno.serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 获取请求数据
    const { idcard, name, userId }: VerifyRequest = await req.json();

    // 验证参数
    if (!idcard || !name || !userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '缺少必要参数：身份证号、姓名或用户ID' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 验证身份证号格式（18位）
    if (!/^\d{17}[\dXx]$/.test(idcard)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '身份证号格式不正确，请输入18位身份证号' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 验证姓名格式（2-10个中文字符）
    if (!/^[\u4e00-\u9fa5]{2,10}$/.test(name)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '姓名格式不正确，请输入2-10个中文字符' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 获取API密钥
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      console.error('INTEGRATIONS_API_KEY未配置');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '服务配置错误，请联系管理员' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 调用身份证二要素认证API
    const apiUrl = `https://app-883oyd7kz475-api-oLpZ74noWOMa-gateway.appmiaoda.com/idcard?idcard=${encodeURIComponent(idcard)}&name=${encodeURIComponent(name)}`;
    
    console.log('调用身份证认证API:', apiUrl);
    
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    if (!apiResponse.ok) {
      console.error('API请求失败:', apiResponse.status, apiResponse.statusText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `认证服务请求失败: ${apiResponse.statusText}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data: ApiResponse = await apiResponse.json();
    console.log('API响应:', JSON.stringify(data));

    // 检查外层响应状态
    if (data.showapi_res_code !== 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.showapi_res_error || '认证服务返回错误' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 检查业务结果
    const body = data.showapi_res_body;
    if (body.ret_code !== 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: body.msg || '认证失败' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 检查验证结果
    if (body.code === 1) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '身份证号与姓名不匹配，请检查后重试' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (body.code === 2) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '无此身份证号码，请检查后重试' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 验证成功，更新数据库
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 同时更新is_verified和is_real_verified字段，确保兼容性
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        real_name: name,
        id_card: idcard,
        is_verified: true,
        is_real_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('更新数据库失败:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '保存认证信息失败，请稍后重试' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 向所有管理员发送通知
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'system',
        title: '新的实名认证',
        content: `用户ID ${userId} 已完成实名认证，请及时查看`,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('notifications').insert(notifications);
    }

    // 返回成功结果
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '实名认证成功',
        data: {
          sex: body.sex === 'M' ? '男' : '女',
          birthday: body.birthday,
          province: body.province,
          city: body.city,
          county: body.county,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
