-- 添加实名认证相关字段到profiles表
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS real_name TEXT,
ADD COLUMN IF NOT EXISTS id_card_last4 TEXT,
ADD COLUMN IF NOT EXISTS is_real_verified BOOLEAN DEFAULT FALSE;

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_profiles_is_real_verified ON profiles(is_real_verified);

-- 添加注释
COMMENT ON COLUMN profiles.real_name IS '实名认证姓名';
COMMENT ON COLUMN profiles.id_card_last4 IS '身份证后4位';
COMMENT ON COLUMN profiles.is_real_verified IS '是否已实名认证';