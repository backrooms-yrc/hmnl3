-- 添加文件上传支持字段到ai_models表
ALTER TABLE ai_models 
ADD COLUMN IF NOT EXISTS supports_file_upload BOOLEAN DEFAULT false;

-- 更新现有模型，默认不支持文件上传
UPDATE ai_models 
SET supports_file_upload = false 
WHERE supports_file_upload IS NULL;

-- 添加注释
COMMENT ON COLUMN ai_models.supports_file_upload IS '是否支持文件上传功能';