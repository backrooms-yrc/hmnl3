-- 添加phone_password字段用于存储手机号登录密码
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_password TEXT;