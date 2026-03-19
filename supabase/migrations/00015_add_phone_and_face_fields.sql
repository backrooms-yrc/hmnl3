-- 添加手机号和人脸识别相关字段到profiles表
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS face_token TEXT,
ADD COLUMN IF NOT EXISTS face_registered BOOLEAN DEFAULT FALSE;

-- 为手机号添加唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_key ON profiles(phone) WHERE phone IS NOT NULL;

-- 添加注释
COMMENT ON COLUMN profiles.phone IS '用户手机号，用于短信验证码登录';
COMMENT ON COLUMN profiles.face_token IS '人脸识别token，用于人脸登录';
COMMENT ON COLUMN profiles.face_registered IS '是否已注册人脸信息';