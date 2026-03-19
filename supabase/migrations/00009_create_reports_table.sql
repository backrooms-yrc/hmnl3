-- 创建举报类型枚举
CREATE TYPE report_type AS ENUM ('message', 'post', 'user');

-- 创建举报状态枚举
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'rejected');

-- 创建举报表
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type report_type NOT NULL,
  target_id UUID NOT NULL, -- 被举报对象的ID（消息/帖子/用户）
  reason TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'pending',
  handled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  handled_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_target ON reports(target_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- 创建通知管理员的函数
CREATE OR REPLACE FUNCTION notify_admins_on_report()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  reporter_name TEXT;
  report_type_text TEXT;
BEGIN
  -- 获取举报者用户名
  SELECT username INTO reporter_name FROM profiles WHERE id = NEW.reporter_id;
  
  -- 转换举报类型为中文
  CASE NEW.report_type
    WHEN 'message' THEN report_type_text := '消息';
    WHEN 'post' THEN report_type_text := '帖子';
    WHEN 'user' THEN report_type_text := '用户';
  END CASE;
  
  -- 为所有管理员（包括超管）创建通知
  FOR admin_record IN 
    SELECT id FROM profiles WHERE role = 'admin' OR is_super_admin = true
  LOOP
    INSERT INTO notifications (user_id, type, content, related_id)
    VALUES (
      admin_record.id,
      'system',
      '用户 ' || reporter_name || ' 举报了一个' || report_type_text || '，请及时处理',
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：新举报时通知管理员
CREATE TRIGGER notify_admins_on_new_report
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_on_report();

-- 设置RLS策略
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己提交的举报
CREATE POLICY "用户可以查看自己的举报"
  ON reports FOR SELECT
  USING (reporter_id = auth.uid());

-- 用户可以创建举报
CREATE POLICY "用户可以创建举报"
  ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- 管理员可以查看所有举报
CREATE POLICY "管理员可以查看所有举报"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR is_super_admin = true)
    )
  );

-- 管理员可以更新举报状态
CREATE POLICY "管理员可以更新举报"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR is_super_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR is_super_admin = true)
    )
  );