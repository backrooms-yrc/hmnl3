import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  createBroadcastPage, 
  updateBroadcastPage, 
  getBroadcastPage, 
  uploadBroadcastCover,
  uploadBroadcastFile,
  getBroadcastFiles,
  deleteBroadcastFile,
  getUserStorageUsed 
} from '@/db/api';
import type { BroadcastFile } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Save, 
  Eye, 
  Upload, 
  FileText, 
  Image, 
  Trash2, 
  Download,
  Code,
  Monitor,
  HardDrive,
  X
} from 'lucide-react';
import DOMPurify from 'dompurify';

const MAX_STORAGE = 5 * 1024 * 1024; // 5MB

export default function BroadcastEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<BroadcastFile[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [activeTab, setActiveTab] = useState('editor');

  const isEditing = Boolean(id);

  useEffect(() => {
    if (id) {
      loadPage();
    }
    loadStorageUsed();
  }, [id]);

  const loadPage = async () => {
    setLoading(true);
    try {
      const page = await getBroadcastPage(id!);
      if (page) {
        setTitle(page.title);
        setDescription(page.description || '');
        setHtmlContent(page.html_content || '');
        setIsPublic(page.is_public);
        setCoverImage(page.cover_image);
        
        const pageFiles = await getBroadcastFiles(id!);
        setFiles(pageFiles);
      }
    } catch (error) {
      console.error('加载页面失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageUsed = async () => {
    if (user) {
      const used = await getUserStorageUsed(user.id);
      setStorageUsed(used);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('请输入页面标题');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        await updateBroadcastPage(id, {
          title,
          description,
          html_content: htmlContent,
          is_public: isPublic,
        });
        navigate(`/broadcast/${id}`);
      } else {
        const page = await createBroadcastPage({
          title,
          description,
          html_content: htmlContent,
          is_public: isPublic,
        });
        navigate(`/broadcast/${page.id}/edit`);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    try {
      const url = await uploadBroadcastCover(id, file);
      setCoverImage(url);
    } catch (error) {
      console.error('上传封面失败:', error);
      alert('上传封面失败');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    if (storageUsed + file.size > MAX_STORAGE) {
      alert('存储空间不足，最多可使用5MB');
      return;
    }

    try {
      const uploadedFile = await uploadBroadcastFile(id, file);
      setFiles(prev => [uploadedFile, ...prev]);
      setStorageUsed(prev => prev + file.size);
    } catch (error) {
      console.error('上传文件失败:', error);
      alert('上传文件失败');
    }
  };

  const handleDeleteFile = async (fileId: string, fileSize: number) => {
    if (!confirm('确定要删除这个文件吗？')) return;

    try {
      await deleteBroadcastFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setStorageUsed(prev => prev - fileSize);
    } catch (error) {
      console.error('删除文件失败:', error);
      alert('删除文件失败');
    }
  };

  const insertFileUrl = (url: string) => {
    setHtmlContent(prev => prev + url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const storagePercent = (storageUsed / MAX_STORAGE) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {isEditing ? '编辑页面' : '创建页面'}
              </Badge>
              <h1 className="text-2xl font-bold">
                {isEditing ? title : '创建新的放送页面'}
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outlined" onClick={() => navigate(-1)}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-4">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">页面标题</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="输入页面标题"
                    className="rounded-mdui-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">页面描述</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="简短描述你的页面"
                    className="rounded-mdui-lg"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-mdui-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="public">公开页面</Label>
                    <p className="text-sm text-muted-foreground">
                      开启后将在放送广场展示
                    </p>
                  </div>
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  HTML编辑器
                </CardTitle>
                <CardDescription>
                  编写HTML代码来创建你的页面内容
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="editor" className="gap-2">
                      <Code className="w-4 h-4" />
                      代码
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye className="w-4 h-4" />
                      预览
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor">
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="在这里编写HTML代码..."
                      className="w-full h-96 p-4 font-mono text-sm bg-muted/50 rounded-mdui-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="w-full min-h-96 p-4 bg-white rounded-mdui-lg border border-outline-variant overflow-auto">
                      <div 
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent, { USE_PROFILES: { html: true } }) }}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  封面图片
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coverImage ? (
                  <div className="relative group">
                    <img
                      src={coverImage}
                      alt="封面"
                      className="w-full h-40 object-cover rounded-mdui-lg"
                    />
                    <Button
                      variant="icon"
                      size="icon-sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setCoverImage(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-outline-variant rounded-mdui-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">点击上传封面</p>
                    </div>
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  存储空间
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>已使用</span>
                    <span>{formatFileSize(storageUsed)} / 5 MB</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-mdui-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>
                </div>

                {id && (
                  <Button
                    variant="outlined"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    上传文件
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {id && files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    已上传文件
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-mdui-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="icon"
                            size="icon-sm"
                            onClick={() => insertFileUrl((file as any).public_url)}
                            title="插入链接"
                          >
                            <Code className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="icon"
                            size="icon-sm"
                            onClick={() => handleDeleteFile(file.id, file.file_size)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!id && (
              <Card variant="filled">
                <CardContent className="py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    保存页面后即可上传文件
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
