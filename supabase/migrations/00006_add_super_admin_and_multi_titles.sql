-- 添加超级管理员标识字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- 设置numeric_id为5的用户为超级管理员
UPDATE profiles SET is_super_admin = TRUE WHERE numeric_id = 5;

-- 创建新的titles数组字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS titles TEXT[] DEFAULT '{}';

-- 迁移现有的单头衔数据到数组
UPDATE profiles 
SET titles = ARRAY[title]::TEXT[]
WHERE title IS NOT NULL AND title != '';

-- 为索引优化
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON profiles(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_titles ON profiles USING GIN(titles);

-- 添加注释
COMMENT ON COLUMN profiles.is_super_admin IS '是否为超级管理员，超管可以指定其他管理员';
COMMENT ON COLUMN profiles.titles IS '用户头衔数组，支持多个头衔';