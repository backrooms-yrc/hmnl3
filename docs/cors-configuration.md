# CORS 跨域配置指南

## 概述

本文档说明项目的CORS（跨域资源共享）配置，确保开发环境和生产环境的API请求能够正常工作。

## 开发环境配置

### Vite 开发服务器代理

在 `vite.config.ts` 中配置了以下代理规则：

| 代理路径 | 目标服务器 | 说明 |
|---------|-----------|------|
| `/api/forum` | `https://hmediapost.newblock.online/api/friend` | 论坛API |
| `/api/worldview` | `https://worldviewplatform.newblock.online/api` | 世界观API |
| `/api/ai` | `https://d.lconai.com` | AI聊天API |
| `/api/live` | `https://nchat.live/api` | 直播API |

### 开发服务器CORS配置

```typescript
server: {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-App-Id'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
  },
}
```

## 生产环境配置

### 允许的来源域名

```typescript
const PROD_ORIGINS = [
  'https://hmnl3.20110208.xyz',
  'https://nchat.live',
  'https://hmediapost.newblock.online',
  'https://worldviewplatform.newblock.online',
];
```

### 服务器端CORS响应头配置

生产环境需要在后端服务器配置以下响应头：

```http
Access-Control-Allow-Origin: https://hmnl3.20110208.xyz
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, X-App-Id, X-Request-Id, Cache-Control
Access-Control-Expose-Headers: Content-Range, X-Total-Count, X-Request-Id
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Nginx 配置示例

```nginx
server {
    listen 443 ssl;
    server_name hmnl3.20110208.xyz;

    # SSL配置...

    location /api/ {
        # CORS配置
        add_header 'Access-Control-Allow-Origin' $http_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, X-App-Id, X-Request-Id, Cache-Control' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Range, X-Total-Count, X-Request-Id' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' '86400' always;

        # 处理预检请求
        if ($request_method = 'OPTIONS') {
            return 204;
        }

        # 代理到后端服务
        proxy_pass http://backend;
    }
}
```

### Cloudflare Workers 配置示例

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, X-App-Id',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  const response = await fetch(request)
  
  // 添加CORS头
  const newResponse = new Response(response.body, response)
  newResponse.headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') || '*')
  newResponse.headers.set('Access-Control-Allow-Credentials', 'true')
  
  return newResponse
}
```

## 前端API客户端配置

### 环境自适应URL

所有API客户端已配置为根据环境自动选择正确的URL：

```typescript
const isDev = import.meta.env.DEV;
const baseUrl = isDev ? '/api/forum' : 'https://hmediapost.newblock.online/api/friend';
```

### CORS工具函数

使用 `src/utils/cors.ts` 提供的工具函数：

```typescript
import { getApiUrl, corsFetch, createCorsAwareHeaders } from '@/utils/cors';

// 获取API URL
const url = getApiUrl('/posts', 'forum');

// 使用corsFetch发送请求
const data = await corsFetch<ForumListResponse>('/posts', {}, 'forum');

// 创建带CORS感知的请求头
const headers = createCorsAwareHeaders({ 'X-Custom-Header': 'value' });
```

## 常见CORS错误及解决方案

### 1. 预检请求失败

**错误信息**: `Response to preflight request doesn't pass access control check`

**解决方案**:
- 确保服务器正确响应OPTIONS请求
- 检查 `Access-Control-Allow-Headers` 是否包含所有请求头

### 2. 凭证模式错误

**错误信息**: `The value of the 'Access-Control-Allow-Credentials' header is ''`

**解决方案**:
- 当使用 `credentials: 'include'` 时，服务器必须返回 `Access-Control-Allow-Credentials: true`
- 不能使用 `Access-Control-Allow-Origin: *`，必须指定具体域名

### 3. 来源不被允许

**错误信息**: `The value of the 'Access-Control-Allow-Origin' header must not be '*'`

**解决方案**:
- 使用凭证模式时，服务器必须返回具体的允许来源
- 动态返回请求的Origin头

## 测试CORS配置

### 使用curl测试预检请求

```bash
curl -X OPTIONS https://hmnl3.20110208.xyz/api/v1/live/room-url \
  -H "Origin: https://hmnl3.20110208.xyz" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

### 使用浏览器开发者工具

1. 打开开发者工具 (F12)
2. 切换到 Network 标签
3. 筛选 OPTIONS 请求
4. 检查响应头是否包含正确的CORS头

## 安全建议

1. **生产环境不要使用 `Access-Control-Allow-Origin: *`**
2. **限制允许的HTTP方法**，只开放必要的方法
3. **限制允许的请求头**，只开放必要的头
4. **使用HTTPS**，确保传输安全
5. **设置合理的Max-Age**，减少预检请求频率
