-- 创建头像存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-883oyd7kz475_avatars', 'app-883oyd7kz475_avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 设置存储桶策略：所有人可以查看
CREATE POLICY "公开访问头像" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'app-883oyd7kz475_avatars');

-- 用户可以上传自己的头像
CREATE POLICY "用户可以上传头像" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'app-883oyd7kz475_avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 用户可以更新自己的头像
CREATE POLICY "用户可以更新头像" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'app-883oyd7kz475_avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 用户可以删除自己的头像
CREATE POLICY "用户可以删除头像" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'app-883oyd7kz475_avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );