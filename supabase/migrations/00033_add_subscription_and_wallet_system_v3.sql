-- 创建订阅类型枚举
DO $$ BEGIN
  CREATE TYPE subscription_type AS ENUM ('monthly', 'continuous_monthly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 创建订阅状态枚举
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 创建钱包交易类型枚举
DO $$ BEGIN
  CREATE TYPE wallet_transaction_type AS ENUM ('sign_in', 'recharge', 'consume', 'reward_send', 'reward_receive', 'refund');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 创建订单类型枚举
DO $$ BEGIN
  CREATE TYPE order_type AS ENUM ('subscription', 'coin_recharge', 'product');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 创建订单状态枚举（如果不存在）
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded', 'partial_refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. 会员订阅表
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_type subscription_type NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(end_date);

-- 2. 幻梦币钱包表
CREATE TABLE IF NOT EXISTS public.wallet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
    total_spent INTEGER NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON public.wallet(user_id);

-- 3. 幻梦币交易记录表
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type wallet_transaction_type NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    related_order_id UUID,
    related_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

-- 4. 签到记录表
CREATE TABLE IF NOT EXISTS public.daily_check_in (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reward_amount INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_check_in_user_id ON public.daily_check_in(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_check_in_date ON public.daily_check_in(check_in_date DESC);

-- 5. 创建订单表
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_type order_type NOT NULL DEFAULT 'product',
    status order_status NOT NULL DEFAULT 'pending',
    wechat_pay_url TEXT,
    total_amount NUMERIC(12,2) NOT NULL,
    subscription_type TEXT,
    coin_amount INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON public.orders(order_no);

-- 6. SKU表
CREATE TABLE IF NOT EXISTS public.sku (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    inventory_total INT NOT NULL DEFAULT 999999,
    inventory_available INT NOT NULL DEFAULT 999999,
    inventory_reserved INT NOT NULL DEFAULT 0,
    inventory_sold INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (inventory_available >= 0),
    CHECK (inventory_reserved >= 0),
    CHECK (inventory_sold >= 0)
);

CREATE INDEX IF NOT EXISTS idx_sku_code ON public.sku(sku_code);

-- 7. 订单明细表
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sku_code TEXT NOT NULL REFERENCES public.sku(sku_code),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    sku_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 8. 添加会员状态到profiles表
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_vip') THEN
    ALTER TABLE public.profiles ADD COLUMN is_vip BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'vip_expire_at') THEN
    ALTER TABLE public.profiles ADD COLUMN vip_expire_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_is_vip ON public.profiles(is_vip);

-- 9. RLS策略

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "用户可以查看自己的订阅" ON public.subscriptions;
CREATE POLICY "用户可以查看自己的订阅" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "管理员可以查看所有订阅" ON public.subscriptions;
CREATE POLICY "管理员可以查看所有订阅" ON public.subscriptions
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "用户可以查看自己的钱包" ON public.wallet;
CREATE POLICY "用户可以查看自己的钱包" ON public.wallet
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "管理员可以查看所有钱包" ON public.wallet;
CREATE POLICY "管理员可以查看所有钱包" ON public.wallet
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "用户可以查看自己的交易记录" ON public.wallet_transactions;
CREATE POLICY "用户可以查看自己的交易记录" ON public.wallet_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "管理员可以查看所有交易记录" ON public.wallet_transactions;
CREATE POLICY "管理员可以查看所有交易记录" ON public.wallet_transactions
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

ALTER TABLE public.daily_check_in ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "用户可以查看自己的签到记录" ON public.daily_check_in;
CREATE POLICY "用户可以查看自己的签到记录" ON public.daily_check_in
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "管理员可以查看所有签到记录" ON public.daily_check_in;
CREATE POLICY "管理员可以查看所有签到记录" ON public.daily_check_in
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "用户可以查看自己的订单" ON public.orders;
CREATE POLICY "用户可以查看自己的订单" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "管理员可以查看所有订单" ON public.orders;
CREATE POLICY "管理员可以查看所有订单" ON public.orders
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "用户可以查看自己订单的明细" ON public.order_items;
CREATE POLICY "用户可以查看自己订单的明细" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "管理员可以查看所有订单明细" ON public.order_items;
CREATE POLICY "管理员可以查看所有订单明细" ON public.order_items
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

ALTER TABLE public.sku ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "所有人可以查看SKU" ON public.sku;
CREATE POLICY "所有人可以查看SKU" ON public.sku
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "管理员可以管理SKU" ON public.sku;
CREATE POLICY "管理员可以管理SKU" ON public.sku
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 10. 创建库存管理函数
CREATE OR REPLACE FUNCTION public.manage_sku_inventory(
  sku_code_in TEXT,
  qty_in INT,
  action TEXT  -- 'order' | 'pay_success' | 'pay_cancel' | 'refund'
) RETURNS sku
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result sku;
BEGIN
  IF qty_in IS NULL OR qty_in <= 0 THEN
    result := NULL;
    RETURN result;
  END IF;

  IF action = 'order' THEN
    -- 下单冻结：可售减少，冻结增加
    UPDATE sku
    SET inventory_available = inventory_available - qty_in,
        inventory_reserved = inventory_reserved + qty_in,
        updated_at = NOW()
    WHERE sku_code = sku_code_in
      AND inventory_available >= qty_in
    RETURNING * INTO result;

  ELSIF action = 'pay_success' THEN
    -- 支付成功：冻结转已售
    UPDATE sku
    SET inventory_reserved = inventory_reserved - qty_in,
        inventory_sold = inventory_sold + qty_in,
        updated_at = NOW()
    WHERE sku_code = sku_code_in
      AND inventory_reserved >= qty_in
    RETURNING * INTO result;

  ELSIF action = 'pay_cancel' THEN
    -- 支付取消/超时：释放冻结回可售
    UPDATE sku
    SET inventory_available = inventory_available + qty_in,
        inventory_reserved = inventory_reserved - qty_in,
        updated_at = NOW()
    WHERE sku_code = sku_code_in
      AND inventory_reserved >= qty_in
    RETURNING * INTO result;

  ELSIF action = 'refund' THEN
    -- 支付成功后退款：释放已售回可售
    UPDATE sku
    SET inventory_available = inventory_available + qty_in,
        inventory_sold = inventory_sold - qty_in,
        updated_at = NOW()
    WHERE sku_code = sku_code_in
      AND inventory_sold >= qty_in
    RETURNING * INTO result;

  ELSE
    result := NULL;
  END IF;

  RETURN result;
END;
$$;

-- 11. 创建钱包操作函数
CREATE OR REPLACE FUNCTION public.update_wallet_balance(
  p_user_id UUID,
  p_amount INTEGER,
  p_type wallet_transaction_type,
  p_description TEXT DEFAULT NULL,
  p_related_order_id UUID DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL
) RETURNS wallet
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet wallet;
  v_new_balance INTEGER;
BEGIN
  -- 获取或创建钱包
  INSERT INTO public.wallet (user_id, balance, total_earned, total_spent)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- 锁定钱包行
  SELECT * INTO v_wallet
  FROM public.wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 计算新余额
  v_new_balance := v_wallet.balance + p_amount;

  -- 检查余额是否足够（如果是消费）
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION '幻梦币余额不足';
  END IF;

  -- 更新钱包
  UPDATE public.wallet
  SET 
    balance = v_new_balance,
    total_earned = CASE WHEN p_amount > 0 THEN total_earned + p_amount ELSE total_earned END,
    total_spent = CASE WHEN p_amount < 0 THEN total_spent + ABS(p_amount) ELSE total_spent END,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_wallet;

  -- 记录交易
  INSERT INTO public.wallet_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    related_order_id,
    related_user_id
  ) VALUES (
    p_user_id,
    p_type,
    p_amount,
    v_new_balance,
    p_description,
    p_related_order_id,
    p_related_user_id
  );

  RETURN v_wallet;
END;
$$;