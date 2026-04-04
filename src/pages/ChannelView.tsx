import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatRoom } from '@/components/ChatRoom';
import { ChannelChatRoom } from '@/components/ChannelChatRoom';
import { StreamPlayer } from '@/components/home/StreamPlayer';
import { ShareImageButton } from '@/components/share';
import { 
  X, Maximize2, Minimize2, Heart, Share2, ArrowLeft, 
  Radio, MessageSquare, Copy, Check, AlertCircle
} from 'lucide-react';
import { getChannelById, getChannelByUrl, likeChannel, unlikeChannel, checkUserLikedChannel, checkChannelExists } from '@/db/api';
import type { Channel } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

function ChannelViewSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>

            <div className="flex justify-center">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="xl:col-span-1">
            <Card variant="glass" className="overflow-hidden h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 pb-3 border-b">
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="p-4 space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelNotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <div>
              <CardTitle>频道不存在</CardTitle>
              <CardDescription>抱歉，找不到您要访问的频道</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            返回上一页
          </Button>
          <Button asChild>
            <Link to="/channels">浏览频道列表</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChannelView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const channelUrl = searchParams.get('url');
  const channelId = id || searchParams.get('id');
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadChannel();
  }, [channelId, channelUrl]);

  const loadChannel = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`[${new Date().toISOString()}] 尝试访问频道: {id: ${channelId}, url: ${channelUrl}}`);
      
      let data: Channel | null = null;
      
      if (channelId) {
        data = await getChannelById(channelId);
      } else if (channelUrl) {
        data = await getChannelByUrl(channelUrl);
      }
      
      if (data) {
        setChannel(data);
        setLikeCount(data.like_count || 0);
        const liked = await checkUserLikedChannel(data.id);
        setIsLiked(liked);
        console.log(`[${new Date().toISOString()}] 成功加载频道: ${data.id} (${data.name})`);
      } else {
        console.error(`[${new Date().toISOString()}] 频道不存在: {id: ${channelId}, url: ${channelUrl}}`);
        setError('抱歉，找不到您要访问的频道');
        toast({
          title: '频道不存在',
          description: '该频道可能已被删除或不存在，请尝试访问其他频道。',
          variant: 'destructive',
          duration: 5000
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载频道失败，请稍后重试';
      console.error(`[${new Date().toISOString()}] 加载频道失败: ${errorMessage}`, err);
      setError(errorMessage);
      toast({
        title: '加载失败',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!channel) return;
    try {
      if (isLiked) {
        await unlikeChannel(channel.id);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        toast({ title: '已取消点赞' });
      } else {
        await likeChannel(channel.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        toast({ title: '点赞成功' });
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    if (!channel) return;
    const shareUrl = `${window.location.origin}/channel/${channel.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: channel.name,
          text: channel.description || '来看看这个频道',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        toast({ title: '链接已复制到剪贴板' });
      }
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  if (loading) {
    return <ChannelViewSkeleton />;
  }

  if (error || !channel) {
    return <ChannelNotFound />;
  }

  if (immersiveMode) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col xl:flex-row">
        <div className="flex-1 flex flex-col">
          <StreamPlayer
            streamId={channel.stream_id}
            channelName={channel.name}
            m3u8Url={channel.m3u8_url}
            onClose={() => setImmersiveMode(false)}
            hideCloseButton
            hidePlayerInfo
          />
        </div>
        <div className="xl:w-[400px] xl:shrink-0 border-t xl:border-t-0 xl:border-l">
          <ChannelChatRoom
            channelId={channel.id}
            channelName={channel.name}
            height="100%"
          />
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="fixed top-4 right-4 z-50"
          onClick={() => setImmersiveMode(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl xl:text-2xl">
                        {channel.name}
                      </CardTitle>
                      <Badge variant="secondary">
                        <Radio className="w-3 h-3 mr-1" />
                        频道
                      </Badge>
                      {channel.is_live && (
                        <Badge variant="filledError" className="animate-pulse">
                          直播中
                        </Badge>
                      )}
                    </div>
                    {channel.description && (
                      <CardDescription className="text-sm">
                        {channel.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isLiked ? "default" : "outline"}
                            size="icon"
                            onClick={handleToggleLike}
                            className={isLiked ? "bg-rose-500 hover:bg-rose-600" : ""}
                          >
                            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isLiked ? '取消点赞' : '点赞'} ({likeCount})</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outlined"
                            size="icon"
                            onClick={handleShare}
                          >
                            {copySuccess ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <Share2 className="w-5 h-5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>分享频道</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <ShareImageButton
                      channelName={channel.name}
                      channelDescription={channel.description}
                      channelIcon={channel.cover_image}
                      channelId={channel.id}
                      variant="outlined"
                      size="icon"
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <StreamPlayer
              streamId={channel.stream_id}
              channelName={channel.name}
              m3u8Url={channel.m3u8_url}
              onClose={() => {}}
              hideCloseButton
            />

            <div className="flex justify-center">
              <Button
                onClick={() => setImmersiveMode(true)}
                variant="outline"
                className="gap-2 rounded-mdui-xl"
              >
                <Maximize2 className="w-4 h-4" />
                进入沉浸模式
              </Button>
            </div>
          </div>

          <div className="xl:col-span-1">
            <Card variant="glass" className="overflow-hidden h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl xl:text-2xl flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  实时聊天
                </CardTitle>
                <CardDescription>与大家一起交流讨论</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="channel" className="h-full">
                  <div className="px-4 pb-3 border-b">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="channel" className="flex items-center gap-2">
                        <Radio className="w-4 h-4" />
                        频道聊天
                      </TabsTrigger>
                      <TabsTrigger value="public" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        公共聊天
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="channel" className="m-0">
                    <ChannelChatRoom
                      channelId={channel.id}
                      channelName={channel.name}
                      height="500px"
                      className="xl:h-[700px]"
                    />
                  </TabsContent>
                  <TabsContent value="public" className="m-0">
                    <ChatRoom height="500px" className="xl:h-[700px]" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
