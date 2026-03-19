import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '@/db/api';
import type { Notification } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Bell, Check, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      loadNotifications();
    }
  }, [profile]);

  const loadNotifications = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const data = await getNotifications(profile.id);
      setNotifications(data);
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('标记失败:', error);
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!profile) return;
    
    try {
      await markAllNotificationsAsRead(profile.id);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast({
        title: '操作成功',
        description: '已标记所有通知为已读',
      });
    } catch (error) {
      console.error('标记失败:', error);
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast({
        title: '删除成功',
        description: '通知已删除',
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="container max-w-4xl mx-auto p-3 sm:p-4 md:p-6 xl:p-8">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold text-foreground mb-2">通知中心</h1>
          <p className="text-sm xl:text-base text-muted-foreground">
            {unreadCount > 0 ? `你有 ${unreadCount} 条未读通知` : '暂无未读通知'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <Check className="w-4 h-4 mr-2" />
            全部标记为已读
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full bg-muted" />
              </CardContent>
            </Card>
          ))
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">暂无通知</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const isLink = !!notification.link;

            return (
              <Card 
                key={notification.id}
                className={`${isLink ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${
                  !notification.is_read ? 'border-primary' : ''
                }`}
              >
                {isLink ? (
                  <Link 
                    to={notification.link || '#'} 
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base xl:text-lg">
                              {notification.title}
                            </CardTitle>
                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <CardDescription className="text-xs xl:text-sm">
                            {formatDate(notification.created_at)}
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除这条通知吗？
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(notification.id)}>
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm xl:text-base text-foreground whitespace-pre-wrap">
                        {notification.content}
                      </p>
                    </CardContent>
                  </Link>
                ) : (
                  <>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base xl:text-lg">
                              {notification.title}
                            </CardTitle>
                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <CardDescription className="text-xs xl:text-sm">
                            {formatDate(notification.created_at)}
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除这条通知吗？
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(notification.id)}>
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm xl:text-base text-foreground whitespace-pre-wrap">
                        {notification.content}
                      </p>
                    </CardContent>
                  </>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
