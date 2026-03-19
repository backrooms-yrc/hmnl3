-- 添加完整身份证号码字段（加密存储）
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS id_card_number TEXT;

-- 添加注释
COMMENT ON COLUMN profiles.id_card_number IS '完整身份证号码（加密存储，仅超管可查看）';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_id_card_number ON profiles(id_card_number) WHERE id_card_number IS NOT NULL;