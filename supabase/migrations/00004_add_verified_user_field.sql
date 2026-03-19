-- 添加入驻用户标识字段
ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;