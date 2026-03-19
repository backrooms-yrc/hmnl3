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