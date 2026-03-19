-- 为profiles表添加is_live字段，表示用户是否正在直播
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;

-- 添加注释
COMMENT ON COLUMN profiles.is_live IS '是否正在直播';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_is_live ON profiles(is_live) WHERE is_live = true;