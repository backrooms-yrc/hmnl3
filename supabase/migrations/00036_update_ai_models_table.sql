-- 添加display_order字段用于排序
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 更新现有模型的排序
UPDATE ai_models SET display_order = 1 WHERE model_name = 'gpt-4o';
UPDATE ai_models SET display_order = 2 WHERE model_name = 'gpt-4o-mini';
UPDATE ai_models SET display_order = 3 WHERE model_name = 'gpt-3.5-turbo';
UPDATE ai_models SET display_order = 4 WHERE model_name = 'deepseek-chat';
UPDATE ai_models SET display_order = 5 WHERE model_name = 'deepseek-coder';
UPDATE ai_models SET display_order = 6 WHERE model_name = 'claude-3-5-sonnet-20241022';
UPDATE ai_models SET display_order = 7 WHERE model_name = 'claude-3-opus-20240229';
UPDATE ai_models SET display_order = 8 WHERE model_name = 'gemini-pro';
UPDATE ai_models SET display_order = 9 WHERE model_name = 'gemini-1.5-pro';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_models_display_order ON ai_models(display_order);