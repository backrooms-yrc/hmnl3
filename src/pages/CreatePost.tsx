import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import SimpleMDE from 'react-simplemde-editor';
import ReactMarkdown from 'react-markdown';
import 'easymde/dist/easymde.min.css';
import { ArrowLeft } from 'lucide-react';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: '在这里输入帖子内容，支持Markdown格式...',
    status: false,
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide',
    ] as any,
  }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: '错误',
        description: '请输入帖子标题',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: '错误',
        description: '请输入帖子内容',
        variant: 'destructive',
      });
      return;
    }

    if (!profile) {
      toast({
        title: '错误',
        description: '请先登录',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const post = await createPost(title, content, profile.id);
      toast({
        title: '发布成功',
        description: '你的帖子已成功发布',
      });
      navigate(`/post/${post.id}`);
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto p-3 sm:p-4 md:p-6 xl:p-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl xl:text-2xl">发布新帖</CardTitle>
          <CardDescription>分享你的想法和见解</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                type="text"
                placeholder="输入帖子标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                className="text-base xl:text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>内容</Label>
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">编辑</TabsTrigger>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                </TabsList>
                
                <TabsContent value="edit" className="mt-4">
                  <SimpleMDE
                    value={content}
                    onChange={setContent}
                    options={editorOptions}
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="mt-4">
                  <Card>
                    <CardContent className="pt-6 min-h-[300px]">
                      {content ? (
                        <div className="prose prose-sm xl:prose-base max-w-none dark:prose-invert">
                          <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-12">
                          暂无内容预览
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 xl:flex-none xl:px-8"
              >
                {loading ? '发布中...' : '发布帖子'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
