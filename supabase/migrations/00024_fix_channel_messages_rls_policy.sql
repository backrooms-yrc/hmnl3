
-- 修复频道消息RLS策略
-- 问题：使用了uid()而不是auth.uid()

-- 删除旧的策略
DROP POLICY IF EXISTS "Authenticated users can send channel messages" ON channel_messages;

-- 创建正确的策略
CREATE POLICY "Authenticated users can send channel messages"
  ON channel_messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 添加用户可以查看自己发送的消息的策略（如果需要UPDATE或DELETE）
CREATE POLICY "Users can update their own messages"
  ON channel_messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON channel_messages FOR DELETE
  USING (auth.uid() = user_id);
