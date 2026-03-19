-- 修改现有channels表，添加新字段支持多频道功能
-- 添加user_id字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='user_id') THEN
    ALTER TABLE channels ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    -- 将现有记录的created_by复制到user_id
    UPDATE channels SET user_id = created_by WHERE created_by IS NOT NULL;
  END IF;
END $$;

-- 添加is_live字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='is_live') THEN
    ALTER TABLE channels ADD COLUMN is_live BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 重命名字段以保持一致性
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='channel_name') THEN
    ALTER TABLE channels RENAME COLUMN channel_name TO name;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='channel_description') THEN
    ALTER TABLE channels RENAME COLUMN channel_description TO description;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='channel_logo') THEN
    ALTER TABLE channels RENAME COLUMN channel_logo TO cover_image;
  END IF;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_is_live ON channels(is_live);

-- 频道聊天消息表
CREATE TABLE IF NOT EXISTS channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id ON channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_created_at ON channel_messages(created_at DESC);

-- 直播互动表
CREATE TABLE IF NOT EXISTS live_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'poll', 'lottery')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_live_interactions_channel_id ON live_interactions(channel_id);
CREATE INDEX IF NOT EXISTS idx_live_interactions_type ON live_interactions(type);
CREATE INDEX IF NOT EXISTS idx_live_interactions_is_active ON live_interactions(is_active);

-- 投票参与记录表
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID NOT NULL REFERENCES live_interactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(interaction_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_interaction_id ON poll_votes(interaction_id);

-- 抽奖参与记录表
CREATE TABLE IF NOT EXISTS lottery_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID NOT NULL REFERENCES live_interactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(interaction_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lottery_participants_interaction_id ON lottery_participants(interaction_id);

-- 删除旧的RLS策略（如果存在）
DROP POLICY IF EXISTS "Anyone can view channels" ON channels;
DROP POLICY IF EXISTS "Verified users can create channels" ON channels;
DROP POLICY IF EXISTS "Users can update own channels" ON channels;
DROP POLICY IF EXISTS "Users can delete own channels" ON channels;

-- RLS策略：频道表
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view channels"
  ON channels FOR SELECT
  USING (true);

CREATE POLICY "Verified users can create channels"
  ON channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_verified = true
    )
  );

CREATE POLICY "Users can update own channels"
  ON channels FOR UPDATE
  USING (user_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can delete own channels"
  ON channels FOR DELETE
  USING (user_id = auth.uid() OR created_by = auth.uid());

-- RLS策略：频道聊天消息表
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view channel messages"
  ON channel_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send channel messages"
  ON channel_messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS策略：直播互动表
ALTER TABLE live_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interactions"
  ON live_interactions FOR SELECT
  USING (true);

CREATE POLICY "Channel owners can create interactions"
  ON live_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND (channels.user_id = auth.uid() OR channels.created_by = auth.uid())
    )
  );

CREATE POLICY "Channel owners can update own interactions"
  ON live_interactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND (channels.user_id = auth.uid() OR channels.created_by = auth.uid())
    )
  );

CREATE POLICY "Channel owners can delete own interactions"
  ON live_interactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND (channels.user_id = auth.uid() OR channels.created_by = auth.uid())
    )
  );

-- RLS策略：投票参与记录表
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll votes"
  ON poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON poll_votes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS策略：抽奖参与记录表
ALTER TABLE lottery_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lottery participants"
  ON lottery_participants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can participate in lottery"
  ON lottery_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Channel owners can update lottery winners"
  ON lottery_participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM live_interactions li
      JOIN channels c ON c.id = li.channel_id
      WHERE li.id = interaction_id
      AND (c.user_id = auth.uid() OR c.created_by = auth.uid())
    )
  );

-- 创建函数：检查用户频道数量
CREATE OR REPLACE FUNCTION check_user_channel_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM channels
    WHERE user_id = NEW.user_id OR created_by = NEW.user_id
  ) >= 5 THEN
    RAISE EXCEPTION '每个用户最多只能创建5个频道';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS check_channel_limit_before_insert ON channels;

-- 创建触发器：在插入频道前检查数量限制
CREATE TRIGGER check_channel_limit_before_insert
  BEFORE INSERT ON channels
  FOR EACH ROW
  EXECUTE FUNCTION check_user_channel_limit();

-- 创建函数：更新updated_at字段
CREATE OR REPLACE FUNCTION update_channel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS update_channels_updated_at ON channels;
DROP TRIGGER IF EXISTS update_interactions_updated_at ON live_interactions;

-- 创建触发器：自动更新updated_at
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_updated_at();

CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON live_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_updated_at();
