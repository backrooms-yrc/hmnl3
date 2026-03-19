-- 添加易支付订单号字段
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS yzf_trade_no TEXT;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_orders_yzf_trade_no ON public.orders(yzf_trade_no);