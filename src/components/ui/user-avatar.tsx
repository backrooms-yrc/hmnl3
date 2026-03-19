import { cn } from '@/lib/utils';
import type { Profile } from '@/types/types';
import { CheckCircle2, Shield, ShieldCheck, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserAvatarProps {
  profile: Profile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTitle?: boolean;
  showVerified?: boolean; // 是否显示入驻标识
  showRole?: boolean; // 是否显示管理员/超管标识
  showRealVerified?: boolean; // 是否显示实名认证标识
  clickable?: boolean; // 是否可点击跳转到用户主页
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-16 h-16 text-2xl',
};

export function UserAvatar({ 
  profile, 
  size = 'md', 
  showTitle = false, 
  showVerified = false, 
  showRole = false,
  showRealVerified = false,
  clickable = false,
  className 
}: UserAvatarProps) {
  // 优先使用titles数组，如果为空则使用旧的title字段
  const displayTitles = profile.titles && profile.titles.length > 0 ? profile.titles : (profile.title ? [profile.title] : []);
  
  // 头像组件
  const avatarElement = (
    <div className={cn('rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0', sizeClasses[size])}>
      {profile.avatar_url ? (
        <img 
          src={profile.avatar_url} 
          alt={profile.username} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{profile.username[0]?.toUpperCase() || 'U'}</span>
      )}
    </div>
  );

  // 用户名组件
  const usernameElement = (
    <span className={cn('font-medium truncate', clickable && 'hover:text-primary cursor-pointer')}>
      {profile.username}
    </span>
  );
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {clickable ? (
        <Link to={`/user/${profile.id}`} className="shrink-0">
          {avatarElement}
        </Link>
      ) : (
        avatarElement
      )}
      
      {showTitle && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {clickable ? (
              <Link to={`/user/${profile.id}`}>
                {usernameElement}
              </Link>
            ) : (
              usernameElement
            )}
            
            {/* 超管标识 */}
            {showRole && profile.is_super_admin && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground shrink-0">
                <ShieldCheck className="w-3 h-3" />
                超管
              </span>
            )}
            
            {/* 管理员标识 */}
            {showRole && !profile.is_super_admin && profile.role === 'admin' && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground shrink-0">
                <Shield className="w-3 h-3" />
                管理员
              </span>
            )}
            
            {/* 入驻标识 */}
            {showVerified && profile.is_streamer && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                入驻
              </span>
            )}
            
            {/* 实名认证标识 */}
            {showRealVerified && profile.is_real_verified && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-600 text-white shrink-0">
                <BadgeCheck className="w-3 h-3" />
                已实名
              </span>
            )}
            
            {/* 用户头衔 */}
            {displayTitles.map((title, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border shrink-0"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
