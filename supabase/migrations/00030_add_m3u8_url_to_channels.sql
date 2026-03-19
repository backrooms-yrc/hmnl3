-- 为channels表添加m3u8_url字段，支持自定义直播流链接
ALTER TABLE channels ADD COLUMN IF NOT EXISTS m3u8_url TEXT;

-- 添加注释
COMMENT ON COLUMN channels.m3u8_url IS '自定义m3u8直播流链接，如果设置则优先使用此链接';
