
-- 修复频道消息RLS策略 - 使用正确的auth.uid()函数
-- 问题：策略中使用了uid()而不是auth.uid()

-- 删除所有旧的策略
DROP POLICY IF EXISTS "Authenticated users can send channel messages" ON channel_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON channel_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON channel_messages;

-- 创建正确的策略，使用auth.uid()
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
