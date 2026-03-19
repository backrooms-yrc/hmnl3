import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const withSuspense = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

const WebHome = lazy(() => import('./pages/WebHome'));
const Posts = lazy(() => import('./pages/Posts'));
const Login = lazy(() => import('./pages/Login'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Chat = lazy(() => import('./pages/Chat'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const ReportManagement = lazy(() => import('./pages/ReportManagement'));
const ChannelManagement = lazy(() => import('./pages/admin/ChannelManagement'));
const AnnouncementManagement = lazy(() => import('./pages/admin/AnnouncementManagement'));
const Settings = lazy(() => import('./pages/Settings'));
const Help = lazy(() => import('./pages/Help'));
const About = lazy(() => import('./pages/About'));
const LiveManagement = lazy(() => import('./pages/LiveManagement'));
const Worldview = lazy(() => import('./pages/Worldview'));
const WorldviewDetail = lazy(() => import('./pages/WorldviewDetail'));
const WorldviewCreate = lazy(() => import('./pages/WorldviewCreate'));
const ChannelList = lazy(() => import('./pages/ChannelList'));
const ChannelView = lazy(() => import('./pages/ChannelView'));
const TestM3u8 = lazy(() => import('./pages/TestM3u8'));
const TestSpecialPlayer = lazy(() => import('./pages/TestSpecialPlayer'));
const Weather = lazy(() => import('./pages/Weather'));
const SubscriptionWallet = lazy(() => import('./pages/SubscriptionWallet'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const AIChat = lazy(() => import('./pages/AIChat'));
const MapNavigation = lazy(() => import('./pages/MapNavigation'));
const AnimasTools = lazy(() => import('./pages/AnimasTools'));
const BroadcastSquare = lazy(() => import('./pages/BroadcastSquare'));
const BroadcastEditor = lazy(() => import('./pages/BroadcastEditor'));
const BroadcastView = lazy(() => import('./pages/BroadcastView'));
const MyBroadcastPages = lazy(() => import('./pages/MyBroadcastPages'));
const Forum = lazy(() => import('./pages/Forum'));
const ForumDetail = lazy(() => import('./pages/ForumDetail'));
const DocCenter = lazy(() => import('./pages/DocCenter'));

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  { name: '首页', path: '/', element: withSuspense(WebHome) },
  { name: '帖子', path: '/posts', element: withSuspense(Posts) },
  { name: '登录', path: '/login', element: withSuspense(Login) },
  { name: '发布帖子', path: '/create-post', element: withSuspense(CreatePost) },
  { name: '帖子详情', path: '/post/:id', element: withSuspense(PostDetail) },
  { name: '用户主页', path: '/user/:userId', element: withSuspense(UserProfile) },
  { name: '聊天室', path: '/chat', element: withSuspense(Chat) },
  { name: '频道列表', path: '/channels', element: withSuspense(ChannelList) },
  { name: '频道播放', path: '/channel/:id', element: withSuspense(ChannelView) },
  { name: '频道播放(旧)', path: '/channel', element: withSuspense(ChannelView) },
  { name: '直播管理', path: '/live-management', element: withSuspense(LiveManagement) },
  { name: '通知', path: '/notifications', element: withSuspense(Notifications) },
  { name: '个人中心', path: '/profile', element: withSuspense(Profile) },
  { name: '管理后台', path: '/admin', element: withSuspense(Admin) },
  { name: '举报管理', path: '/reports', element: withSuspense(ReportManagement) },
  { name: '频道管理', path: '/admin/channels', element: withSuspense(ChannelManagement) },
  { name: '公告管理', path: '/admin/announcements', element: withSuspense(AnnouncementManagement) },
  { name: '系统设置', path: '/settings', element: withSuspense(Settings) },
  { name: '帮助中心', path: '/help', element: withSuspense(Help) },
  { name: '关于本站', path: '/about', element: withSuspense(About) },
  { name: '幻霜论坛lite', path: '/forum', element: withSuspense(Forum) },
  { name: '论坛帖子详情', path: '/forum/:id', element: withSuspense(ForumDetail) },
  { name: '文档中心', path: '/docs', element: withSuspense(DocCenter) },
  { name: 'M3U8测试', path: '/test-m3u8', element: withSuspense(TestM3u8) },
  { name: '特殊播放器测试', path: '/test-special-player', element: withSuspense(TestSpecialPlayer) },
  { name: '天气预报', path: '/weather', element: withSuspense(Weather) },
  { name: '订阅与钱包', path: '/subscription-wallet', element: withSuspense(SubscriptionWallet) },
  { name: '订单详情', path: '/order/:orderNo', element: withSuspense(OrderDetail) },
  { name: 'AI大模型', path: '/ai-chat', element: withSuspense(AIChat) },
  { name: '地图导航', path: '/map', element: withSuspense(MapNavigation) },
  { name: 'AnimasTools', path: '/animas-tools', element: withSuspense(AnimasTools) },
  { name: '放送广场', path: '/broadcast', element: withSuspense(BroadcastSquare) },
  { name: '创建放送页面', path: '/broadcast/create', element: withSuspense(BroadcastEditor) },
  { name: '编辑放送页面', path: '/broadcast/:id/edit', element: withSuspense(BroadcastEditor) },
  { name: '放送页面详情', path: '/broadcast/:id', element: withSuspense(BroadcastView) },
  { name: '我的放送页面', path: '/my-broadcast', element: withSuspense(MyBroadcastPages) },
];

export default routes;
