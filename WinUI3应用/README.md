# HMNL直播讨论站 - WinUI3应用

## 项目概述

基于HMNL直播讨论站网站开发的Windows桌面应用程序，使用WinUI 3框架实现，提供完整的直播社区功能。

## 技术栈

- **框架**: WinUI 3 (Windows App SDK 1.5)
- **语言**: C# (.NET 8)
- **架构**: MVVM模式
- **MVVM框架**: CommunityToolkit.Mvvm 8.2.2
- **依赖注入**: Microsoft.Extensions.DependencyInjection
- **HTTP客户端**: Microsoft.Extensions.Http
- **配置管理**: Microsoft.Extensions.Configuration
- **JSON处理**: System.Text.Json
- **实时通信**: Microsoft.AspNetCore.SignalR.Client
- **视频播放**: Microsoft.UI.Xaml.Controls.MediaElement

## 设计理念

### MDUI 圆角设计

本应用采用MDUI (Material Design UI) 圆角设计理念，提供统一、现代的视觉体验：

- **圆角系统**：建立了完整的圆角层级体系
  - `CornerRadiusMduiSm`: 8px - 小型控件
  - `CornerRadiusMduiMd`: 12px - 中等控件
  - `CornerRadiusMduiLg`: 16px - 大型容器
  - `CornerRadiusMduiXl`: 20px - 卡片
  - `CornerRadiusMdui2Xl`: 24px - 对话框
  - `CornerRadiusMduiFull`: 9999px - 圆形控件

- **阴影系统**: 多层次阴影效果，增强视觉层次感
- **色彩系统**: 语义化色彩，支持系统主题
- **动画系统**: 流畅的过渡效果，提升用户体验

### 现代Windows设计

- **Fluent Design**: 遵循Windows 11设计语言
- **主题支持**: 自动适应系统亮/暗主题
- **触控友好**: 44px最小触摸目标
- **性能优化**: 高效的UI渲染

## 项目结构

```
HmnlDesktop/
├── Models/                 # 数据模型
│   ├── User.cs
│   ├── Post.cs
│   ├── Comment.cs
│   ├── Message.cs
│   ├── Channel.cs
│   ├── LiveStream.cs
│   └── AiConversation.cs
├── ViewModels/             # 视图模型
│   ├── MainViewModel.cs
│   ├── UserViewModel.cs
│   ├── PostViewModel.cs
│   ├── ChatViewModel.cs
│   ├── LiveViewModel.cs
│   ├── AiViewModel.cs
│   └── ToolsViewModel.cs
├── Views/                  # 视图页面
│   ├── MainPage.xaml
│   ├── HomePage.xaml
│   ├── LoginPage.xaml
│   ├── RegisterPage.xaml
│   ├── ProfilePage.xaml
│   ├── PostPage.xaml
│   ├── ChatPage.xaml
│   ├── LivePage.xaml
│   ├── AiPage.xaml
│   ├── ToolsPage.xaml
│   └── SettingsPage.xaml
├── Services/               # 服务层
│   ├── ApiService.cs
│   ├── AuthService.cs
│   ├── ChatService.cs
│   ├── LiveService.cs
│   └── StorageService.cs
├── Controls/               # 自定义控件
│   ├── PostCard.xaml
│   └── MessageBubble.xaml
├── Converters/             # 数据转换器
│   ├── DateTimeConverter.cs
│   ├── LikesConverter.cs
│   ├── ViewerConverter.cs
│   ├── RoleConverter.cs
│   ├── MessageAlignmentConverter.cs
│   ├── ErrorVisibilityConverter.cs
│   ├── InverseBoolConverter.cs
│   ├── BoolToVisibilityConverter.cs
│   ├── InverseBoolToVisibilityConverter.cs
│   ├── MessageBackgroundConverter.cs
│   └── LikeIconConverter.cs
├── Styles/                 # 样式资源
│   ├── Colors.xaml
│   └── TextStyles.xaml
├── Assets/                 # 资源文件
│   ├── Images/
│   └── Icons/
├── App.xaml                # 应用程序入口
├── App.xaml.cs
├── MainWindow.xaml        # 主窗口
├── MainWindow.xaml.cs
├── appsettings.json       # 配置文件
├── app.manifest          # 应用清单
└── HmnlDesktop.csproj    # 项目文件
```

## 核心功能模块

### 1. 用户系统
- 多种登录方式（用户名、手机号）
- 用户注册
- 个人中心
- 实名认证
- 用户头衔系统

### 2. 帖子系统
- 帖子浏览
- 帖子搜索
- 帖子发布
- 评论功能
- 点赞功能

### 3. 聊天系统
- 公共聊天室
- 频道聊天
- 实时消息
- 消息搜索

### 4. 直播系统
- 直播观看
- RTMP推流
- 直播互动（公告、投票、抽奖）
- 弹幕功能

### 5. AI对话
- 多模型支持
- 流式响应
- 对话管理
- 历史记录

### 6. 工具箱
- 天气预报
- 地图导航
- Animas解谜工具箱

## 开发环境要求

- **操作系统**: Windows 10/11 (版本 1809 或更高)
- **Visual Studio**: 2022 (17.8 或更高版本)
- **工作负载**: .NET 桌面开发
- **Windows App SDK**: 最新版本

## 快速开始

### 1. 安装开发环境

1. 安装 Visual Studio 2022
2. 在安装程序中选择".NET 桌面开发"工作负载
3. 安装 Windows App SDK

### 2. 克隆项目

```bash
git clone https://github.com/your-repo/hmnl-desktop.git
cd hmnl-desktop
```

### 3. 配置环境

在 `appsettings.json` 中配置API地址：

```json
{
  "ApiBaseUrl": "https://your-api-url.com",
  "SupabaseUrl": "https://your-project.supabase.co",
  "SupabaseKey": "your-supabase-key",
  "SignalRHubUrl": "https://your-api-url.com/hubs/chat"
}
```

### 4. 运行项目

1. 在 Visual Studio 中打开 `HmnlDesktop.sln`
2. 选择目标平台（x64 或 ARM64）
3. 按 F5 运行

## 详细教程

查看 [WinUI3开发教程.md](./WinUI3开发教程.md) 了解详细的开发步骤。

## 构建发布

### 开发构建

```bash
dotnet build
```

### 发布构建

```bash
dotnet publish -c Release -r win-x64 --self-contained
```

### MSIX打包

使用 Visual Studio 的发布向导创建 MSIX 包。

## 故障排除

查看 [故障排除指南.md](./故障排除指南.md) 解决常见问题。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

© 2025 HMNL直播讨论站

## 联系方式

- **项目地址**: https://www.miaoda.cn/projects/app-883oyd7kz475
- **直播地址**: https://hmnl.20110208.xyz
