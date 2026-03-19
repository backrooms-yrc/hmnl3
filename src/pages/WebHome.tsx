import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatRoom } from '@/components/ChatRoom';
import { ChannelChatRoom } from '@/components/ChannelChatRoom';
import { AnnouncementCarousel } from '@/components/home/AnnouncementCarousel';
import { ChannelList } from '@/components/home/ChannelList';
import { StreamPlayer } from '@/components/home/StreamPlayer';
import { 
  ExternalLink, Megaphone, Maximize2, X, MessageSquare, Radio, 
  Sparkles, TrendingUp, Zap, ArrowRight, Play, Users, 
  FileText, Bot, Compass, Star, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WebHome() {
  const navigate = useNavigate();
  const [selectedStream, setSelectedStream] = useState<{
    streamId: string | null;
    channelName: string;
    channelId?: string;
    m3u8Url?: string | null;
  } | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [channelListKey, setChannelListKey] = useState(0);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const closed = localStorage.getItem('announcement_closed');
    if (closed === 'true') {
      setShowAnnouncement(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChannelListKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(featureInterval);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
              setVisibleSections(prev => new Set(prev).add(sectionId));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observerRef.current?.observe(section));

    return () => observerRef.current?.disconnect();
  }, []);

  const handleChannelSelect = (streamId: string | null, channelName: string, channelId?: string, m3u8Url?: string | null, channelUrl?: string) => {
    if (channelId) {
      navigate(`/channel/${channelId}`);
    } else if (channelUrl) {
      navigate(`/channel/${channelUrl}`);
    } else {
      setSelectedStream({ streamId, channelName, channelId, m3u8Url });
      setImmersiveMode(false);
    }
  };

  const handleClosePlayer = () => {
    setSelectedStream(null);
    setImmersiveMode(false);
  };

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
    localStorage.setItem('announcement_closed', 'true');
  };

  const handleShowAnnouncement = () => {
    setShowAnnouncement(true);
    localStorage.removeItem('announcement_closed');
  };

  const toggleImmersiveMode = () => {
    setImmersiveMode(!immersiveMode);
  };

  const features = [
    { icon: Radio, title: '直播频道', desc: '精彩直播随时看', color: 'bg-[hsl(var(--md-sys-color-error))]' },
    { icon: FileText, title: '帖子广场', desc: '分享精彩内容', color: 'bg-[hsl(var(--md-sys-color-primary))]' },
    { icon: Bot, title: 'AI助手', desc: '智能对话体验', color: 'bg-[hsl(var(--md-sys-color-tertiary))]' },
    { icon: Users, title: '社区互动', desc: '实时聊天交流', color: 'bg-[hsl(var(--md-sys-color-secondary))]' },
  ];

  const stats = [
    { icon: Radio, label: '直播频道', value: '24h', color: 'text-[hsl(var(--md-sys-color-error))]' },
    { icon: FileText, label: '精彩帖子', value: '1000+', color: 'text-[hsl(var(--md-sys-color-primary))]' },
    { icon: Users, label: '活跃用户', value: '500+', color: 'text-[hsl(var(--md-sys-color-tertiary))]' },
    { icon: MessageSquare, label: '实时消息', value: '10k+', color: 'text-[hsl(var(--md-sys-color-secondary))]' },
  ];

  const quickLinks = [
    { icon: FileText, title: '帖子广场', desc: '浏览精彩帖子', path: '/posts', color: 'bg-[hsl(var(--md-sys-color-primary))]' },
    { icon: Sparkles, title: '幻霜论坛lite', desc: '探索精彩内容', path: '/forum', color: 'bg-[hsl(var(--md-sys-color-tertiary))]' },
    { icon: Bot, title: 'AI助手', desc: '智能对话体验', path: '/ai-chat', color: 'bg-[hsl(var(--md-sys-color-secondary))]' },
    { icon: Zap, title: '发布内容', desc: '分享你的想法', path: '/create-post', color: 'bg-[hsl(var(--md-sys-color-error))]' },
  ];

  if (immersiveMode && selectedStream) {
    return (
      <div className="fixed inset-0 bg-[hsl(var(--md-sys-color-background))] z-50 flex flex-col xl:flex-row">
        <div className="flex-1 flex flex-col">
          <StreamPlayer
            streamId={selectedStream.streamId}
            channelName={selectedStream.channelName}
            m3u8Url={selectedStream.m3u8Url}
            onClose={handleClosePlayer}
            hideCloseButton
            hidePlayerInfo
          />
        </div>
        <div className="xl:w-[400px] xl:shrink-0 border-t xl:border-t-0 xl:border-l border-[hsl(var(--md-sys-color-outline-variant))]">
          {selectedStream.channelId ? (
            <ChannelChatRoom
              channelId={selectedStream.channelId}
              channelName={selectedStream.channelName}
              height="100%"
            />
          ) : (
            <div className="h-full">
              <Card className="h-full rounded-none border-0 bg-[hsl(var(--md-sys-color-surface))]">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--md-sys-color-on-surface))]">公共聊天室</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ChatRoom height="calc(100vh - 120px)" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="fixed top-4 right-4 z-50 md-sys-shape-corner-full"
          onClick={toggleImmersiveMode}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--md-sys-color-background))]">
      {showAnnouncement ? (
        <AnnouncementCarousel isVisible={showAnnouncement} onClose={handleCloseAnnouncement} />
      ) : null}

      <section 
        data-section="hero"
        className={cn(
          "relative overflow-hidden bg-[hsl(var(--md-sys-color-surface-container-low))] home-section-animate",
          visibleSections.has('hero') && "home-section-visible"
        )}
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className={cn(
              "flex-1 text-center lg:text-left home-fade-in-up",
              isAnimating && "home-stagger-1"
            )}>
              <div className="inline-flex items-center gap-2 px-4 py-2 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-primary-container))] mb-6">
                <Sparkles className="w-4 h-4 text-[hsl(var(--md-sys-color-on-primary-container))]" />
                <span className="md-sys-typescale-label-large text-[hsl(var(--md-sys-color-on-primary-container))]">全新体验</span>
              </div>
              
              <h1 className="md-sys-typescale-display-large text-[hsl(var(--md-sys-color-on-surface))] mb-6">
                探索精彩世界
                <br />
                <span className="text-[hsl(var(--md-sys-color-primary))]">发现无限可能</span>
              </h1>
              
              <p className="md-sys-typescale-body-large text-[hsl(var(--md-sys-color-on-surface-variant))] mb-8 max-w-2xl mx-auto lg:mx-0">
                在这里寻找、发布和分享各种有趣的内容
                <br className="hidden sm:block" />
                直播、帖子、AI助手，一站式体验
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="h-12 px-8 md-sys-shape-corner-xl md-sys-typescale-label-large bg-[hsl(var(--md-sys-color-primary))] text-[hsl(var(--md-sys-color-on-primary))] hover:bg-[hsl(var(--md-sys-color-primary)/0.9)] home-button-transition" 
                  asChild
                >
                  <Link to="/posts">
                    <Compass className="w-5 h-5 mr-2" />
                    开始探索
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-12 px-8 md-sys-shape-corner-xl md-sys-typescale-label-large border-[hsl(var(--md-sys-color-outline))] text-[hsl(var(--md-sys-color-on-surface))] hover:bg-[hsl(var(--md-sys-color-surface-container-highest))] home-button-transition" 
                  asChild
                >
                  <Link to="/channels">
                    <Play className="w-5 h-5 mr-2" />
                    观看直播
                  </Link>
                </Button>
              </div>
            </div>

            <div className={cn(
              "flex-1 w-full max-w-md home-fade-in-up",
              isAnimating && "home-stagger-2"
            )}>
              <Card className="md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-surface-container-lowest))] border-0 md-sys-elevation-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="md-sys-typescale-title-small text-[hsl(var(--md-sys-color-on-surface-variant))]">热门功能</span>
                    <div className="inline-flex items-center gap-1 px-3 py-1 md-sys-shape-corner-full bg-[hsl(var(--md-sys-color-secondary-container))]">
                      <TrendingUp className="w-3 h-3 text-[hsl(var(--md-sys-color-on-secondary-container))]" />
                      <span className="md-sys-typescale-label-small text-[hsl(var(--md-sys-color-on-secondary-container))]">实时更新</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center gap-4 p-3 md-sys-shape-corner-lg transition-all duration-300 cursor-pointer home-feature-item",
                            activeFeature === index 
                              ? "bg-[hsl(var(--md-sys-color-primary-container)/0.5)] md-sys-elevation-1" 
                              : "hover:bg-[hsl(var(--md-sys-color-surface-container-highest))]"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 md-sys-shape-corner-lg flex items-center justify-center shadow-md transition-transform duration-300",
                            feature.color,
                            activeFeature === index && "scale-110"
                          )}>
                            <Icon className="w-6 h-6 text-[hsl(var(--md-sys-color-on-primary))]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="md-sys-typescale-title-small text-[hsl(var(--md-sys-color-on-surface))]">{feature.title}</h3>
                            <p className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">{feature.desc}</p>
                          </div>
                          {activeFeature === index && (
                            <ArrowRight className="w-5 h-5 text-[hsl(var(--md-sys-color-primary))]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section 
        data-section="stats"
        className={cn(
          "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 home-section-animate",
          visibleSections.has('stats') && "home-section-visible"
        )}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className={cn(
                  "p-4 md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-surface-container-lowest))] md-sys-elevation-1 text-center cursor-pointer home-stat-card home-fade-in-up",
                  isAnimating && `home-stagger-${index + 1}`
                )}
              >
                <Icon className={cn("w-8 h-8 mx-auto mb-2", stat.color)} />
                <div className="md-sys-typescale-headline-medium text-[hsl(var(--md-sys-color-on-surface))]">{stat.value}</div>
                <div className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section 
        data-section="quick-links"
        className={cn(
          "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 home-section-animate",
          visibleSections.has('quick-links') && "home-section-visible"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="md-sys-typescale-headline-medium text-[hsl(var(--md-sys-color-on-surface))] flex items-center gap-2">
              <Star className="w-6 h-6 text-[hsl(var(--md-sys-color-tertiary))]" />
              快速入口
            </h2>
            <p className="md-sys-typescale-body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">一键直达精彩内容</p>
          </div>
          {!showAnnouncement && (
            <Button 
              variant="outline" 
              onClick={handleShowAnnouncement} 
              className="h-10 px-4 md-sys-shape-corner-lg border-[hsl(var(--md-sys-color-outline))] text-[hsl(var(--md-sys-color-on-surface))] home-button-transition"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              查看公告
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                className={cn(
                  "group relative overflow-hidden md-sys-shape-corner-xl p-6 bg-[hsl(var(--md-sys-color-surface-container-lowest))] border border-[hsl(var(--md-sys-color-outline-variant))] transition-all duration-300 hover:md-sys-elevation-2 home-quick-link home-fade-in-up",
                  isAnimating && `home-stagger-${index + 1}`
                )}
              >
                <div className={cn(
                  "w-12 h-12 md-sys-shape-corner-lg flex items-center justify-center mb-4 text-[hsl(var(--md-sys-color-on-primary))] shadow-md",
                  item.color
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="md-sys-typescale-title-medium text-[hsl(var(--md-sys-color-on-surface))] mb-1">{item.title}</h3>
                <p className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">{item.desc}</p>
                <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-[hsl(var(--md-sys-color-on-surface-variant))] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </section>

      <section 
        data-section="channels"
        className={cn(
          "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 home-section-animate",
          visibleSections.has('channels') && "home-section-visible"
        )}
      >
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 xl:min-w-0 space-y-6">
            <Card className="md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-surface-container-lowest))] border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="md-sys-typescale-headline-medium text-[hsl(var(--md-sys-color-on-surface))] flex items-center gap-2">
                      <Radio className="w-6 h-6 text-[hsl(var(--md-sys-color-primary))]" />
                      直播频道
                    </CardTitle>
                    <CardDescription className="md-sys-typescale-body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">选择频道开始观看精彩直播</CardDescription>
                  </div>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm"
                    className="h-9 px-4 md-sys-shape-corner-lg border-[hsl(var(--md-sys-color-outline))] text-[hsl(var(--md-sys-color-on-surface))] home-button-transition"
                  >
                    <a
                      href="https://hmnl.20110208.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      旧版入口
                    </a>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {selectedStream && (
              <div className="space-y-4 animate-scale-in">
                <StreamPlayer
                  streamId={selectedStream.streamId}
                  channelName={selectedStream.channelName}
                  m3u8Url={selectedStream.m3u8Url}
                  onClose={handleClosePlayer}
                />
                <div className="flex justify-center">
                  <Button
                    onClick={toggleImmersiveMode}
                    variant="outline"
                    className="h-11 px-6 md-sys-shape-corner-xl border-[hsl(var(--md-sys-color-outline))] text-[hsl(var(--md-sys-color-on-surface))] home-button-transition"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    进入沉浸模式
                  </Button>
                </div>
              </div>
            )}

            <ChannelList 
              key={channelListKey} 
              onChannelSelect={handleChannelSelect} 
            />
          </div>

          <div className="xl:w-[400px] xl:shrink-0">
            <Card className="md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-surface-container-lowest))] border-0 overflow-hidden h-full">
              <CardHeader className="pb-3">
                <CardTitle className="md-sys-typescale-headline-medium text-[hsl(var(--md-sys-color-on-surface))] flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-[hsl(var(--md-sys-color-primary))]" />
                  实时聊天
                </CardTitle>
                <CardDescription className="md-sys-typescale-body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">与大家一起交流讨论</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {selectedStream && selectedStream.channelId ? (
                  <Tabs defaultValue="channel" className="h-full">
                    <div className="px-4 pb-3 border-b border-[hsl(var(--md-sys-color-outline-variant))]">
                      <TabsList className="grid w-full grid-cols-2 h-11 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-surface-container-highest))]">
                        <TabsTrigger value="channel" className="md-sys-typescale-label-large md-sys-shape-corner-md flex items-center gap-2">
                          <Radio className="w-4 h-4" />
                          频道聊天
                        </TabsTrigger>
                        <TabsTrigger value="public" className="md-sys-typescale-label-large md-sys-shape-corner-md flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          公共聊天
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="channel" className="m-0">
                      <ChannelChatRoom
                        channelId={selectedStream.channelId}
                        channelName={selectedStream.channelName}
                        height="500px"
                        className="xl:h-[700px]"
                      />
                    </TabsContent>
                    <TabsContent value="public" className="m-0">
                      <ChatRoom height="500px" className="xl:h-[700px]" />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <ChatRoom height="500px" className="xl:h-[800px]" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
