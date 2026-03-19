import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  phone: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const { phone } = await req.json() as RequestBody;

    if (!phone) {
      return new Response(
        JSON.stringify({ error: '手机号不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, phone, phone_password')
      .eq('phone', phone)
      .maybeSingle();

    let userEmail: string;
    let userPassword: string;

    if (!profile) {
      const randomUsername = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const email = `${randomUsername}@miaoda.com`;

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: { username: randomUsername, phone: phone },
      });

      if (createError || !newUser.user) {
        console.error('创建用户失败:', createError);
        return new Response(
          JSON.stringify({ error: '创建用户失败' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userEmail = email;
      userPassword = randomPassword;

      await supabaseAdmin
        .from('profiles')
        .update({ phone, phone_password: randomPassword })
        .eq('id', newUser.user.id);
    } else {
      userEmail = profile.email || `${profile.username}@miaoda.com`;
      
      if (!profile.phone_password) {
        const newPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        const { error: updatePasswordError } = await supabaseAdmin.auth.admin.updateUserById(
          profile.id,
          { password: newPassword }
        );
        
        if (updatePasswordError) {
          console.error('更新密码失败:', updatePasswordError);
          return new Response(
            JSON.stringify({ error: '更新密码失败' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        await supabaseAdmin
          .from('profiles')
          .update({ phone_password: newPassword })
          .eq('id', profile.id);
        
        userPassword = newPassword;
      } else {
        userPassword = profile.phone_password;
      }
    }

    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

    if (signInError || !sessionData.session) {
      console.error('登录失败:', signInError);
      return new Response(
        JSON.stringify({ error: '登录失败' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, session: sessionData.session, user: sessionData.user }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function错误:', error);
    return new Response(
      JSON.stringify({ error: error.message || '服务器错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
