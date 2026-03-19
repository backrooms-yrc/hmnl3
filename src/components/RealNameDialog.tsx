import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, User, CreditCard, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Profile } from '@/types/types';

interface RealNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
}

export function RealNameDialog({ open, onOpenChange, profile }: RealNameDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            实名信息查看
          </DialogTitle>
          <DialogDescription>
            以下信息为用户的实名认证信息，请妥善保管，仅在必要时使用
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 警告提示 */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              此信息为敏感个人信息，仅限超级管理员在配合公安机关调查或处理重大违规事件时查看。请严格保密，不得泄露或用于其他用途。
            </AlertDescription>
          </Alert>

          {/* 用户基本信息 */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">用户名</span>
              <span className="font-medium">{profile.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">用户ID</span>
              <span className="font-mono text-sm">{profile.numeric_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">认证状态</span>
              <Badge variant={profile.is_real_verified ? "default" : "secondary"}>
                {profile.is_real_verified ? '已实名' : '未实名'}
              </Badge>
            </div>
          </div>

          {/* 实名信息 */}
          {profile.is_real_verified ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <User className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">真实姓名</div>
                  <div className="font-medium text-lg">
                    {profile.real_name || '未填写'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <CreditCard className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">身份证号码</div>
                  <div className="font-medium text-lg font-mono">
                    {profile.id_card_number || '未填写'}
                  </div>
                  {profile.id_card_last4 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      后四位：{profile.id_card_last4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              该用户尚未进行实名认证
            </div>
          )}

          {/* 使用说明 */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded">
            <p className="font-medium">使用说明：</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>此信息仅在配合公安机关调查时使用</li>
              <li>处理重大违规事件时可作为身份确认依据</li>
              <li>严禁将此信息用于商业目的或泄露给第三方</li>
              <li>查看记录将被系统记录，请谨慎操作</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
