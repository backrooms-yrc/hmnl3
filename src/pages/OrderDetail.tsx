import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getOrder } from '@/db/api';
import type { Order } from '@/types/types';
import { ArrowLeft, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';

export default function OrderDetail() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!orderNo) {
      navigate('/subscription-wallet');
      return;
    }

    loadOrder();
  }, [user, orderNo, navigate]);

  // 轮询订单状态（仅当订单状态为pending时）
  useEffect(() => {
    if (!order || order.status !== 'pending') {
      setPolling(false);
      return;
    }

    setPolling(true);
    const interval = setInterval(() => {
      loadOrder(true);
    }, 2000);

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [order?.status]);

  const loadOrder = async (silent = false) => {
    if (!orderNo) return;

    try {
      if (!silent) setLoading(true);

      const orderData = await getOrder(orderNo);

      if (!orderData) {
        toast({
          title: '订单不存在',
          description: '未找到该订单',
          variant: 'destructive',
        });
        navigate('/subscription-wallet');
        return;
      }

      // 检查订单是否属于当前用户
      if (orderData.user_id !== user?.id) {
        toast({
          title: '无权访问',
          description: '您无权查看此订单',
          variant: 'destructive',
        });
        navigate('/subscription-wallet');
        return;
      }

      setOrder(orderData);
    } catch (error) {
      console.error('加载订单失败:', error);
      if (!silent) {
        toast({
          title: '加载失败',
          description: '无法加载订单信息，请稍后重试',
          variant: 'destructive',
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 获取订单状态显示文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待支付',
      paid: '已支付',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消',
      refunded: '已退款',
      partial_refunded: '部分退款',
    };
    return statusMap[status] || status;
  };

  // 获取订单状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'paid':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'shipped':
        return <Package className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // 获取订单类型显示文本
  const getOrderTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      subscription: '会员订阅',
      coin_recharge: '幻梦币充值',
      product: '商品购买',
    };
    return typeMap[type] || type;
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

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/subscription-wallet')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

      {/* 订单状态卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <CardTitle className="text-2xl">{getStatusText(order.status)}</CardTitle>
                <CardDescription className="mt-1">
                  订单号: {order.order_no}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={
                order.status === 'paid' || order.status === 'completed'
                  ? 'default'
                  : order.status === 'pending'
                  ? 'secondary'
                  : 'destructive'
              }
              className="text-lg px-4 py-2"
            >
              {getStatusText(order.status)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 待支付状态：显示支付二维码 */}
      {order.status === 'pending' && order.wechat_pay_url && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>扫码支付</CardTitle>
            <CardDescription>
              请使用微信扫描下方二维码完成支付
              {polling && <span className="ml-2 text-primary">（正在等待支付...）</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeDataUrl text={order.wechat_pay_url} width={256} />
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  ¥{order.total_amount}
                </div>
                <div className="text-sm text-muted-foreground">
                  支付完成后页面将自动更新
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 已支付状态：显示订单详情 */}
      {order.status !== 'pending' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>订单详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.order_type === 'subscription' && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-lg mb-1">会员订阅已生效</div>
                    <div className="text-sm text-muted-foreground">
                      {order.subscription_type === 'monthly' ? '单月订阅' : '连续包月'}
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
            )}

            {order.order_type === 'coin_recharge' && order.coin_amount && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-lg mb-1">充值成功</div>
                    <div className="text-sm text-muted-foreground">
                      已到账 {order.coin_amount} 幻梦币
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 订单信息 */}
      <Card>
        <CardHeader>
          <CardTitle>订单信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">订单类型</div>
              <div className="font-medium">{getOrderTypeText(order.order_type)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">订单金额</div>
              <div className="font-medium text-lg text-primary">¥{order.total_amount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">创建时间</div>
              <div className="font-medium">
                {new Date(order.created_at).toLocaleString('zh-CN')}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">更新时间</div>
              <div className="font-medium">
                {new Date(order.updated_at).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>

          {order.subscription_type && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-1">订阅类型</div>
                <div className="font-medium">
                  {order.subscription_type === 'monthly' ? '单月订阅' : '连续包月'}
                </div>
              </div>
            </>
          )}

          {order.coin_amount && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-1">幻梦币数量</div>
                <div className="font-medium text-yellow-600 dark:text-yellow-400">
                  {order.coin_amount} 幻梦币
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="mt-6 flex justify-center">
        <Button onClick={() => navigate('/subscription-wallet')}>
          返回订阅与钱包
        </Button>
      </div>
    </div>
  );
}