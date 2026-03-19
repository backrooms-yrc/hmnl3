import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Radio, User, Calendar, Clock, Play } from 'lucide-react';
import { getAllActiveChannels } from '@/db/api';
import type { Channel } from '@/types/types';
import { useDevice } from '@/contexts/DeviceContext';
import { useNavigate } from 'react-router-dom';

export default function ChannelList() {
  const { isMobile } = useDevice();
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    filterChannels();
  }, [searchQuery, channels]);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const data = await getAllActiveChannels();
      console.log('频道列表页面加载的数据:', data);
      const sortedChannels = data.sort((a: any, b: any) => {
        if (a.is_live && !b.is_live) return -1;
        if (!a.is_live && b.is_live) return 1;
        return 0;
      });
      console.log('排序后的频道:', sortedChannels);
      setChannels(sortedChannels);
      setFilteredChannels(sortedChannels);
    } catch (error) {
      console.error('加载频道失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterChannels = () => {
    if (!searchQuery.trim()) {
      setFilteredChannels(channels);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = channels.filter((channel) =>
      channel.name.toLowerCase().includes(query) ||
      channel.description?.toLowerCase().includes(query)
    );
    setFilteredChannels(filtered);
  };

  const handleSearch = () => {
    filterChannels();
  };

  const handleChannelClick = (channelId: string) => {
    navigate(`/channel/${channelId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-decoration" />
        
        <div className={`${isMobile ? 'px-4' : 'container mx-auto px-6'} py-8 md:py-12 relative z-10`}>
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-3 gap-1">
              <Radio className="w-3 h-3" />
              直播频道
            </Badge>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-foreground mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                频道列表
              </span>
            </h1>
            <p className="text-sm xl:text-base text-muted-foreground">浏览所有直播频道</p>
          </div>

          <div className={`flex gap-3 mt-6 animate-fade-in ${isMobile ? 'flex-col' : 'flex-row'}`} style={{ animationDelay: '100ms' }}>
            <Input
              placeholder="搜索频道名称或简介..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              variant="filled"
              className={`${isMobile ? 'w-full' : 'w-80'} h-12 rounded-mdui-xl`}
            />
            <Button onClick={handleSearch} className="h-12 px-6 rounded-mdui-xl gap-2">
              <Search className="w-4 h-4" />
              搜索
            </Button>
          </div>

          <div className="mt-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '150ms' }}>
            共找到 {filteredChannels.length} 个频道
          </div>
        </div>
      </section>

      <section className={`${isMobile ? 'px-4' : 'container mx-auto px-6'} py-4`}>
        {loading ? (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredChannels.length === 0 ? (
          <Card variant="filled" className="py-12">
            <CardContent className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-mdui-full bg-muted flex items-center justify-center">
                <Radio className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-2">暂无频道</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? '没有找到匹配的频道，请尝试其他关键词' : '当前没有可用的频道'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {filteredChannels.map((channel, index) => (
              <Card 
                key={channel.id} 
                className="overflow-hidden hover-lift cursor-pointer animate-fade-in group"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleChannelClick(channel.id)}
              >
                <div className="relative h-48 bg-black flex items-center justify-center overflow-hidden">
                  {channel.cover_image ? (
                    <img
                      src={channel.cover_image}
                      alt={channel.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src="/images/logo/channel-placeholder.png"
                      alt={channel.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-primary ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  {channel.is_live && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="filledError" className="animate-pulse gap-1">
                        <Radio className="w-3 h-3" />
                        直播中
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {channel.name}
                    {!channel.is_live && (
                      <Badge variant="secondary" className="text-xs">
                        离线
                      </Badge>
                    )}
                  </CardTitle>
                  {channel.description && (
                    <CardDescription className="line-clamp-2">
                      {channel.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {channel.user_id && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>所属用户ID: {channel.user_id.slice(0, 8)}...</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>创建于: {formatDate(channel.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>更新于: {formatDate(channel.updated_at)}</span>
                  </div>

                  <Button 
                    variant="outlined" 
                    className="w-full mt-2 rounded-mdui-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChannelClick(channel.id);
                    }}
                  >
                    进入频道
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
