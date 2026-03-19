import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getChatMessages, createChatMessage, deleteChatMessage } from '@/db/api';
import type { ChatMessage } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ReportButton } from '@/components/ReportButton';
import { useToast } from '@/hooks/use-toast';
import { Send, Trash2, Search, X } from 'lucide-react';
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

interface ChatRoomProps {
  /** 聊天室高度，默认为 'calc(100vh - 16rem)' */
  height?: string;
  /** 是否显示标题，默认为 false */
  showTitle?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function ChatRoom({ height = 'calc(100vh - 16rem)', showTitle = false, className = '' }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    loadMessages();
    
    // 每5秒刷新一次消息
    const interval = setInterval(() => {
      loadMessages(false);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // 搜索过滤逻辑
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = messages.filter(msg => 
      msg.content.toLowerCase().includes(query) ||
      msg.author?.username.toLowerCase().includes(query)
    );
    setFilteredMessages(filtered);
  }, [searchQuery, messages]);

  useEffect(() => {
    // 滚动到底部（仅在聊天室容器内滚动，不影响页面）
    // 搜索时不自动滚动
    if (!searchQuery) {
      scrollToBottom();
    }
  }, [filteredMessages, searchQuery]);

  const scrollToBottom = () => {
    // 使用 requestAnimationFrame 确保 DOM 已更新
    requestAnimationFrame(() => {
      const viewport = scrollViewportRef.current;
      if (viewport) {
        // 直接设置 scrollTop 到最大值，只在容器内滚动，不影响页面
        if (isInitialLoad.current) {
          // 首次加载立即滚动
          viewport.scrollTop = viewport.scrollHeight;
          isInitialLoad.current = false;
        } else {
          // 后续平滑滚动
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
      if (showLoading) {
        setLoading(true);
      }
      const data = await getChatMessages(100);
      setMessages(data);
    } catch (error) {
      console.error('加载消息失败:', error);
      if (showLoading) {
        toast({
          title: '加载失败',
          description: '无法加载聊天消息',
          variant: 'destructive',
        });
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      toast({
        title: '错误',
        description: '请输入消息内容',
        variant: 'destructive',
      });
      return;
    }

    if (!profile) {
      toast({
        title: '错误',
        description: '请先登录',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      await createChatMessage(newMessage, profile.id);
      setNewMessage('');
      await loadMessages(false);
    } catch (error) {
      console.error('发送失败:', error);
      toast({
        title: '发送失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  // 防止输入框获得焦点时页面滚动
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // 阻止默认的滚动行为
    e.preventDefault();
    // 确保输入框在视口内，但不滚动页面
    setTimeout(() => {
      e.target.scrollIntoView({ 
        behavior: 'auto', 
        block: 'nearest',
        inline: 'nearest'
      });
    }, 100);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteChatMessage(messageId);
      setMessages(messages.filter(m => m.id !== messageId));
      toast({
        title: '删除成功',
        description: '消息已删除',
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diff / 60000);
    const diffHours = Math.floor(diff / 3600000);
    const diffDays = Math.floor(diff / 86400000);

    if (diffDays === 0) {
      if (diffMinutes < 1) return '刚刚';
      if (diffMinutes < 60) return `${diffMinutes}分钟前`;
      if (diffHours < 24) return `${diffHours}小时前`;
    }
    
    if (diffDays === 1) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleString('zh-CN', { 
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const canDeleteMessage = (message: ChatMessage) => {
    if (!profile) return false;
    if (profile.role === 'admin' || profile.is_super_admin) return true;
    return profile.id === message.author_id;
  };

  return (
    <div className={`flex flex-col overflow-hidden bg-card rounded-lg border ${className}`} style={{ height }}>
      {/* 标题（可选） */}
      {showTitle && (
        <div className="shrink-0 border-b px-4 xl:px-6 py-3 xl:py-4">
          <h3 className="text-lg xl:text-xl font-semibold text-foreground">聊天室</h3>
          <p className="text-sm text-muted-foreground">实时交流讨论</p>
        </div>
      )}
      
      {/* 搜索框 */}
      <div className="shrink-0 border-b px-4 xl:px-6 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索消息或用户名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-10 h-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-2">
            找到 {filteredMessages.length} 条消息
          </p>
        )}
      </div>
      
      {/* 消息列表 */}
      <div 
        ref={scrollViewportRef}
        className="flex-1 px-4 xl:px-6 overflow-y-auto overflow-x-hidden"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div ref={messagesContainerRef} className="space-y-4 py-4">
          {loading ? (
            <p className="text-center text-muted-foreground">加载中...</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 xl:py-12">
              {searchQuery ? '未找到匹配的消息' : '还没有消息，快来发送第一条消息吧！'}
            </p>
          ) : (
            filteredMessages.map((message) => {
              const isOwn = profile?.id === message.author_id;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 xl:gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* 头像 */}
                  {message.author && (
                    <div className="shrink-0">
                      <UserAvatar 
                        profile={message.author} 
                        size="md" 
                        clickable
                      />
                    </div>
                  )}
                  
                  {/* 消息内容 */}
                  <div className={`flex-1 min-w-0 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`flex items-center gap-2 mb-1 flex-wrap ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {message.author && (
                        <>
                          <span className={`font-medium text-sm ${isOwn ? 'text-primary' : 'text-foreground'}`}>
                            {message.author.username}
                          </span>
                          {message.author.is_super_admin && (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                              超管
                            </span>
                          )}
                          {!message.author.is_super_admin && message.author.role === 'admin' && (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                              管理员
                            </span>
                          )}
                          {message.author.is_verified && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                              入驻
                            </span>
                          )}
                          {message.author.is_real_verified && (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-green-600 text-white">
                              已实名
                            </span>
                          )}
                          {message.author.titles && message.author.titles.length > 0 && (
                            message.author.titles.map((title, index) => (
                              <span key={index} className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border">
                                {title}
                              </span>
                            ))
                          )}
                        </>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    
                    <div className={`flex items-start gap-2 max-w-[85%] xl:max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`rounded-lg px-3 xl:px-4 py-2 text-sm xl:text-base ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center gap-1">
                        {/* 举报按钮 */}
                        {!isOwn && message.author && (
                          <ReportButton
                            reportType="message"
                            targetId={message.id}
                            targetName={`${message.author.username}的消息`}
                            variant="ghost"
                            size="sm"
                            showText={false}
                          />
                        )}
                        
                        {/* 删除按钮 */}
                        {canDeleteMessage(message) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0">
                                <Trash2 className="w-3 h-3 xl:w-4 xl:h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除这条消息吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMessage(message.id)}>
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 输入框 */}
      <div className="shrink-0 border-t p-3 xl:p-4">
        {profile ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="输入消息..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onFocus={handleInputFocus}
              disabled={sending}
              className="flex-1"
              maxLength={500}
            />
            <Button type="submit" disabled={sending || !newMessage.trim()} size="icon" className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            请先登录后再发送消息
          </p>
        )}
      </div>
    </div>
  );
}
