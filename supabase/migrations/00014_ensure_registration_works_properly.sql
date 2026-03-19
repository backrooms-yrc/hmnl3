-- 确保触发器正确设置
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 重新创建用户同步函数（包含所有必要的字段）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  -- 检查是否已经存在该用户的 profile，避免重复创建
  IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;
  
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- 从email中提取用户名（去掉@miaoda.com）
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  -- 创建用户 profile
  INSERT INTO profiles (id, username, email, role, is_super_admin)
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END,
    CASE WHEN user_count = 0 THEN TRUE ELSE FALSE END
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 如果用户名已存在，添加随机后缀
    extracted_username := extracted_username || '_' || floor(random() * 10000)::text;
    INSERT INTO profiles (id, username, email, role, is_super_admin)
    VALUES (
      NEW.id,
      extracted_username,
      NEW.email,
      'user'::user_role,
      FALSE
    );
    RETURN NEW;
END;
$$;

-- 创建触发器：在用户注册时立即创建 profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 添加注释
COMMENT ON FUNCTION handle_new_user() IS '处理新用户注册：立即创建profile，第一个用户自动成为超级管理员';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS '用户注册时立即创建profile，无需等待邮箱验证';