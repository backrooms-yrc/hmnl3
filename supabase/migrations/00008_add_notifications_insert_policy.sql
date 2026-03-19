-- 允许已认证用户创建通知（用于申请入驻等功能）
CREATE POLICY "已认证用户可以创建通知" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);