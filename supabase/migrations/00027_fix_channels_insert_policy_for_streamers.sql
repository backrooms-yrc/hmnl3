-- 修复频道创建策略：将is_verified改为is_streamer

-- 删除旧的策略
DROP POLICY IF EXISTS "Verified users can create channels" ON channels;

-- 创建新的策略：允许入驻用户（is_streamer=true）创建频道
CREATE POLICY "Streamers can create channels"
ON channels
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = uid() 
    AND profiles.is_streamer = true
  )
);

-- 添加注释
COMMENT ON POLICY "Streamers can create channels" ON channels IS '允许入驻用户（is_streamer=true）创建频道';