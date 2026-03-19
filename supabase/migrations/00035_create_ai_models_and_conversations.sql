-- 创建AI模型表
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL, -- 请求体模型名称（如gpt-4o）
  display_name TEXT NOT NULL, -- 外显名称（如ChatGPT 4o）
  description TEXT, -- 简介
  is_active BOOLEAN DEFAULT true, -- 是否启用
  is_system BOOLEAN DEFAULT false, -- 是否系统默认模型
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE, -- 创建者，NULL表示系统默认
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(model_name, created_by) -- 同一用户不能创建重复模型名
);

-- 创建AI对话表
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '新对话',
  model_name TEXT NOT NULL, -- 使用的模型
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建AI消息表
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_models_created_by ON ai_models(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_active ON ai_models(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);

-- 启用RLS
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- AI模型表RLS策略
-- 所有人可以查看系统模型和自己创建的模型
CREATE POLICY "ai_models_select_policy" ON ai_models
  FOR SELECT
  USING (
    is_system = true 
    OR created_by IS NULL 
    OR created_by = auth.uid()
  );

-- 用户可以创建自己的模型
CREATE POLICY "ai_models_insert_policy" ON ai_models
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- 用户可以更新自己创建的模型
CREATE POLICY "ai_models_update_policy" ON ai_models
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 用户可以删除自己创建的模型
CREATE POLICY "ai_models_delete_policy" ON ai_models
  FOR DELETE
  USING (created_by = auth.uid());

-- 管理员可以管理所有模型
CREATE POLICY "ai_models_admin_all_policy" ON ai_models
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_super_admin = true)
    )
  );

-- AI对话表RLS策略
-- 用户只能查看自己的对话
CREATE POLICY "ai_conversations_select_policy" ON ai_conversations
  FOR SELECT
  USING (user_id = auth.uid());

-- 用户可以创建自己的对话
CREATE POLICY "ai_conversations_insert_policy" ON ai_conversations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 用户可以更新自己的对话
CREATE POLICY "ai_conversations_update_policy" ON ai_conversations
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 用户可以删除自己的对话
CREATE POLICY "ai_conversations_delete_policy" ON ai_conversations
  FOR DELETE
  USING (user_id = auth.uid());

-- AI消息表RLS策略
-- 用户只能查看自己对话中的消息
CREATE POLICY "ai_messages_select_policy" ON ai_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- 用户可以在自己的对话中创建消息
CREATE POLICY "ai_messages_insert_policy" ON ai_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- 用户可以删除自己对话中的消息
CREATE POLICY "ai_messages_delete_policy" ON ai_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- 插入默认系统模型
INSERT INTO ai_models (model_name, display_name, description, is_system, is_active) VALUES
  ('gpt-4o', 'ChatGPT 4o', '快速且聪明的模型👍', true, true),
  ('gpt-4o-mini', 'ChatGPT 4o Mini', '轻量级高效模型', true, true),
  ('gpt-3.5-turbo', 'ChatGPT 3.5 Turbo', '经典快速模型', true, true),
  ('deepseek-chat', 'DeepSeek Chat', '国产优秀对话模型', true, true),
  ('deepseek-coder', 'DeepSeek Coder', '专业代码生成模型', true, true),
  ('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Anthropic最新模型', true, true),
  ('claude-3-opus-20240229', 'Claude 3 Opus', '强大的推理模型', true, true),
  ('gemini-pro', 'Gemini Pro', 'Google多模态模型', true, true),
  ('gemini-1.5-pro', 'Gemini 1.5 Pro', 'Google最新Pro模型', true, true)
ON CONFLICT DO NOTHING;