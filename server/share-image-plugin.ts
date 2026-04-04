import type { Plugin, ViteDevServer } from 'vite';
import { createHash } from 'crypto';
import { mkdir, readFile, writeFile, unlink, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve(process.cwd(), '.cache/share-images');
const CACHE_TTL = 1000 * 60 * 60;
const MAX_CACHE_SIZE = 100 * 1024 * 1024;

interface ShareImageRequest {
  channelName: string;
  channelDescription: string | null;
  channelIcon: string | null;
  channelUrl: string;
}

interface CacheEntry {
  filePath: string;
  createdAt: number;
  size: number;
}

function generateCacheKey(data: ShareImageRequest): string {
  const content = `${data.channelName}|${data.channelDescription || ''}|${data.channelIcon || ''}|${data.channelUrl}`;
  return createHash('md5').update(content).digest('hex');
}

async function ensureCacheDir(): Promise<void> {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true });
  }
}

async function getCacheEntry(cacheKey: string): Promise<Buffer | null> {
  const filePath = path.join(CACHE_DIR, `${cacheKey}.png`);
  
  if (!existsSync(filePath)) {
    return null;
  }
  
  try {
    const stats = await stat(filePath);
    const now = Date.now();
    
    if (now - stats.mtimeMs > CACHE_TTL) {
      await unlink(filePath);
      return null;
    }
    
    return await readFile(filePath);
  } catch {
    return null;
  }
}

async function setCacheEntry(cacheKey: string, buffer: Buffer): Promise<void> {
  await ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `${cacheKey}.png`);
  await writeFile(filePath, buffer);
}

async function cleanupCache(): Promise<void> {
  try {
    if (!existsSync(CACHE_DIR)) return;
    
    const files = await readdir(CACHE_DIR);
    const now = Date.now();
    let totalSize = 0;
    const entries: CacheEntry[] = [];
    
    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = await stat(filePath);
      
      if (now - stats.mtimeMs > CACHE_TTL) {
        await unlink(filePath);
        continue;
      }
      
      totalSize += stats.size;
      entries.push({
        filePath,
        createdAt: stats.mtimeMs,
        size: stats.size,
      });
    }
    
    if (totalSize > MAX_CACHE_SIZE && entries.length > 0) {
      entries.sort((a, b) => a.createdAt - b.createdAt);
      
      while (totalSize > MAX_CACHE_SIZE * 0.8 && entries.length > 0) {
        const entry = entries.shift()!;
        await unlink(entry.filePath);
        totalSize -= entry.size;
      }
    }
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}

async function deleteCacheEntry(cacheKey: string): Promise<boolean> {
  const filePath = path.join(CACHE_DIR, `${cacheKey}.png`);
  
  if (existsSync(filePath)) {
    await unlink(filePath);
    return true;
  }
  
  return false;
}

export function shareImagePlugin(): Plugin {
  return {
    name: 'vite-plugin-share-image',
    
    configureServer(server: ViteDevServer) {
      cleanupCache().catch(console.error);
      
      setInterval(() => {
        cleanupCache().catch(console.error);
      }, CACHE_TTL);

      server.middlewares.use('/api/share-image', async (req, res, next) => {
        const url = req.url || '';
        const method = req.method?.toUpperCase();

        if (method === 'POST' && url === '/generate') {
          try {
            const chunks: Buffer[] = [];
            
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            
            const body: ShareImageRequest = JSON.parse(Buffer.concat(chunks).toString());
            
            if (!body.channelName || !body.channelUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ error: '缺少必要参数' }));
              return;
            }

            const cacheKey = generateCacheKey(body);
            let imageBuffer = await getCacheEntry(cacheKey);
            
            if (!imageBuffer) {
              res.statusCode = 202;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ 
                message: '图片需要客户端生成',
                cacheKey,
                requiresClientGeneration: true 
              }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('X-Cache-Key', cacheKey);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(imageBuffer);
          } catch (error) {
            console.error('Share image generation error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ 
              error: '图片生成失败', 
              message: error instanceof Error ? error.message : '未知错误' 
            }));
          }
          return;
        }

        if (method === 'POST' && url.startsWith('/cache')) {
          try {
            const chunks: Buffer[] = [];
            
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const { cacheKey, imageData } = body;
            
            if (!cacheKey || !imageData) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ error: '缺少必要参数' }));
              return;
            }

            const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            await setCacheEntry(cacheKey, buffer);
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ 
              success: true,
              message: '缓存已保存',
              cacheKey 
            }));
          } catch (error) {
            console.error('Cache save error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: '缓存保存失败' }));
          }
          return;
        }

        if (method === 'DELETE' && url.startsWith('/cache/')) {
          const cacheKey = url.replace('/cache/', '');
          
          try {
            const deleted = await deleteCacheEntry(cacheKey);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ 
              success: deleted,
              message: deleted ? '缓存已清理' : '缓存不存在' 
            }));
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: '缓存清理失败' }));
          }
          return;
        }

        if (method === 'GET' && url.startsWith('/cache/')) {
          const cacheKey = url.replace('/cache/', '');
          
          try {
            const imageBuffer = await getCacheEntry(cacheKey);
            
            if (!imageBuffer) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ error: '缓存不存在或已过期' }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(imageBuffer);
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: '获取缓存失败' }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default shareImagePlugin;
