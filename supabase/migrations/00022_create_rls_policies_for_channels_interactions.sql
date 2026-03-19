-- 删除旧的RLS策略
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