-- 创建弹窗公告表
CREATE TABLE IF NOT EXISTS popup_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_popup_announcements_is_active ON popup_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_popup_announcements_priority ON popup_announcements(priority DESC);
CREATE INDEX IF NOT EXISTS idx_popup_announcements_created_at ON popup_announcements(created_at DESC);

-- 启用RLS
ALTER TABLE popup_announcements ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看激活的公告
CREATE POLICY "所有人可以查看激活的公告"
  ON popup_announcements
  FOR SELECT
  USING (is_active = true);

-- 管理员可以查看所有公告
CREATE POLICY "管理员可以查看所有公告"
  ON popup_announcements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 管理员可以创建公告
CREATE POLICY "管理员可以创建公告"
  ON popup_announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 管理员可以更新公告
CREATE POLICY "管理员可以更新公告"
  ON popup_announcements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 管理员可以删除公告
CREATE POLICY "管理员可以删除公告"
  ON popup_announcements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_popup_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_popup_announcements_updated_at
  BEFORE UPDATE ON popup_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_popup_announcements_updated_at();