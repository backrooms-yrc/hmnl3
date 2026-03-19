import { useState, useEffect } from 'react';
import { useDevice } from '@/contexts/DeviceContext';
import { getAllAIModelsForAdmin, createSystemAIModel, updateAIModel, deleteAIModel } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface Model {
  id: string;
  model_name: string;
  display_name: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  supports_file_upload: boolean;
  display_order: number;
  created_by: string | null;
}

export default function AIModelManagement() {
  const { isMobile } = useDevice();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelForm, setModelForm] = useState({
    model_name: '',
    display_name: '',
    description: '',
    supports_file_upload: false,
    display_order: 0
  });

  // 加载模型列表
  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await getAllAIModelsForAdmin();
      setModels(data);
    } catch (error) {
      console.error('加载模型失败:', error);
      toast.error('加载模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  // 打开添加对话框
  const handleOpenAddDialog = () => {
    setEditingModel(null);
    setModelForm({
      model_name: '',
      display_name: '',
      description: '',
      supports_file_upload: false,
      display_order: models.length + 1
    });
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const handleOpenEditDialog = (model: Model) => {
    setEditingModel(model);
    setModelForm({
      model_name: model.model_name,
      display_name: model.display_name,
      description: model.description || '',
      supports_file_upload: model.supports_file_upload || false,
      display_order: model.display_order
    });
    setDialogOpen(true);
  };

  // 保存模型
  const handleSaveModel = async () => {
    if (!modelForm.model_name || !modelForm.display_name) {
      toast.error('请填写模型名称和外显名称');
      return;
    }

    try {
      if (editingModel) {
        // 更新模型
        await updateAIModel(editingModel.id, {
          model_name: modelForm.model_name,
          display_name: modelForm.display_name,
          description: modelForm.description,
          display_order: modelForm.display_order
        });
        toast.success('模型更新成功');
      } else {
        // 创建新模型
        await createSystemAIModel({
          model_name: modelForm.model_name,
          display_name: modelForm.display_name,
          description: modelForm.description,
          display_order: modelForm.display_order
        });
        toast.success('模型添加成功');
      }

      setDialogOpen(false);
      loadModels();
    } catch (error: any) {
      console.error('保存模型失败:', error);
      toast.error(error.message || '保存失败');
    }
  };

  // 删除模型
  const handleDeleteModel = async (id: string) => {
    if (!confirm('确定要删除这个模型吗？删除后用户将无法使用该模型。')) return;

    try {
      await deleteAIModel(id);
      toast.success('模型已删除');
      loadModels();
    } catch (error: any) {
      console.error('删除模型失败:', error);
      toast.error(error.message || '删除失败');
    }
  };

  // 切换模型状态
  const handleToggleActive = async (model: Model) => {
    try {
      await updateAIModel(model.id, {
        is_active: !model.is_active
      });
      toast.success(`模型已${!model.is_active ? '启用' : '停用'}`);
      loadModels();
    } catch (error: any) {
      console.error('切换模型状态失败:', error);
      toast.error(error.message || '操作失败');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
            <div>
              <CardTitle className="text-lg">AI模型管理</CardTitle>
              <CardDescription>管理系统AI模型，添加或删除可用模型</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAddDialog} className={isMobile ? 'w-full' : ''}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加模型
                </Button>
              </DialogTrigger>
              <DialogContent className={isMobile ? 'max-w-[90vw]' : ''}>
                <DialogHeader>
                  <DialogTitle>{editingModel ? '编辑模型' : '添加新模型'}</DialogTitle>
                  <DialogDescription>
                    {editingModel ? '修改模型信息' : '添加新的AI模型供用户使用'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model_name">请求体模型名称 *</Label>
                    <Input
                      id="model_name"
                      placeholder="例如：gpt-4o"
                      value={modelForm.model_name}
                      onChange={(e) => setModelForm(prev => ({
                        ...prev,
                        model_name: e.target.value
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      API请求时使用的模型名称
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="display_name">外显名称 *</Label>
                    <Input
                      id="display_name"
                      placeholder="例如：ChatGPT 4o"
                      value={modelForm.display_name}
                      onChange={(e) => setModelForm(prev => ({
                        ...prev,
                        display_name: e.target.value
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      用户界面显示的名称
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="description">简介</Label>
                    <Input
                      id="description"
                      placeholder="例如：快速且聪明的模型👍"
                      value={modelForm.description}
                      onChange={(e) => setModelForm(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_order">显示顺序</Label>
                    <Input
                      id="display_order"
                      type="number"
                      placeholder="1"
                      value={modelForm.display_order}
                      onChange={(e) => setModelForm(prev => ({
                        ...prev,
                        display_order: parseInt(e.target.value) || 0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      数字越小越靠前
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="supports_file_upload">支持文件上传</Label>
                      <p className="text-xs text-muted-foreground">
                        启用后用户可以在对话中上传文件
                      </p>
                    </div>
                    <Switch
                      id="supports_file_upload"
                      checked={modelForm.supports_file_upload}
                      onCheckedChange={(checked) => setModelForm(prev => ({
                        ...prev,
                        supports_file_upload: checked
                      }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSaveModel}>
                    {editingModel ? '保存' : '添加'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无模型，点击上方按钮添加
            </div>
          ) : isMobile ? (
            // 移动端：卡片式布局
            <div className="space-y-3">
              {models.map((model) => (
                <Card key={model.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{model.display_name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{model.model_name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={model.is_system ? 'default' : 'secondary'} className="text-xs">
                            {model.is_system ? '系统' : '自定义'}
                          </Badge>
                        </div>
                      </div>
                      
                      {model.description && (
                        <div className="text-sm text-muted-foreground">
                          {model.description}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">文件上传:</span>
                        <Badge variant={model.supports_file_upload ? 'default' : 'secondary'} className="text-xs">
                          {model.supports_file_upload ? '支持' : '不支持'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={model.is_active}
                            onCheckedChange={() => handleToggleActive(model)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {model.is_active ? '启用' : '停用'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(model)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteModel(model.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // 桌面端：表格布局
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模型名称</TableHead>
                    <TableHead>外显名称</TableHead>
                    <TableHead>简介</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>文件上传</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-mono text-sm">
                        {model.model_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {model.display_name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {model.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={model.is_system ? 'default' : 'secondary'}>
                          {model.is_system ? '系统' : '自定义'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={model.is_active}
                            onCheckedChange={() => handleToggleActive(model)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {model.is_active ? '启用' : '停用'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={model.supports_file_upload ? 'default' : 'secondary'}>
                          {model.supports_file_upload ? '支持' : '不支持'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {model.display_order}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(model)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteModel(model.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
