import { usePerformanceMode } from '@/contexts/PerformanceModeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Zap, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Settings() {
  const { performanceMode, setPerformanceMode } = usePerformanceMode();

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-decoration" />
        
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-3 gap-1">
              <SettingsIcon className="w-3 h-3" />
              系统设置
            </Badge>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-foreground mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                偏好设置
              </span>
            </h1>
            <p className="text-sm xl:text-base text-muted-foreground">管理您的应用偏好设置和性能选项</p>
          </div>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4 sm:space-y-6">
          <Card className="animate-fade-in" style={{ animationDelay: '50ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                性能模式
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                启用性能模式以提升应用响应速度和降低资源消耗
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 min-h-touch p-3 rounded-mdui-lg bg-muted/50">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="performance-mode" className="text-sm sm:text-base font-medium cursor-pointer">
                    启用性能模式
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    关闭动画效果和嵌入式内容以提升性能
                  </p>
                </div>
                <Switch
                  id="performance-mode"
                  checked={performanceMode}
                  onCheckedChange={setPerformanceMode}
                />
              </div>

              {performanceMode && (
                <Alert className="rounded-mdui-lg">
                  <Info className="h-4 w-4 shrink-0" />
                  <AlertDescription className="text-xs sm:text-sm">
                    性能模式已启用。以下功能将被优化：
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>首页嵌入式网页将替换为跳转按钮</li>
                      <li>页面过渡动画将被禁用</li>
                      <li>部分视觉效果将被简化</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">关于</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                HMNL直播讨论站 - 专注于直播讨论的在线社区平台
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-mdui-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">版本号</span>
                  <Badge variant="secondary">1.0.0 公测版</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-mdui-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">构建号</span>
                  <span className="text-sm font-mono">build v410</span>
                </div>
                <div className="p-3 rounded-mdui-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-center text-muted-foreground">
                    © 2025 HMNL直播讨论站
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
