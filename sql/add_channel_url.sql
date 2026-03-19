-- 在 Supabase SQL Editor 中运行此脚本
-- 为 channels 表添加 channel_url 和 like_count 字段

-- 1. 添加 channel_url 字段（如果不存在）
ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS channel_url TEXT UNIQUE;

-- 2. 添加 like_count 字段（如果不存在）
ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- 3. 为现有频道生成随机 URL
-- 创建一个生成随机字符串的函数
CREATE OR REPLACE FUNCTION generate_random_url(length INT DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. 为所有没有 URL 的频道生成随机 URL
UPDATE channels 
SET channel_url = generate_random_url(8)
WHERE channel_url IS NULL OR channel_url = '';

-- 5. 设置 NOT NULL 约束（确保所有频道都有 URL）
ALTER TABLE channels 
ALTER COLUMN channel_url SET NOT NULL;

-- 6. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_channels_channel_url ON channels(channel_url);

-- 7. 创建 channel_likes 表（用于点赞功能）
CREATE TABLE IF NOT EXISTS channel_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- 8. 创建索引
CREATE INDEX IF NOT EXISTS idx_channel_likes_channel_id ON channel_likes(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_likes_user_id ON channel_likes(user_id);

-- 验证结果
SELECT id, name, channel_url, like_count FROM channels;
