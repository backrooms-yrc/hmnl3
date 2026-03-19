import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getChannelMessages, sendChannelMessage } from '@/db/api';
import type { ChannelMessage } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface ChannelChatRoomProps {
  channelId: string;
  channelName: string;
  height?: string;
  className?: string;
}

export function ChannelChatRoom({ 
  channelId, 
  channelName,
  height = 'calc(100vh - 16rem)', 
  className = '' 
}: ChannelChatRoomProps) {
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { profile } = useAuth();
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMessages();
    
    // 启动轮询
    startPolling();
    
    return () => {
      // 清理轮询
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [channelId]);

  const startPolling = () => {
    // 清除旧的轮询
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // 每2秒刷新一次消息（提高实时性）
    intervalRef.current = setInterval(() => {
      loadMessages(false);
    }, 2000);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const viewport = scrollViewportRef.current;
      if (viewport) {
        if (isInitialLoad.current) {
          viewport.scrollTop = viewport.scrollHeight;
          isInitialLoad.current = false;
        } else {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    });
  };

  const loadMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getChannelMessages(channelId);
      setMessages(data);
    } catch (error) {
      console.error('加载频道消息失败:', error);
      if (showLoading) {
        toast.error('加载消息失败');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    if (!profile) {
      toast.error('请先登录');
      return;
    }

    const messageContent = newMessage.trim();
    
    try {
      setSending(true);
      setNewMessage(''); // 立即清空输入框，提升用户体验
      
      // 发送消息
      await sendChannelMessage(channelId, messageContent);
      
      // 立即刷新消息列表
      await loadMessages(false);
      
      // 滚动到底部
      scrollToBottom();
      
      // 重置轮询计时器，确保及时获取新消息
      startPolling();
    } catch (error) {
      console.error('发送消息失败:', error);
      toast.error('发送消息失败');
      setNewMessage(messageContent); // 恢复消息内容
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
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

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`} style={{ height }}>
      {/* 频道标题 */}
      <div className="px-4 py-3 border-b bg-card">
        <h3 className="font-semibold text-sm">#{channelName} 频道聊天</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {messages.length} 条消息
        </p>
      </div>

      {/* 消息列表 */}
      <div 
        ref={scrollViewportRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">还没有消息，快来发送第一条消息吧！</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3 group">
              {message.profiles ? (
                <UserAvatar
                  profile={message.profiles}
                  size="sm"
                  className="shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">
                    {message.profiles?.username || '未知用户'}
                  </span>
                  {message.profiles?.is_verified && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <p className="text-sm break-words whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t bg-card">
        {profile ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                // Enter发送，Shift+Enter换行
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              placeholder="输入消息... (Enter发送)"
              disabled={sending}
              maxLength={500}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            请先登录后再发送消息
          </div>
        )}
      </div>
    </div>
  );
}
