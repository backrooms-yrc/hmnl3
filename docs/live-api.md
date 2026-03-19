# HMNL直播平台 API 文档

## 基础信息

- **基础链接**: `https://hmnl3.20110208.xyz`
- **API版本**: `v1`
- **API前缀**: `/api/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 目录

1. [通用说明](#通用说明)
2. [直播间URL获取](#1-直播间url获取)
3. [播放器URL获取](#2-播放器url获取)
4. [频道信息获取](#3-频道信息获取)
5. [频道列表获取](#4-频道列表获取)
6. [直播状态获取](#5-直播状态获取)
7. [批量直播状态获取](#6-批量直播状态获取)
8. [频道搜索](#7-频道搜索)
9. [热门频道获取](#8-热门频道获取)
10. [推荐频道获取](#9-推荐频道获取)
11. [错误码说明](#错误码说明)
12. [集成指南](#集成指南)

---

## 通用说明

### 请求头

所有API请求应包含以下请求头：

```
Content-Type: application/json
Accept: application/json
```

需要认证的接口需添加：

```
Authorization: Bearer <token>
```

### 响应格式

所有API响应采用统一的JSON格式：

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123def"
}
```

错误响应格式：

```json
{
  "success": false,
  "data": null,
  "message": "频道不存在",
  "error": {
    "code": "CHANNEL_NOT_FOUND",
    "message": "频道不存在",
    "details": {
      "provided_params": {
        "channel_id": "invalid-id"
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123def"
}
```

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问，权限不足 |
| 404 | 资源不存在 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |
| 503 | 服务暂时不可用 |

---

## 1. 直播间URL获取

获取直播间的推流地址和播放地址，用于主播推流或观众观看。

### 请求信息

- **端点**: `/api/v1/live/room-url`
- **方法**: `GET`
- **权限**: 公开（推流地址需要认证）

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| channel_id | string | 否 | 频道ID，与channel_url二选一 |
| channel_url | string | 否 | 频道URL标识，与channel_id二选一 |
| stream_id | string | 否 | 推流ID，优先级最高 |

### 请求示例

```bash
# 通过频道ID获取
curl -X GET "https://hmnl3.20110208.xyz/api/v1/live/room-url?channel_id=abc123"

# 通过频道URL获取
curl -X GET "https://hmnl3.20110208.xyz/api/v1/live/room-url?channel_url=my-live-channel"

# 通过推流ID获取
curl -X GET "https://hmnl3.20110208.xyz/api/v1/live/room-url?stream_id=stream_abc123"
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "channel_id": "550e8400-e29b-41d4-a716-446655440000",
    "channel_name": "我的直播间",
    "channel_url": "my-live-channel",
    "stream_id": "stream_abc123",
    "rtmp_push_url": "rtmp://live.hmnl3.20110208.xyz:1935/live",
    "rtmp_push_key": "stream_abc123",
    "hls_play_url": "https://live.hmnl3.20110208.xyz/live/stream_abc123.m3u8",
    "flv_play_url": "wss://live.hmnl3.20110208.xyz/live/stream_abc123.flv",
    "web_play_url": "https://hmnl3.20110208.xyz/channel/my-live-channel",
    "is_live": true,
    "created_at": "2024-01-15T10:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123def"
}
```

### 响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| channel_id | string | 频道唯一标识 |
| channel_name | string | 频道名称 |
| channel_url | string | 频道URL标识 |
| stream_id | string | 推流ID |
| rtmp_push_url | string | RTMP推流服务器地址 |
| rtmp_push_key | string | RTMP推流密钥 |
| hls_play_url | string | HLS播放地址 |
| flv_play_url | string | FLV播放地址（WebSocket） |
| web_play_url | string | 网页播放地址 |
| is_live | boolean | 是否正在直播 |
| created_at | string | 频道创建时间 |

### 使用注意事项

1. 推流地址（rtmp_push_url + rtmp_push_key）仅供主播使用，请勿泄露
2. 播放地址可公开分享给观众
3. 建议使用HLS格式播放，兼容性最好
4. FLV格式延迟更低，适合实时互动场景

---

## 2. 播放器URL获取

获取频道播放器的访问地址和嵌入代码。

### 请求信息

- **端点**: `/api/v1/live/player-url`
- **方法**: `GET`
- **权限**: 公开

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| channel_id | string | 否 | 频道ID，与channel_url二选一 |
| channel_url | string | 否 | 频道URL标识，与channel_id二选一 |
| format | string | 否 | 播放格式：hls、flv、auto（默认auto） |
| quality | string | 否 | 画质：high、medium、low、auto（默认auto） |

### 请求示例

```bash
# 获取播放器地址
curl -X GET "https://hmnl3.20110208.xyz/api/v1/live/player-url?channel_url=my-live-channel&format=hls&quality=high"
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "channel_id": "550e8400-e29b-41d4-a716-446655440000",
    "channel_name": "我的直播间",
    "channel_url": "my-live-channel",
    "player_url": "https://hmnl3.20110208.xyz/player/my-live-channel",
    "embed_url": "https://hmnl3.20110208.xyz/embed/my-live-channel",
    "stream_urls": {
      "hls": "https://live.hmnl3.20110208.xyz/live/stream_abc123.m3u8",
      "flv": "wss://live.hmnl3.20110208.xyz/live/stream_abc123.flv"
    },
    "stream_id": "stream_abc123",
    "is_live": true,
    "quality": "high",
    "format": "hls"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123def"
}
```

### 响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| player_url | string | 播放器页面地址 |
| embed_url | string | 嵌入播放器地址 |
| stream_urls | object | 各格式播放地址 |
| stream_urls.hls | string | HLS播放地址 |
| stream_urls.flv | string | FLV播放地址 |
| quality | string | 当前画质设置 |
| format | string | 当前播放格式 |

### 嵌入播放器示例

```html
<iframe 
  src="https://hmnl3.20110208.xyz/embed/my-live-channel" 
  width="100%" 
  height="400px" 
  frameborder="0" 
  allowfullscreen
  allow="autoplay; encrypted-media"
></iframe>
```

---

## 3. 频道信息获取

获取频道的详细信息，包括基本信息、主播信息、统计数据等。

### 请求信息

- **端点**: `/api/v1/channel/info`
- **方法**: `GET`
- **权限**: 公开

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| channel_id | string | 否 | 频道ID，与channel_url二选一 |
| channel_url | string | 否 | 频道URL标识，与channel_id二选一 |
| include_stats | boolean | 否 | 是否包含统计数据（默认false） |

### 请求示例

```bash
# 获取频道信息（含统计数据）
curl -X GET "https://hmnl3.20110208.xyz/api/v1/channel/info?channel_url=my-live-channel&include_stats=true"
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "我的直播间",
    "description": "欢迎来到我的直播间，每天晚上8点准时开播！",
    "cover_image": "https://cdn.hmnl3.20110208.xyz/covers/cover.jpg",
    "channel_url": "my-live-channel",
    "stream_id": "stream_abc123",
    "is_live": true,
    "is_active": true,
    "like_count": 12580,
    "viewer_count": 356,
    "owner": {
      "id": "user_123",
      "username": "主播小明",
      "avatar_url": "https://cdn.hmnl3.20110208.xyz/avatars/avatar.jpg",
      "is_verified": true
    },
    "stats": {
      "total_views": 125000,
      "total_likes": 12580,
      "followers": 8500
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123def"
}
```

### 响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 频道唯一标识 |
| name | string | 频道名称 |
| description | string | 频道简介 |
| cover_image | string | 频道封面图片URL |
| channel_url | string | 频道URL标识 |
| stream_id | string | 推流ID |
| is_live | boolean | 是否正在直播 |
| is_active | boolean | 频道是否启用 |
| like_count | number | 点赞数 |
| viewer_count | number | 当前观看人数 |
| owner | object | 主播信息 |
| stats | object | 统计数据（需include_stats=true） |

---

## 4. 频道列表获取

获取频道列表，支持分页、搜索、筛选和排序。

### 请求信息

- **端点**: `/api/v1/channel/list`
- **方法**: `GET`
- **权限**: 公开

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码（默认1） |
| limit | number | 否 | 每页数量（默认20，最大100） |
| search | string | 否 | 搜索关键词 |
| is_live | boolean | 否 | 筛选直播状态 |
| sort_by | string | 否 | 排序字段：created_at、like_count、viewer_count |
| sort_order | string | 否 | 排序方向：asc、desc（默认desc） |

### 请求示例

```bash
# 获取正在直播的频道列表
curl -X GET "https://hmnl3.20110208.xyz/api/v1/channel/list?is_live=true&sort_by=viewer_count&limit=10"

# 搜索频道
curl -X GET "https://hmnl3.20110208.xyz/api/v1/channel/list?search=游戏&sort_by=like_count"
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "游戏直播",
        "description": "每天游戏直播",
        "cover_image": "https://cdn.hmnl3.20110208.xyz/covers/cover1.jpg",
        "channel_url": "game-live",
        "stream_id": "stream_001",
        "is_live": true,
        "is_active": true,
        "like_count": 5000,
        "viewer_count": 1200,
        "owner": {
          "id": "user_001",
          "username": "游戏主播",
          "avatar_url": "https://cdn.hmnl3.20110208.xyz/avatars/avatar1.jpg",
          "is_verified": true
        },
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasMore": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123def"
}
```

---

## 5. 直播状态获取

获取单个频道的直播状态信息。

### 请求信息

- **端点**: `/api/v1/live/status`
- **方法**: `GET`
- **权限**: 公开

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| channel_id | string | 否 | 频道ID，与channel_url二选一 |
| channel_url | string | 否 | 频道URL标识，与channel_id二选一 |

### 请求示例

```bash
curl -X GET "https://hmnl3.20110208.xyz/api/v1/live/status?channel_url=my-live-channel"
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "channel_id": "550e8400-e29b-41d4-a716-446655440000",
    "channel_name": "我的直播间",
    "channel_url": "my-live-channel",
    "is_live": true,
    "viewer_count": 356,
    "started_at": "2024-01-15T08:00:00.000Z",
    "duration": 9000
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123def"
}
```

### 响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| is_live | boolean | 是否正在直播 |
| viewer_count | number | 当前观看人数 |
| started_at | string | 直播开始时间（未直播时为null） |
| duration | number | 直播时长（秒，未直播时为null） |

---

## 6. 批量直播状态获取

批量获取多个频道的直播状态。

### 请求信息

- **端点**: `/api/v1/live/status/batch`
- **方法**: `POST`
- **权限**: 公开

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| channel_ids | string[] | 是 | 频道ID数组（最多50个） |

### 请求示例

```bash
curl -X POST "https://hmnl3.20110208.xyz/api/v1/live/status/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "channel_ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "660e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "channels": [
      {
        "channel_id": "550e8400-e29b-41d4-a716-446655440000",
        "channel_name": "我的直播间",
        "is_live": true,
        "viewer_count": 356
      },
      {
        "channel_id": "660e8400-e29b-41d4-a716-446655440001",
        "channel_name": "游戏直播",
        "is_live": false,
        "viewer_count": 0
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123def"
}
```

---

## 7. 频道搜索

搜索频道，支持按名称和描述搜索。

### 请求信息

- **端点**: `/api/v1/channel/search`
- **方法**: `GET`
- **权限**: 公开

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| limit | number | 否 | 返回数量（默认20，最大100） |

### 请求示例

```bash
curl -X GET "https://hmnl3.20110208.xyz/api/v1/channel/search?keyword=游戏&limit=10"
```

---

## 8. 热门频道获取

获取当前热门的直播频道。

### 请求信息

- **端点**: `/api/v1/channel/hot`
- **方法**: `GET`
- **权限**: 公开

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | number | 否 | 返回数量（默认10，最大50） |

### 请求示例

```bash
curl -X GET "https://hmnl3.20110208.xyz/api/v1/channel/hot?limit=10"
```

---

## 9. 推荐频道获取

获取系统推荐的频道列表。

### 请求信息

- **端点**: `/api/v1/channel/recommended`
- **方法**: `GET`
- **权限**: 公开

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | number | 否 | 返回数量（默认10，最大50） |

### 请求示例

```bash
curl -X GET "https://hmnl3.20110208.xyz/api/v1/channel/recommended?limit=10"
```

---

## 错误码说明

| 错误码 | 说明 | HTTP状态码 |
|--------|------|------------|
| CHANNEL_NOT_FOUND | 频道不存在 | 404 |
| CHANNEL_INACTIVE | 频道已停用 | 403 |
| STREAM_NOT_AVAILABLE | 直播流不可用 | 503 |
| INVALID_PARAMETERS | 请求参数无效 | 400 |
| UNAUTHORIZED | 未授权访问 | 401 |
| FORBIDDEN | 禁止访问 | 403 |
| RATE_LIMITED | 请求频率超限 | 429 |
| INTERNAL_ERROR | 服务器内部错误 | 500 |

---

## 集成指南

### JavaScript/TypeScript 集成

```typescript
import { LiveApi, API_BASE_URL } from '@/utils/live-api';

// 获取直播间URL
const liveRoomUrl = await LiveApi.getLiveRoomUrl({
  channel_url: 'my-live-channel'
});

if (liveRoomUrl.success) {
  console.log('HLS播放地址:', liveRoomUrl.data.hls_play_url);
}

// 获取播放器URL
const playerUrl = await LiveApi.getPlayerUrl({
  channel_url: 'my-live-channel',
  format: 'hls',
  quality: 'auto'
});

// 获取频道信息
const channelInfo = await LiveApi.getChannelInfo({
  channel_url: 'my-live-channel',
  include_stats: true
});

// 获取频道列表
const channelList = await LiveApi.getChannelList({
  is_live: true,
  sort_by: 'viewer_count',
  limit: 20
});

// 批量获取直播状态
const batchStatus = await LiveApi.getBatchLiveStatus({
  channel_ids: ['id1', 'id2', 'id3']
});
```

### 生成嵌入代码

```typescript
import { generateEmbedCode, generateShareUrl } from '@/utils/live-api';

// 生成嵌入代码
const embedCode = generateEmbedCode('my-live-channel', {
  width: '100%',
  height: '500px',
  autoplay: true,
  muted: false
});

// 生成分享链接
const shareUrl = generateShareUrl('my-live-channel');
```

### cURL 示例

```bash
# 获取直播间信息
curl -X GET "https://hmnl3.20110208.xyz/api/v1/live/room-url?channel_url=my-live-channel"

# 获取播放器地址
curl -X GET "https://hmnl3.20110208.xyz/api/v1/live/player-url?channel_url=my-live-channel"

# 获取频道信息
curl -X GET "https://hmnl3.20110208.xyz/api/v1/channel/info?channel_url=my-live-channel"
```

### 最佳实践

1. **缓存策略**: 频道信息可缓存5-10分钟，直播状态建议实时获取
2. **错误处理**: 始终检查 `success` 字段，处理可能的错误情况
3. **频率限制**: 建议请求间隔不低于100ms，避免触发频率限制
4. **连接复用**: 使用HTTP/2或Keep-Alive复用连接
5. **超时设置**: 建议设置10-30秒的请求超时

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 | 2024-01-15 | 初始版本发布 |

---

## 联系支持

如有问题，请联系技术支持：
- 网站: https://hmnl3.20110208.xyz
- 文档: https://hmnl3.20110208.xyz/docs
