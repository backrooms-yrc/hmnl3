-- 允许channels表的stream_id为null（当使用自定义m3u8链接时）
ALTER TABLE channels 
ALTER COLUMN stream_id DROP NOT NULL;

-- 添加检查约束：stream_id和m3u8_url至少有一个不为null
ALTER TABLE channels
ADD CONSTRAINT check_stream_source CHECK (
  stream_id IS NOT NULL OR m3u8_url IS NOT NULL
);