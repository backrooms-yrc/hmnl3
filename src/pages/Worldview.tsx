import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDevice } from '@/contexts/DeviceContext';
import { worldviewAPI } from '@/utils/worldview-api';
import { getAllActiveChannels } from '@/db/api';
import { Worldview } from '@/types/worldview';
import type { Channel } from '@/types/types';
import PostCard from '@/components/worldview/PostCard';
import LoginDialog from '@/components/worldview/LoginDialog';
import { ChatRoom } from '@/components/ChatRoom';
import { ChannelChatRoom } from '@/components/ChannelChatRoom';
import { Plus, Search, LogIn, LogOut, User, Radio, MessageSquare } from 'lucide-react';

export default function WorldviewPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useDevice();

  const [posts, setPosts] = useState<Worldview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 直播频道相关状态
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelsLoading, setChannelsLoading] = useState(true);

  const limit = 12;

  useEffect(() => {
    checkAuth();
    loadChannels();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [currentPage, category]);

  const checkAuth = () => {
    const authenticated = worldviewAPI.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      setCurrentUser(worldviewAPI.getCurrentUser());
    }
  };

  const loadChannels = async () => {
    try {
      setChannelsLoading(true);
      const data = await getAllActiveChannels();
      // 只显示正在直播的频道，并按直播状态排序（正在直播的排在前面）
      const liveChannels = data
        .filter((ch: any) => ch.is_live)
        .sort((a: any, b: any) => {
          // is_live为true的排在前面
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
      const params: any = {
        page: currentPage,
        limit,
      };
      if (category && category !== "all") {
        params.category = category;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const data = await worldviewAPI.getWorldviews(params);
      setPosts(data.worldviews);
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

  const handleSearch = () => {
    setCurrentPage(1);
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    try {
      await worldviewAPI.toggleLike(postId);
      loadPosts();
    } catch (error) {
      console.error('点赞失败:', error);
      toast({
        title: '操作失败',
        description: '点赞操作失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    worldviewAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast({
      title: '已登出',
      description: '您已成功登出幻境界',
    });
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
    navigate('/worldview/create');
  };

  const isPostLiked = (post: Worldview) => {
    if (!currentUser) return false;
    return post.likingUsers?.some((user) => user.id === currentUser.id) || false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* PC端：左右两栏布局 */}
      {!isMobile ? (
        <div className="flex h-screen overflow-hidden">
          {/* 左侧：播放器+聊天室 */}
          <div className="w-[480px] shrink-0 border-r flex flex-col">
            {/* 播放器区域 */}
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
                      {/* 频道选择器 */}
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

                      {/* 播放器区域 */}
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

            {/* 聊天室区域 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Card className="flex-1 flex flex-col overflow-hidden rounded-none border-0">
                <CardHeader className="shrink-0 py-3">
                  <CardTitle className="text-base">聊天室</CardTitle>
                  <CardDescription className="text-xs">公共聊天室和频道聊天</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-hidden p-0">
                  <Tabs defaultValue="public" className="h-full flex flex-col">
                    <div className="px-3 pt-2 border-b">
                      <TabsList className="grid w-full grid-cols-2 h-8">
                        <TabsTrigger value="public" className="flex items-center gap-1.5 text-xs">
                          <MessageSquare className="w-3 h-3" />
                          公共
                        </TabsTrigger>
                        <TabsTrigger value="channels" className="flex items-center gap-1.5 text-xs">
                          <Radio className="w-3 h-3" />
                          频道
                          {channels.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs px-1">
                              {channels.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="public" className="flex-1 m-0 overflow-hidden">
                      <ChatRoom height="100%" />
                    </TabsContent>

                    <TabsContent value="channels" className="flex-1 m-0 overflow-hidden">
                      {selectedChannel ? (
                        <ChannelChatRoom
                          channelId={selectedChannel.id}
                          channelName={selectedChannel.name}
                          height="100%"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground text-sm">请选择一个频道</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 右侧：帖子列表 */}
          <div className="flex-1 overflow-y-auto">
            <div className="border-b bg-card sticky top-0 z-10">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h1 className="text-xl font-bold mb-1">幻境界</h1>
                    <p className="text-sm text-muted-foreground">探索无限可能的世界观</p>
                  </div>

                  <div className="flex gap-2">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
                          <User className="w-4 h-4" />
                          <span>{currentUser?.username}</span>
                        </div>
                        <Button onClick={handleCreatePost} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          发布帖子
                        </Button>
                        <Button variant="outline" onClick={handleLogout} size="sm">
                          <LogOut className="w-4 h-4 mr-2" />
                          登出
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setLoginDialogOpen(true)} size="sm">
                        <LogIn className="w-4 h-4 mr-2" />
                        登录
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="搜索标题、描述或标签..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch}>
                      <Search className="w-4 h-4 mr-2" />
                      搜索
                    </Button>
                  </div>

                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="所有分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有分类</SelectItem>
                      <SelectItem value="默认分类">默认分类</SelectItem>
                      <SelectItem value="科幻">科幻</SelectItem>
                      <SelectItem value="奇幻">奇幻</SelectItem>
                      <SelectItem value="现实">现实</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Card key={index} className="h-96">
                      <Skeleton className="w-full h-48 bg-muted" />
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-6 w-3/4 bg-muted" />
                        <Skeleton className="h-4 w-full bg-muted" />
                        <Skeleton className="h-4 w-2/3 bg-muted" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">对不起！</p>
                  <p className="text-muted-foreground text-sm mt-2">"幻境界"板块由 omthins 独立运营。近日，由于一些不可抗力因素，omthins宣布关闭"幻境界"帖子发布平台（包含api接口服务）。不过无需担心，我们计划于下周重新接管"幻境界"平台。敬请期待！</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 grid-cols-3">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        isLiked={isPostLiked(post)}
                      />
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
        /* 移动端：原有布局 */
        <>
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex gap-3 flex-col">
                <div>
                  <h1 className="text-xl font-bold mb-1">幻境界</h1>
                  <p className="text-sm text-muted-foreground">探索无限可能的世界观</p>
                </div>

                <div className="flex gap-2 flex-col">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
                        <User className="w-4 h-4" />
                        <span>{currentUser?.username}</span>
                      </div>
                      <Button onClick={handleCreatePost} className="w-full" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        发布帖子
                      </Button>
                      <Button variant="outline" onClick={handleLogout} className="w-full" size="sm">
                        <LogOut className="w-4 h-4 mr-2" />
                        登出
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setLoginDialogOpen(true)} className="w-full" size="sm">
                      <LogIn className="w-4 h-4 mr-2" />
                      登录
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex gap-3 flex-col">
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="搜索标题、描述或标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    搜索
                  </Button>
                </div>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="所有分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有分类</SelectItem>
                    <SelectItem value="默认分类">默认分类</SelectItem>
                    <SelectItem value="科幻">科幻</SelectItem>
                    <SelectItem value="奇幻">奇幻</SelectItem>
                    <SelectItem value="现实">现实</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Card key={index} className="h-96">
                    <Skeleton className="w-full h-48 bg-muted" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-6 w-3/4 bg-muted" />
                      <Skeleton className="h-4 w-full bg-muted" />
                      <Skeleton className="h-4 w-2/3 bg-muted" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">对不起！</p>
                <p className="text-muted-foreground text-sm mt-2">"幻境界"板块由 omthins 独立运营。近日，由于一些不可抗力因素，omthins宣布关闭"幻境界"帖子发布平台（包含api接口服务）。不过无需担心，我们计划于下周重新接管"幻境界"平台。敬请期待！</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 grid-cols-1">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      isLiked={isPostLiked(post)}
                    />
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
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onSuccess={checkAuth}
      />
    </div>
  );
}
