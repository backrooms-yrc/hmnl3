import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  getWallet,
  getWalletTransactions,
  getUserSubscription,
  getUserSubscriptions,
  dailyCheckIn,
  checkTodayCheckIn,
  createSubscriptionOrder,
  createCoinRechargeOrder,
  getSKUs,
} from '@/db/api';
import type { Wallet, WalletTransaction, Subscription, SKU } from '@/types/types';
import { Coins, Crown, Gift, Calendar, TrendingUp, Clock, User, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function SubscriptionWallet() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 并行加载所有数据
      const [walletData, transactionsData, subscriptionData, subscriptionsData, skusData, checkedIn] = await Promise.all([
        getWallet(user.id),
        getWalletTransactions(user.id),
        getUserSubscription(user.id),
        getUserSubscriptions(user.id),
        getSKUs(),
        checkTodayCheckIn(user.id),
      ]);

      setWallet(walletData);
      setTransactions(transactionsData || []);
      setSubscription(subscriptionData);
      setSubscriptions(subscriptionsData || []);
      setSkus(skusData || []);
      setHasCheckedIn(checkedIn);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载数据，请刷新页面重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 每日签到
  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const result = await dailyCheckIn();

      toast({
        title: '签到成功',
        description: `获得${result.reward_amount}幻梦币`,
      });

      setHasCheckedIn(true);
      await loadData();
    } catch (error: any) {
      console.error('签到失败:', error);
      toast({
        title: '签到失败',
        description: error.message || '签到失败，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // 订阅会员
  const handleSubscribe = async (type: 'monthly' | 'continuous_monthly') => {
    try {
      const result = await createSubscriptionOrder(type);

      if (result.error) {
        toast({
          title: '创建订单失败',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      // 检查是否返回表单提交参数
      if (result.payment_method === 'form_submit' && result.form_data && result.submit_url) {
        // 动态创建表单并提交
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.submit_url;
        form.style.display = 'none';

        // 添加所有表单字段
        Object.entries(result.form_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        // 提交表单（自动跳转到支付页面）
        document.body.appendChild(form);
        form.submit();
      } else {
        // 旧的跳转方式（兼容）
        navigate(`/order/${result.order_no}`);
      }
    } catch (error: any) {
      console.error('创建订阅订单失败:', error);
      toast({
        title: '创建订单失败',
        description: error.message || '创建订单失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 充值幻梦币
  const handleRecharge = async (skuCode: string) => {
    try {
      const result = await createCoinRechargeOrder(skuCode);

      if (result.error) {
        toast({
          title: '创建订单失败',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      // 检查是否返回表单提交参数
      if (result.payment_method === 'form_submit' && result.form_data && result.submit_url) {
        // 动态创建表单并提交
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.submit_url;
        form.style.display = 'none';

        // 添加所有表单字段
        Object.entries(result.form_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        // 提交表单（自动跳转到支付页面）
        document.body.appendChild(form);
        form.submit();
      } else {
        // 旧的跳转方式（兼容）
        navigate(`/order/${result.order_no}`);
      }
    } catch (error: any) {
      console.error('创建充值订单失败:', error);
      toast({
        title: '创建订单失败',
        description: error.message || '创建订单失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 获取交易类型显示文本
  const getTransactionTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      sign_in: '每日签到',
      recharge: '充值',
      consume: '消费',
      reward_send: '打赏',
      reward_receive: '收到打赏',
      refund: '退款',
    };
    return typeMap[type] || type;
  };

  // 获取交易类型颜色
  const getTransactionTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      sign_in: 'text-green-600',
      recharge: 'text-blue-600',
      consume: 'text-red-600',
      reward_send: 'text-orange-600',
      reward_receive: 'text-green-600',
      refund: 'text-gray-600',
    };
    return colorMap[type] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">订阅与钱包</h1>
        <p className="text-muted-foreground">管理您的会员订阅和幻梦币钱包</p>
      </div>

      <Tabs defaultValue="wallet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            幻梦币钱包
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            会员订阅
          </TabsTrigger>
        </TabsList>

        {/* 幻梦币钱包 Tab */}
        <TabsContent value="wallet" className="space-y-6">
          {/* 钱包余额卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                我的钱包
              </CardTitle>
              <CardDescription>幻梦币余额和统计信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg">
                  <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {wallet?.balance || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">当前余额</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {wallet?.total_earned || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">累计获得</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {wallet?.total_spent || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">累计消费</div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* 每日签到 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">每日签到</div>
                    <div className="text-sm text-muted-foreground">每天签到可获得10幻梦币</div>
                  </div>
                </div>
                <Button
                  onClick={handleCheckIn}
                  disabled={hasCheckedIn || checkingIn}
                  className="min-w-[100px]"
                >
                  {checkingIn ? '签到中...' : hasCheckedIn ? '已签到' : '签到'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 充值卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                充值幻梦币
              </CardTitle>
              <CardDescription>1元 = 10幻梦币</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {skus
                  .filter((sku) => sku.sku_code.startsWith('coin_'))
                  .map((sku) => {
                    const coinAmount = Math.round(sku.price * 10);
                    return (
                      <Card key={sku.id} className="cursor-pointer hover:border-primary transition-colors">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                            {coinAmount}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">幻梦币</div>
                          <div className="text-lg font-semibold mb-3">¥{sku.price}</div>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleRecharge(sku.sku_code)}
                          >
                            充值
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* 交易记录 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                交易记录
              </CardTitle>
              <CardDescription>最近的幻梦币交易记录</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无交易记录
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {getTransactionTypeText(transaction.type)}
                          </span>
                          {transaction.related_user && (
                            <span className="text-sm text-muted-foreground">
                              {transaction.type === 'reward_send' ? '→' : '←'}{' '}
                              {transaction.related_user.username}
                            </span>
                          )}
                        </div>
                        {transaction.description && (
                          <div className="text-sm text-muted-foreground">
                            {transaction.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(transaction.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-semibold ${getTransactionTypeColor(transaction.type)}`}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          余额: {transaction.balance_after}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 会员订阅 Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* 当前会员状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                会员状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.is_vip && subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Crown className="h-12 w-12 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold mb-1">HMNL会员</div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.subscription_type === 'monthly' ? '单月订阅' : '连续包月'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {subscription.status === 'active' ? '生效中' : '已过期'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">开始时间</div>
                      <div className="font-medium">
                        {new Date(subscription.start_date).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">到期时间</div>
                      <div className="font-medium">
                        {new Date(subscription.end_date).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>

                  {subscription.auto_renew && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      已开启自动续费
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <div className="text-lg font-medium mb-2">您还不是会员</div>
                  <div className="text-sm text-muted-foreground">
                    订阅会员享受更多专属权益
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 订阅套餐 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                订阅套餐
              </CardTitle>
              <CardDescription>选择适合您的订阅方式</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 单月订阅 */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-xl">单月订阅</CardTitle>
                    <CardDescription>按月订阅，灵活自由</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-primary mb-2">¥9.9</div>
                      <div className="text-sm text-muted-foreground">每月</div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe('monthly')}
                    >
                      立即订阅
                    </Button>
                  </CardContent>
                </Card>

                {/* 连续包月 */}
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">连续包月</CardTitle>
                      <Badge variant="default">推荐</Badge>
                    </div>
                    <CardDescription>首月优惠，自动续费</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-primary mb-2">
                        ¥5
                        <span className="text-lg text-muted-foreground ml-2">首月</span>
                      </div>
                      <div className="text-sm text-muted-foreground">后续每月¥8.8</div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe('continuous_monthly')}
                    >
                      立即订阅
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* 会员权益 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                会员权益
              </CardTitle>
              <CardDescription>订阅会员后即可享受以下权益</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">自定义IP属地</div>
                    <div className="text-sm text-muted-foreground">
                      会员可免费自定义IP属地显示
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg opacity-50">
                  <Gift className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">自定义头像框</div>
                    <div className="text-sm text-muted-foreground">即将推出</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg opacity-50">
                  <Sparkles className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">自定义聊天室气泡颜色</div>
                    <div className="text-sm text-muted-foreground">即将推出</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg opacity-50">
                  <Crown className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">自定义网站CSS样式</div>
                    <div className="text-sm text-muted-foreground">即将推出</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 订阅历史 */}
          {subscriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  订阅历史
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium mb-1">
                          {sub.subscription_type === 'monthly' ? '单月订阅' : '连续包月'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(sub.start_date).toLocaleDateString('zh-CN')} -{' '}
                          {new Date(sub.end_date).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <Badge
                        variant={
                          sub.status === 'active'
                            ? 'default'
                            : sub.status === 'expired'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {sub.status === 'active'
                          ? '生效中'
                          : sub.status === 'expired'
                          ? '已过期'
                          : '已取消'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}