-- 添加数字ID字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS numeric_id SERIAL UNIQUE;

-- 为现有用户生成数字ID（如果还没有）
DO $$
DECLARE
  profile_record RECORD;
  next_id INTEGER := 1;
BEGIN
  FOR profile_record IN 
    SELECT id FROM profiles WHERE numeric_id IS NULL ORDER BY created_at
  LOOP
    UPDATE profiles SET numeric_id = next_id WHERE id = profile_record.id;
    next_id := next_id + 1;
  END LOOP;
END $$;

-- 设置为非空
ALTER TABLE profiles ALTER COLUMN numeric_id SET NOT NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_numeric_id ON profiles(numeric_id);