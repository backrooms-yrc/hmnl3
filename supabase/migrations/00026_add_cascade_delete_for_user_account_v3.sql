-- 添加级联删除约束，确保用户注销时所有相关数据被删除

-- 1. posts表 - 用户发布的帖子
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_author_id_fkey,
ADD CONSTRAINT posts_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 2. comments表 - 用户的评论
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_author_id_fkey,
ADD CONSTRAINT comments_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 3. notifications表 - 用户的通知
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 4. channels表 - 用户创建的频道（user_id字段）
ALTER TABLE channels
DROP CONSTRAINT IF EXISTS channels_user_id_fkey,
ADD CONSTRAINT channels_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 5. channels表 - 频道创建者（created_by字段）
ALTER TABLE channels
DROP CONSTRAINT IF EXISTS channels_created_by_fkey,
ADD CONSTRAINT channels_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 6. live_interactions表 - 直播互动（user_id字段）
ALTER TABLE live_interactions
DROP CONSTRAINT IF EXISTS live_interactions_user_id_fkey,
ADD CONSTRAINT live_interactions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 7. poll_votes表 - 投票记录
ALTER TABLE poll_votes
DROP CONSTRAINT IF EXISTS poll_votes_user_id_fkey,
ADD CONSTRAINT poll_votes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 8. lottery_participants表 - 抽奖参与记录
ALTER TABLE lottery_participants
DROP CONSTRAINT IF EXISTS lottery_participants_user_id_fkey,
ADD CONSTRAINT lottery_participants_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 9. channel_messages表 - 频道消息
ALTER TABLE channel_messages
DROP CONSTRAINT IF EXISTS channel_messages_user_id_fkey,
ADD CONSTRAINT channel_messages_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 注释说明
COMMENT ON TABLE profiles IS '用户资料表 - 删除用户时会级联删除所有相关数据（帖子、评论、通知、频道等）';