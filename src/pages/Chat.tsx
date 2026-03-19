import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChatRoom } from '@/components/ChatRoom';
import { ChannelChatRoom } from '@/components/ChannelChatRoom';
import { getAllActiveChannels } from '@/db/api';
import type { Channel } from '@/types/types';
import { MessageSquare, Radio } from 'lucide-react';

export default function Chat() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const data = await getAllActiveChannels();
      // 只显示正在直播的频道
      const liveChannels = data.filter((ch: any) => ch.is_live);
      setChannels(liveChannels);
      if (liveChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(liveChannels[0]);
      }
    } catch (error) {
      console.error('加载频道失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto p-3 sm:p-4 md:p-6 xl:p-8 h-[calc(100vh-2rem)] xl:h-[calc(100vh-4rem)] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle className="text-xl xl:text-2xl">聊天室</CardTitle>
          <CardDescription>公共聊天室和频道聊天区</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs defaultValue="public" className="h-full flex flex-col">
            <div className="px-4 pt-4 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="public" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  公共聊天室
                </TabsTrigger>
                <TabsTrigger value="channels" className="flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  频道聊天
                  {channels.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
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
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : channels.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Radio className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">暂无直播频道</h3>
                  <p className="text-sm text-muted-foreground">
                    当前没有正在直播的频道，请稍后再来
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col xl:flex-row">
                  {/* 频道列表 */}
                  <div className="xl:w-64 border-b xl:border-b-0 xl:border-r bg-muted/30">
                    <div className="p-3 border-b">
                      <h3 className="font-semibold text-sm">正在直播</h3>
                    </div>
                    <div className="overflow-y-auto max-h-32 xl:max-h-full">
                      {channels.map((channel: any) => (
                        <button
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel)}
                          className={`w-full p-3 text-left border-b transition-colors ${
                            selectedChannel?.id === channel.id
                              ? 'bg-accent'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Radio className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">
                                {channel.name}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {channel.description || '暂无简介'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 频道聊天区 */}
                  <div className="flex-1 overflow-hidden">
                    {selectedChannel ? (
                      <ChannelChatRoom
                        channelId={selectedChannel.id}
                        channelName={selectedChannel.name}
                        height="100%"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">请选择一个频道</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
