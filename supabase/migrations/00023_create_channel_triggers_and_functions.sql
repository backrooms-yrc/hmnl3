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

-- 删除旧触发器
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

-- 删除旧触发器
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