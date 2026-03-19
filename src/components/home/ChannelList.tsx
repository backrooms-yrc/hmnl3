import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Radio, ChevronLeft, ChevronRight, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllChannels, addChannelUrlToExistingChannels } from '@/db/api';
import type { Channel } from '@/types/types';

function ChannelItemSkeleton() {
  return (
    <div className="w-full p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-16 flex-shrink-0" />
      </div>
    </div>
  );
}

function ChannelListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5" />
            频道列表
          </CardTitle>
          <Skeleton className="h-8 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ChannelItemSkeleton key={i} />
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ChannelItem {
  id: string;
  stream_id: string | null; // 推流ID可能为null（使用自定义m3u8链接时）
  channel_name: string;
  channel_description: string | null;
  channel_logo: string | null;
  m3u8_url: string | null; // 自定义m3u8链接
  channel_url?: string; // 频道唯一URL
  like_count?: number; // 点赞数
  username?: string;
  avatar_url?: string | null;
  source: 'admin' | 'user'; // 频道来源
  is_live?: boolean; // 直播状态
}

interface ChannelListProps {
  onChannelSelect: (streamId: string | null, channelName: string, channelId?: string, m3u8Url?: string | null, channelUrl?: string) => void;
}

export function ChannelList({ onChannelSelect }: ChannelListProps) {
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true); // 折叠展开状态
  const limit = 10;

  useEffect(() => {
    // 先更新频道URL，再加载频道列表
    const updateChannels = async () => {
      try {
        await addChannelUrlToExistingChannels();
        await loadChannels();
      } catch (error) {
        console.error('更新频道URL失败:', error);
        // 即使失败也要加载频道列表
        await loadChannels();
      }
    };
    updateChannels();
  }, [page, search]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      // 获取所有频道（包括管理员频道和用户频道）
      const result = await getAllChannels(page, limit, search);
      
      console.log('ChannelList 获取到的原始数据:', result.data);

      // 转换为统一的ChannelItem格式
      const allChannels: ChannelItem[] = result.data.map((ch: any) => {
        // 判断频道来源
        const isAdminChannel = ch.source === 'admin' && (ch.creator?.role === 'admin' || ch.creator?.is_super_admin === true);
        
        const channelItem = {
          id: ch.id,
          stream_id: ch.stream_id,
          channel_name: ch.name,
          channel_description: ch.description,
          channel_logo: ch.cover_image,
          m3u8_url: ch.m3u8_url || null, // 自定义m3u8链接
          channel_url: ch.channel_url,
          like_count: ch.like_count || 0,
          username: ch.owner?.username,
          avatar_url: ch.owner?.avatar_url,
          source: isAdminChannel ? 'admin' as const : 'user' as const,
          is_live: ch.is_live ?? false,
        };
        
        console.log('ChannelList 转换后的频道项:', channelItem);
        
        return channelItem;
      });

      console.log('ChannelList 所有转换后的频道:', allChannels);

      setChannels(allChannels);
      setTotal(result.count);
    } catch (error) {
      console.error('加载频道列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (loading) {
    return <ChannelListSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5" />
            频道列表
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                折叠
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                展开
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索频道..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 频道列表 */}
        <div className="space-y-2">
          {loading ? (
            // 加载骨架屏
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))
          ) : channels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无频道
            </div>
          ) : (
            channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => {
                  console.log('ChannelList 点击频道:', {
                    stream_id: channel.stream_id,
                    channel_name: channel.channel_name,
                    id: channel.id,
                    m3u8_url: channel.m3u8_url,
                    channel_url: channel.channel_url
                  });
                  // 使用 channel_url 或 id 作为跳转标识
                  const urlIdentifier = channel.channel_url || channel.id;
                  onChannelSelect(channel.stream_id, channel.channel_name, channel.id, channel.m3u8_url, urlIdentifier);
                }}
                className={`w-full p-3 border rounded-lg hover:bg-accent transition-colors text-left ${
                  channel.source === 'admin' ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 台标/头像 */}
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0 relative">
                    {channel.channel_logo ? (
                      <img
                        src={channel.channel_logo}
                        alt={channel.channel_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/images/logo/channel-placeholder.png"
                        alt={channel.channel_name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* 管理员频道角标 */}
                    {channel.source === 'admin' && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-bl p-0.5">
                        <Shield className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* 频道信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{channel.channel_name}</h4>
                      {channel.source === 'admin' && (
                        <Badge variant="default" className="text-xs px-1 py-0 h-4 gap-0.5">
                          <Shield className="w-2.5 h-2.5" />
                          官方
                        </Badge>
                      )}
                    </div>
                    {channel.channel_description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {channel.channel_description}
                      </p>
                    )}
                    {channel.username && (
                      <p className="text-xs text-muted-foreground">
                        @{channel.username}
                      </p>
                    )}
                  </div>

                  {/* 直播状态指示器 */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    {channel.source === 'user' && (
                      <Badge 
                        variant={channel.is_live ? "default" : "secondary"}
                        className="text-xs px-2 py-0.5 h-5"
                      >
                        {channel.is_live ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1"></div>
                            直播中
                          </>
                        ) : (
                          '未在直播'
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一页
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              下一页
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
        </CardContent>
      )}
    </Card>
  );
}
