import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useDevice } from '@/contexts/DeviceContext';
import { forumAPI } from '@/utils/forum-api';
import { getAllActiveChannels } from '@/db/api';
import { ForumPost } from '@/types/forum';
import type { Channel } from '@/types/types';
import ForumPostCard from '@/components/forum/ForumPostCard';
import { ChatRoom } from '@/components/ChatRoom';
import { ChannelChatRoom } from '@/components/ChannelChatRoom';
import { Search, Radio, MessageSquare, RefreshCw } from 'lucide-react';

export default function ForumPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useDevice();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelsLoading, setChannelsLoading] = useState(true);

  const limit = 12;

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadChannels = async () => {
    try {
      setChannelsLoading(true);
      const data = await getAllActiveChannels();
      const liveChannels = data
        .filter((ch: any) => ch.is_live)
        .sort((a: any, b: any) => {
          if (a.is_live && !b.is_live) return -1;
          if (!a.is_live && b.is_live) return 1;
          return 0;
        });
      setChannels(liveChannels);
      if (liveChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(liveChannels[0]);
      }
    } catch (error) {
      console.error('加载频道失败:', error);
    } finally {
      setChannelsLoading(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await forumAPI.getPosts({
        page: currentPage,
        limit,
      });
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('加载帖子失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载帖子列表，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile ? (
        <div className="flex h-screen overflow-hidden">
          <div className="w-[480px] shrink-0 border-r flex flex-col">
            <div className="h-1/2 border-b flex flex-col">
              <Card className="flex-1 flex flex-col overflow-hidden rounded-none border-0">
                <CardHeader className="shrink-0 py-3">
                  <CardTitle className="text-base">直播播放器</CardTitle>
                  <CardDescription className="text-xs">选择频道观看直播</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-3">
                  {channelsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground text-sm">加载中...</p>
                    </div>
                  ) : channels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <Radio className="w-12 h-12 text-muted-foreground/50 mb-3" />
                      <h3 className="text-sm font-semibold mb-1">暂无直播频道</h3>
                      <p className="text-xs text-muted-foreground">
                        当前没有正在直播的频道
                      </p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="mb-2 flex gap-2 flex-wrap">
                        {channels.map((channel: any) => (
                          <button
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel)}
                            className={`px-3 py-1.5 rounded-md border transition-colors text-sm ${
                              selectedChannel?.id === channel.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-accent border-border'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Radio className="w-3 h-3" />
                              <span className="font-medium">{channel.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="flex-1 bg-black rounded-md flex items-center justify-center">
                        {selectedChannel ? (
                          <div className="text-center text-white">
                            <Radio className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                            <h3 className="text-base font-bold mb-1">{selectedChannel.name}</h3>
                            <p className="text-xs text-gray-400">
                              {selectedChannel.stream_id 
                                ? `推流ID: ${selectedChannel.stream_id}` 
                                : '使用自定义m3u8播放源'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              播放器集成开发中...
                            </p>
                          </div>
                        ) : (
                          <p className="text-white text-sm">请选择一个频道</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <Card className="flex-1 flex flex-col overflow-hidden rounded-none border-0">
                <CardHeader className="shrink-0 py-3">
                  <CardTitle className="text-base">聊天室</CardTitle>
                  <CardDescription className="text-xs">公共聊天室和频道聊天</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-hidden p-0">
                  <div className="h-full flex flex-col">
                    <div className="px-3 pt-2 border-b">
                      <div className="grid w-full grid-cols-2 h-8">
                        <button
                          className={`flex items-center justify-center gap-1.5 text-xs border-b-2 ${
                            selectedChannel ? 'border-transparent text-muted-foreground' : 'border-primary text-foreground'
                          }`}
                          onClick={() => setSelectedChannel(null)}
                        >
                          <MessageSquare className="w-3 h-3" />
                          公共
                        </button>
                        <button
                          className={`flex items-center justify-center gap-1.5 text-xs border-b-2 ${
                            selectedChannel ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                          }`}
                        >
                          <Radio className="w-3 h-3" />
                          频道
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {selectedChannel ? (
                        <ChannelChatRoom
                          channelId={selectedChannel.id}
                          channelName={selectedChannel.name}
                          height="100%"
                        />
                      ) : (
                        <ChatRoom height="100%" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="border-b bg-card sticky top-0 z-10">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h1 className="text-xl font-bold mb-1">幻霜论坛lite</h1>
                    <p className="text-sm text-muted-foreground">探索精彩内容，分享你的故事</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      刷新
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="搜索帖子..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      搜索
                    </Button>
                  </div>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  共找到 {total} 个帖子
                </div>
              </div>
            </div>

            <div className="px-6 py-8">
              {loading ? (
                <div className="grid gap-6 grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="h-64">
                      <CardContent className="p-6 space-y-3">
                        <Skeleton className="h-6 w-3/4 bg-muted" />
                        <Skeleton className="h-4 w-full bg-muted" />
                        <Skeleton className="h-4 w-2/3 bg-muted" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">暂无帖子</p>
                  <p className="text-muted-foreground text-sm mt-2">还没有人发布帖子，快来抢沙发吧！</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 grid-cols-3">
                    {posts.map((post) => (
                      <ForumPostCard key={post.id} post={post} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        上一页
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        第 {currentPage} / {totalPages} 页
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex gap-3 flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold mb-1">幻霜论坛lite</h1>
                    <p className="text-sm text-muted-foreground">探索精彩内容，分享你的故事</p>
                  </div>
                  <Button variant="outline" onClick={handleRefresh} size="sm">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex gap-3 flex-col">
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="搜索帖子..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    搜索
                  </Button>
                </div>
              </div>

              <div className="mt-3 text-sm text-muted-foreground">
                共找到 {total} 个帖子
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            {loading ? (
              <div className="grid gap-6 grid-cols-1">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-64">
                    <CardContent className="p-6 space-y-3">
                      <Skeleton className="h-6 w-3/4 bg-muted" />
                      <Skeleton className="h-4 w-full bg-muted" />
                      <Skeleton className="h-4 w-2/3 bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">暂无帖子</p>
                <p className="text-muted-foreground text-sm mt-2">还没有人发布帖子，快来抢沙发吧！</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 grid-cols-1">
                  {posts.map((post) => (
                    <ForumPostCard key={post.id} post={post} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
