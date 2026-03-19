import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TestSpecialPlayer() {
  const [m3u8Url, setM3u8Url] = useState('http://ahbczp.live.ahct.lv1.vcache.cn:9090/live/program/live/cctv1hd8m/8000000/mnf.m3u8');
  const [playerUrl, setPlayerUrl] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testPlayer = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/functions/v1/m3u8-special-player?url=${encodeURIComponent(m3u8Url)}`;
    
    addLog('生成播放器URL: ' + url);
    setPlayerUrl(url);
  };

  const testDirectAccess = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/functions/v1/m3u8-special-player?url=${encodeURIComponent(m3u8Url)}`;
    
    addLog('直接访问Edge Function: ' + url);
    
    try {
      const response = await fetch(url);
      addLog(`响应状态: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('Content-Type');
      addLog(`Content-Type: ${contentType}`);
      
      const text = await response.text();
      addLog(`响应长度: ${text.length} 字符`);
      addLog(`响应前100字符: ${text.substring(0, 100)}`);
      
      // 检查是否包含重定向信息
      if (text.includes('原始URL:') && text.includes('最终URL:')) {
        addLog('✅ 检测到重定向处理逻辑');
      }
      
      if (response.ok) {
        addLog('✅ Edge Function响应成功');
      } else {
        addLog('❌ Edge Function响应失败');
      }
    } catch (error) {
      addLog('❌ 请求失败: ' + (error as Error).message);
    }
  };

  const testRedirect = async () => {
    addLog('测试m3u8链接重定向...');
    addLog('原始URL: ' + m3u8Url);
    
    try {
      const response = await fetch(m3u8Url, {
        method: 'HEAD',
        redirect: 'follow',
      });
      
      addLog(`响应状态: ${response.status} ${response.statusText}`);
      addLog(`最终URL: ${response.url}`);
      
      if (response.url !== m3u8Url) {
        addLog('✅ 检测到重定向: ' + m3u8Url + ' -> ' + response.url);
      } else {
        addLog('ℹ️ 没有重定向，使用原始URL');
      }
    } catch (error) {
      addLog('❌ 测试重定向失败: ' + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>特殊播放器测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">M3U8 URL</label>
            <Input
              value={m3u8Url}
              onChange={(e) => setM3u8Url(e.target.value)}
              placeholder="输入m3u8链接"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testPlayer}>生成播放器</Button>
            <Button onClick={testDirectAccess} variant="outline">测试直接访问</Button>
            <Button onClick={testRedirect} variant="outline">测试重定向</Button>
            <Button onClick={() => setLogs([])} variant="ghost">清空日志</Button>
          </div>

          {playerUrl && (
            <div>
              <p className="text-sm font-medium mb-2">播放器URL:</p>
              <p className="text-xs text-muted-foreground break-all mb-2">{playerUrl}</p>
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={playerUrl}
                  className="absolute top-0 left-0 w-full h-full border-2 border-primary"
                  title="特殊播放器测试"
                  sandbox="allow-same-origin allow-scripts"
                  allow="autoplay"
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">日志:</p>
            <div className="bg-muted p-4 rounded-md h-64 overflow-y-auto font-mono text-xs">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
