-- 删除旧的触发器
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- 修改用户同步函数，在注册时立即创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  -- 检查是否已经存在该用户的 profile
  IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;
  
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- 从email中提取用户名（去掉@miaoda.com）
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  INSERT INTO profiles (id, username, email, role)
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  RETURN NEW;
END;
$$;

-- 创建新触发器：在用户注册时立即创建 profile（不等待邮箱确认）
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();