import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllReports, handleReport, getPost, getChatMessage, getProfile } from '@/db/api';
import type { Report, ReportStatus } from '@/types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function ReportManagement() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [handleStatus, setHandleStatus] = useState<ReportStatus>('resolved');
  const [adminNote, setAdminNote] = useState('');
  const [handling, setHandling] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | ReportStatus>('all');
  const [targetContent, setTargetContent] = useState<string>('');

  // 检查权限
  useEffect(() => {
    if (!profile) return;
    
    if (profile.role !== 'admin' && !profile.is_super_admin) {
      toast({
        title: '权限不足',
        description: '只有管理员可以访问此页面',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [profile, navigate, toast]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getAllReports();
      setReports(data);
    } catch (error) {
      console.error('加载举报列表失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载举报列表',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">待处理</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">已处理</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">已驳回</Badge>;
    }
  };

  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'message':
        return '聊天消息';
      case 'post':
        return '帖子';
      case 'user':
        return '用户';
      default:
        return type;
    }
  };

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setHandleStatus('resolved');
    setAdminNote('');
    
    // 加载被举报内容
    try {
      if (report.report_type === 'message') {
        const message = await getChatMessage(report.target_id);
        setTargetContent(message?.content || '消息已被删除');
      } else if (report.report_type === 'post') {
        const post = await getPost(report.target_id);
        setTargetContent(post?.title || '帖子已被删除');
      } else if (report.report_type === 'user') {
        const user = await getProfile(report.target_id);
        setTargetContent(user?.username || '用户不存在');
      }
    } catch (error) {
      console.error('加载被举报内容失败:', error);
      setTargetContent('无法加载内容');
    }
    
    setDialogOpen(true);
  };

  const handleSubmitHandle = async () => {
    if (!selectedReport || !profile) return;

    setHandling(true);
    try {
      await handleReport(
        selectedReport.id,
        profile.id,
        handleStatus,
        adminNote.trim() || undefined
      );

      toast({
        title: '处理成功',
        description: '举报已处理',
      });

      setDialogOpen(false);
      loadReports();
    } catch (error) {
      console.error('处理举报失败:', error);
      toast({
        title: '处理失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setHandling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredReports = filterStatus === 'all' 
    ? reports 
    : reports.filter(r => r.status === filterStatus);

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  if (!profile || (profile.role !== 'admin' && !profile.is_super_admin)) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 xl:py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold">举报管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              共 {reports.length} 条举报，{pendingCount} 条待处理
            </p>
          </div>
        </div>

        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="pending">待处理</SelectItem>
            <SelectItem value="resolved">已处理</SelectItem>
            <SelectItem value="rejected">已驳回</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">暂无举报记录</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className={report.status === 'pending' ? 'border-yellow-500/50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">
                        {getReportTypeText(report.report_type)}举报
                      </CardTitle>
                      {getStatusBadge(report.status)}
                    </div>
                    <CardDescription>
                      举报时间：{formatDate(report.created_at)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReport(report)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    查看详情
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">举报人：</span>
                    {report.reporter && (
                      <UserAvatar
                        profile={report.reporter}
                        size="sm"
                        showRole
                        showVerified
                        clickable
                      />
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">举报原因：</span>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{report.reason}</p>
                  </div>
                  {report.status !== 'pending' && report.handler && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">处理人：</span>
                        <UserAvatar
                          profile={report.handler}
                          size="sm"
                          showRole
                          clickable
                        />
                      </div>
                      {report.handled_at && (
                        <p className="text-xs text-muted-foreground">
                          处理时间：{formatDate(report.handled_at)}
                        </p>
                      )}
                      {report.admin_note && (
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">处理备注：</span>
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{report.admin_note}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 处理举报对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              处理举报
            </DialogTitle>
            <DialogDescription>
              请仔细审核举报内容，并做出合理的处理决定
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <span className="text-sm font-medium">举报类型：</span>
                  <span className="text-sm ml-2">{getReportTypeText(selectedReport.report_type)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">被举报内容：</span>
                  <p className="text-sm mt-1 p-2 bg-background rounded">{targetContent}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">举报原因：</span>
                  <p className="text-sm mt-1">{selectedReport.reason}</p>
                </div>
                {selectedReport.reporter && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">举报人：</span>
                    <UserAvatar
                      profile={selectedReport.reporter}
                      size="sm"
                      showRole
                      clickable
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">处理结果 *</Label>
                <Select value={handleStatus} onValueChange={(value) => setHandleStatus(value as ReportStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolved">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>已处理（举报有效）</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>已驳回（举报无效）</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-note">处理备注（可选）</Label>
                <Textarea
                  id="admin-note"
                  placeholder="记录处理过程、原因或其他说明..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={handling}
            >
              取消
            </Button>
            <Button onClick={handleSubmitHandle} disabled={handling}>
              {handling ? '处理中...' : '确认处理'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
