import { createClient } from 'jsr:@supabase/supabase-js@2';

const AI_API_BASE_URL = 'https://d.lconai.com';
const AI_API_KEY = 'sk-refdUOS7yAfwBsr8dZcXmoNtlfZp07asDPUQHp26PSWqJzwR';
const SYSTEM_PROMPT = '你是一个由HMNL直播系统运营的人工智能助手，热衷于为用户解答各类问题。';

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

    // 获取请求数据
    const { conversation_id, message, model_name, stream = true } = await req.json();

    if (!message || !model_name) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 使用service_role客户端操作数据库
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let conversationId = conversation_id;
    let conversationTitle = '新对话';

    // 如果没有对话ID，创建新对话
    if (!conversationId) {
      // 使用消息的前30个字符作为标题
      conversationTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
      
      const { data: newConversation, error: convError } = await supabaseAdmin
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: conversationTitle,
          model_name: model_name
        })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error('创建对话失败:', convError);
        return new Response(
          JSON.stringify({ error: '创建对话失败' }),
          { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      conversationId = newConversation.id;
    }

    // 保存用户消息
    await supabaseAdmin
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      });

    // 获取对话历史
    const { data: historyMessages } = await supabaseAdmin
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20); // 限制历史消息数量

    // 构建消息列表
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(historyMessages || []),
    ];

    // 调用AI API
    const aiResponse = await fetch(`${AI_API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model_name,
        messages: messages,
        stream: stream,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API错误:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI服务请求失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 如果是流式响应
    if (stream) {
      const encoder = new TextEncoder();
      let assistantMessage = '';

      const readableStream = new ReadableStream({
        async start(controller) {
          const reader = aiResponse.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n').filter(line => line.trim() !== '');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    // 保存助手消息
                    if (assistantMessage) {
                      await supabaseAdmin
                        .from('ai_messages')
                        .insert({
                          conversation_id: conversationId,
                          role: 'assistant',
                          content: assistantMessage
                        });
                    }
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      assistantMessage += content;
                    }
                    // 添加conversation_id到响应
                    parsed.conversation_id = conversationId;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
                  } catch (e) {
                    console.error('解析SSE数据失败:', e);
                  }
                }
              }
            }
          } catch (error) {
            console.error('流式读取错误:', error);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // 非流式响应
      const data = await aiResponse.json();
      const assistantMessage = data.choices?.[0]?.message?.content || '';

      // 保存助手消息
      if (assistantMessage) {
        await supabaseAdmin
          .from('ai_messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: assistantMessage
          });
      }

      // 添加conversation_id到响应
      data.conversation_id = conversationId;

      return new Response(
        JSON.stringify(data),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*' 
          } 
        }
      );
    }

  } catch (error) {
    console.error('AI对话处理失败:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'AI对话处理失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
