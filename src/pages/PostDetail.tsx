import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getPost, 
  getComments, 
  createComment, 
  deleteComment, 
  deletePost,
  incrementPostViewCount 
} from '@/db/api';
import type { Post, Comment } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ReportButton } from '@/components/ReportButton';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Eye, Trash2, Send } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadPostAndComments();
      incrementPostViewCount(id);
    }
  }, [id]);

  const loadPostAndComments = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [postData, commentsData] = await Promise.all([
        getPost(id),
        getComments(id),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error('加载失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载帖子内容',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast({
        title: '错误',
        description: '请输入评论内容',
        variant: 'destructive',
      });
      return;
    }

    if (!profile || !id) return;

    setSubmitting(true);
    try {
      const comment = await createComment(id, newComment, profile.id);
      setComments([...comments, comment]);
      setNewComment('');
      toast({
        title: '评论成功',
        description: '你的评论已发布',
      });
    } catch (error) {
      console.error('评论失败:', error);
      toast({
        title: '评论失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast({
        title: '删除成功',
        description: '评论已删除',
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async () => {
    if (!id) return;
    
    try {
      await deletePost(id);
      toast({
        title: '删除成功',
        description: '帖子已删除',
      });
      navigate('/');
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const canDeletePost = profile && (profile.id === post?.author_id || profile.role === 'admin');
  const canDeleteComment = (comment: Comment) => 
    profile && (profile.id === comment.author_id || profile.role === 'admin');

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-3 sm:p-4 md:p-6 xl:p-8">
        <Skeleton className="h-8 w-24 mb-4 bg-muted" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 bg-muted" />
            <Skeleton className="h-4 w-1/2 bg-muted" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-4xl mx-auto p-3 sm:p-4 md:p-6 xl:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">帖子不存在</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-3 sm:p-4 md:p-6 xl:p-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        
        {canDeletePost && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                删除帖子
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作无法撤销，确定要删除这个帖子吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePost}>删除</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* 帖子内容 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl xl:text-2xl flex-1">{post.title}</CardTitle>
            <div className="flex items-center gap-2">
              {/* 举报按钮（不能举报自己的帖子） */}
              {profile && post.author_id !== profile.id && (
                <ReportButton
                  reportType="post"
                  targetId={post.id}
                  targetName={post.title}
                  variant="outline"
                  size="sm"
                  showText={true}
                />
              )}
            </div>
          </div>
          <CardDescription className="flex flex-wrap items-center gap-2 xl:gap-4">
            {post.author && (
              <UserAvatar 
                profile={post.author} 
                size="sm" 
                showTitle 
                showVerified 
                showRole
                showRealVerified
                clickable
              />
            )}
            <span>发布于: {formatDate(post.created_at)}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.view_count}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm xl:prose-base max-w-none dark:prose-invert">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* 评论区 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg xl:text-xl">评论 ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 发表评论 */}
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="写下你的评论..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              rows={4}
            />
            <Button type="submit" disabled={submitting}>
              <Send className="w-4 h-4 mr-2" />
              {submitting ? '发送中...' : '发表评论'}
            </Button>
          </form>

          {/* 评论列表 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                还没有评论，快来发表第一条评论吧！
              </p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {comment.author && (
                            <UserAvatar 
                              profile={comment.author} 
                              size="sm" 
                              showTitle 
                              showVerified 
                              showRole
                              showRealVerified
                              clickable
                            />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm xl:text-base whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                      
                      {canDeleteComment(comment) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除这条评论吗？
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
