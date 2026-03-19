-- 添加user_id字段
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='user_id') THEN
    ALTER TABLE channels ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE channels SET user_id = created_by WHERE created_by IS NOT NULL;
  END IF;
END $$;

-- 添加is_live字段
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='is_live') THEN
    ALTER TABLE channels ADD COLUMN is_live BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 重命名字段
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='channel_name') THEN
    ALTER TABLE channels RENAME COLUMN channel_name TO name;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='channel_description') THEN
    ALTER TABLE channels RENAME COLUMN channel_description TO description;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='channel_logo') THEN
    ALTER TABLE channels RENAME COLUMN channel_logo TO cover_image;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_is_live ON channels(is_live);