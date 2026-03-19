-- 添加管理员频道标识字段和优化频道管理

-- 1. 添加is_admin_channel字段到channels表
ALTER TABLE channels
ADD COLUMN IF NOT EXISTS is_admin_channel BOOLEAN DEFAULT false;

-- 2. 为is_admin_channel字段添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_channels_is_admin_channel ON channels(is_admin_channel);

-- 3. 添加注释
COMMENT ON COLUMN channels.is_admin_channel IS '是否为管理员频道（由超管指定）';

-- 4. 更新现有由管理员创建的频道为管理员频道（可选，根据需要决定是否执行）
-- UPDATE channels 
-- SET is_admin_channel = true 
-- WHERE created_by IN (
--   SELECT id FROM profiles WHERE role = 'admin' OR is_super_admin = true
-- );