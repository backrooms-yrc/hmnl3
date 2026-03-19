-- 添加is_streamer字段（是否为入驻主播）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_streamer BOOLEAN DEFAULT false;

-- 添加推流和频道相关字段到profiles表
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stream_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS channel_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS channel_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS channel_logo TEXT;

-- 添加唯一约束
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_stream_id_key;
ALTER TABLE profiles ADD CONSTRAINT profiles_stream_id_key UNIQUE (stream_id);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_stream_id ON profiles(stream_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_streamer ON profiles(is_streamer);

-- 创建channels表（管理员手动添加的频道）
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id TEXT UNIQUE NOT NULL,
  channel_name TEXT NOT NULL,
  channel_description TEXT,
  channel_logo TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_channels_stream_id ON channels(stream_id);
CREATE INDEX IF NOT EXISTS idx_channels_is_active ON channels(is_active);

-- 创建announcements表（轮播公告）
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_display_order ON announcements(display_order);

-- 添加RLS策略
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- channels表策略：所有人可读，管理员可写
DROP POLICY IF EXISTS "channels_select_policy" ON channels;
CREATE POLICY "channels_select_policy" ON channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "channels_insert_policy" ON channels;
CREATE POLICY "channels_insert_policy" ON channels FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "channels_update_policy" ON channels;
CREATE POLICY "channels_update_policy" ON channels FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "channels_delete_policy" ON channels;
CREATE POLICY "channels_delete_policy" ON channels FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- announcements表策略：所有人可读，管理员可写
DROP POLICY IF EXISTS "announcements_select_policy" ON announcements;
CREATE POLICY "announcements_select_policy" ON announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "announcements_insert_policy" ON announcements;
CREATE POLICY "announcements_insert_policy" ON announcements FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "announcements_update_policy" ON announcements;
CREATE POLICY "announcements_update_policy" ON announcements FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "announcements_delete_policy" ON announcements;
CREATE POLICY "announcements_delete_policy" ON announcements FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 创建函数：生成随机推流ID
CREATE OR REPLACE FUNCTION generate_stream_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
  length INTEGER;
BEGIN
  -- 生成8-12位随机长度
  length := 8 + floor(random() * 5)::INTEGER;
  
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器函数：自动为新入驻用户生成stream_id
CREATE OR REPLACE FUNCTION auto_generate_stream_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_streamer = true AND NEW.stream_id IS NULL THEN
    -- 生成唯一的stream_id
    LOOP
      NEW.stream_id := generate_stream_id();
      -- 检查是否唯一
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM profiles WHERE stream_id = NEW.stream_id
        UNION ALL
        SELECT 1 FROM channels WHERE stream_id = NEW.stream_id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_auto_generate_stream_id ON profiles;
CREATE TRIGGER trigger_auto_generate_stream_id
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_stream_id();