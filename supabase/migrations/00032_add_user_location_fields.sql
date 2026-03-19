-- 添加用户位置相关字段
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NOW();

-- 添加注释
COMMENT ON COLUMN profiles.city IS '用户所在城市（根据IP自动定位）';
COMMENT ON COLUMN profiles.ip_address IS '用户最后登录IP地址';
COMMENT ON COLUMN profiles.last_login_at IS '用户最后登录时间';