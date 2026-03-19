
-- 添加身份证号字段到profiles表
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS id_card TEXT;

-- 添加注释
COMMENT ON COLUMN profiles.id_card IS '身份证号码（加密存储）';
COMMENT ON COLUMN profiles.real_name IS '真实姓名';
COMMENT ON COLUMN profiles.is_verified IS '是否已完成实名认证';
