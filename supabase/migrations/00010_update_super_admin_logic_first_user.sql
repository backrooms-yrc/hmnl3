-- 更新用户创建函数，让第一个注册的用户自动成为超管
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- 从email中提取用户名（去掉@miaoda.com）
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  INSERT INTO profiles (id, username, email, role, is_super_admin)
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END,
    CASE WHEN user_count = 0 THEN TRUE ELSE FALSE END  -- 第一个用户自动成为超管
  );
  
  RETURN NEW;
END;
$$;

-- 添加注释说明
COMMENT ON FUNCTION handle_new_user() IS '处理新用户注册：第一个注册的用户自动成为超级管理员，后续用户为普通用户';