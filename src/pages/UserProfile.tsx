import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ReportButton } from '@/components/ReportButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getProfile, getUserPosts, getUserStats } from '@/db/api';
import type { Profile, Post } from '@/types/types';
import { Calendar, FileText, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { maskRealName } from '@/lib/utils';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ postCount: 0, commentCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileData, postsData, statsData] = await Promise.all([
          getProfile(userId),
          getUserPosts(userId, 10),
          getUserStats(userId),
        ]);

        if (!profileData) {
          setError('用户不存在');
          return;
        }

        setProfile(profileData);
        setPosts(postsData);
        setStats(statsData);
      } catch (err) {
        console.error('加载用户数据失败:', err);
        setError('加载用户数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          </div>
          <div className="xl:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{error || '用户不存在'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 左侧用户信息卡片 */}
        <div className="xl:col-span-1">
          <Card>
            <CardContent className="pt-6">
              {/* 头像 */}
              <div className="flex justify-center mb-4">
                <UserAvatar profile={profile} size="xl" />
              </div>

              {/* 用户名和ID */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-1">{profile.username}</h2>
                <p className="text-sm text-muted-foreground">ID: {profile.numeric_id}</p>
                
                {/* 举报按钮（不能举报自己） */}
                {currentUserProfile && profile.id !== currentUserProfile.id && (
                  <div className="mt-3">
                    <ReportButton
                      reportType="user"
                      targetId={profile.id}
                      targetName={profile.username}
                      variant="outline"
                      size="sm"
                      showText={true}
                    />
                  </div>
                )}
              </div>

              {/* 标识徽章 */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {profile.is_super_admin && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-destructive text-destructive-foreground">
                    超管
                  </span>
                )}
                {!profile.is_super_admin && profile.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                    管理员
                  </span>
                )}
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground border border-border">
                    入驻用户
                  </span>
                )}
                {/* 兼容is_verified和is_real_verified两个字段 */}
                {(profile.is_verified || profile.is_real_verified) && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-600 text-white">
                    已实名
                  </span>
                )}
              </div>

              {/* 头衔 */}
              {profile.titles && profile.titles.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {profile.titles.map((title, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground border border-border"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              )}

              {/* 简介 */}
              {profile.bio && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}

              {/* 实名信息 - 兼容is_verified和is_real_verified两个字段 */}
              {(profile.is_verified || profile.is_real_verified) && profile.real_name && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="text-muted-foreground">实名：</span>
                    <span className="font-medium">
                      {currentUserProfile?.role === 'admin' || currentUserProfile?.is_super_admin
                        ? profile.real_name
                        : maskRealName(profile.real_name)}
                    </span>
                  </p>
                  {profile.id_card_last4 && (
                    <p className="text-sm text-muted-foreground">
                      身份证：***********{profile.id_card_last4}
                    </p>
                  )}
                </div>
              )}

              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">帖子</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.postCount}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">评论</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.commentCount}</p>
                </div>
              </div>

              {/* 注册时间 */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>加入于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧帖子列表 */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>发布的帖子</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">该用户还没有发布任何帖子</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="block p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors"
                    >
                      <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                        <span>{post.view_count} 次浏览</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
