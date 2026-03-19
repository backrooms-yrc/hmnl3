import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Captcha } from '@/components/ui/captcha';
import { useToast } from '@/hooks/use-toast';
import { PhoneLoginDialog } from '@/components/auth/PhoneLoginDialog';
import { FaceLoginDialog } from '@/components/auth/FaceLoginDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Smartphone, ScanFace, Eye, Lock, Radio, 
  Sparkles, ArrowRight, ChevronRight, CloudSun, Wrench, Compass,
  User, KeyRound, HelpCircle, Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneLoginOpen, setPhoneLoginOpen] = useState(false);
  const [faceLoginOpen, setFaceLoginOpen] = useState(false);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [registerError, setRegisterError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const { signIn, signUp, enterGuestMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterGuestMode = () => {
    enterGuestMode();
    setGuestDialogOpen(false);
    toast({
      title: '已进入访客模式',
      description: '您可以浏览内容，但部分功能受限',
    });
    navigate(from, { replace: true });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !password) {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 500);
      toast({
        title: '错误',
        description: '请输入用户ID/用户名和密码',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(userId, password);
    setLoading(false);

    if (error) {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 500);
      toast({
        title: '登录失败',
        description: error.message || '用户ID/用户名或密码错误',
        variant: 'destructive',
      });
    } else {
      toast({
        title: '登录成功',
        description: '欢迎回来！',
      });
      navigate(from, { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setRegisterError(true);
      setTimeout(() => setRegisterError(false), 500);
      toast({
        title: '错误',
        description: '请输入用户名和密码',
        variant: 'destructive',
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setRegisterError(true);
      setTimeout(() => setRegisterError(false), 500);
      toast({
        title: '错误',
        description: '用户名只能包含字母、数字和下划线',
        variant: 'destructive',
      });
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setRegisterError(true);
      setTimeout(() => setRegisterError(false), 500);
      toast({
        title: '错误',
        description: '用户名长度应在3-20个字符之间',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      setRegisterError(true);
      setTimeout(() => setRegisterError(false), 500);
      toast({
        title: '错误',
        description: '密码长度至少为6位',
        variant: 'destructive',
      });
      return;
    }

    if (!captchaValid) {
      setRegisterError(true);
      setTimeout(() => setRegisterError(false), 500);
      toast({
        title: '错误',
        description: '请输入正确的验证码',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(username, password);
    setLoading(false);

    if (error) {
      setRegisterError(true);
      setTimeout(() => setRegisterError(false), 500);
      toast({
        title: '注册失败',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '注册成功',
        description: '欢迎加入HMNL直播系统！正在为您登录...',
      });
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    }
  };

  const features = [
    { icon: Radio, title: '直播互动', desc: '精彩直播随时看' },
    { icon: Sparkles, title: '社区交流', desc: '分享你的想法' },
  ];

  return (
    <div className="min-h-screen flex bg-[hsl(var(--md-sys-color-background))]">
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-[hsl(var(--md-sys-color-surface-container-low))]">
        <div className="absolute inset-0 backdrop-blur-sm" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full max-w-2xl">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className={cn(
                "inline-flex items-center gap-3 px-4 py-2 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-primary-container))] login-animate-fade-in-up",
                isAnimating && "login-stagger-1"
              )}>
                <div className="w-8 h-8 md-sys-shape-corner-md bg-[hsl(var(--md-sys-color-primary))] flex items-center justify-center overflow-hidden">
                  <img src="/favicon.png" alt="HMNL" className="w-6 h-6 object-contain" />
                </div>
                <span className="md-sys-typescale-label-large text-[hsl(var(--md-sys-color-on-primary-container))]">全新体验</span>
              </div>
              
              <h1 className={cn(
                "md-sys-typescale-display-large text-[hsl(var(--md-sys-color-on-surface))] login-animate-fade-in-up",
                isAnimating && "login-stagger-2"
              )}>
                探索精彩世界
                <br />
                <span className="text-[hsl(var(--md-sys-color-primary))]">发现无限可能</span>
              </h1>
              
              <p className={cn(
                "md-sys-typescale-body-large text-[hsl(var(--md-sys-color-on-surface-variant))] max-w-md login-animate-fade-in-up",
                isAnimating && "login-stagger-3"
              )}>
                在这里寻找、发布和分享各种有趣的内容，直播、帖子、AI助手，一站式体验
              </p>
            </div>
            
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center gap-4 p-4 md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-surface-container)] max-w-sm login-hover-lift login-animate-feature-enter",
                      isAnimating && `login-stagger-${index + 4}`
                    )}
                  >
                    <div className="w-12 h-12 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-primary))] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[hsl(var(--md-sys-color-on-primary))]" />
                    </div>
                    <div>
                      <h3 className="md-sys-typescale-title-small text-[hsl(var(--md-sys-color-on-surface))]">{feature.title}</h3>
                      <p className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[hsl(var(--md-sys-color-background))] relative">
        <div className="w-full max-w-md relative z-10">
          <div className={cn(
            "text-center mb-8 lg:hidden login-animate-fade-in-up",
            isAnimating && "login-stagger-1"
          )}>
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-primary))] flex items-center justify-center overflow-hidden">
                <img src="/favicon.png" alt="HMNL" className="w-8 h-8 object-contain" />
              </div>
              <span className="md-sys-typescale-title-large text-[hsl(var(--md-sys-color-primary))]">
                HMNL
              </span>
            </div>
            <h2 className="md-sys-typescale-headline-large text-[hsl(var(--md-sys-color-on-surface))]">欢迎回来</h2>
            <p className="md-sys-typescale-body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">登录或注册以开始</p>
          </div>

          <Card className={cn(
            "md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-surface-container-lowest))] border-0 login-animate-card-enter",
            isAnimating && "login-stagger-2"
          )}>
            <CardHeader className="text-center pb-2">
              <div className="hidden lg:flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-primary))] flex items-center justify-center overflow-hidden">
                  <img src="/favicon.png" alt="HMNL" className="w-9 h-9 object-contain" />
                </div>
              </div>
              <CardTitle className="md-sys-typescale-headline-medium text-[hsl(var(--md-sys-color-on-surface))] hidden lg:block">HMNL 直播系统</CardTitle>
              <CardDescription className="md-sys-typescale-body-medium text-[hsl(var(--md-sys-color-on-surface-variant))] hidden lg:block">登录或注册以开始直播与讨论</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-surface-container-highest))] mb-6">
                  <TabsTrigger value="login" className="md-sys-typescale-label-large md-sys-shape-corner-md">登录</TabsTrigger>
                  <TabsTrigger value="register" className="md-sys-typescale-label-large md-sys-shape-corner-md">注册</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className={cn(
                      "space-y-2 login-animate-fade-in-up",
                      isAnimating && "login-stagger-3"
                    )}>
                      <Label htmlFor="login-userid" className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                        用户ID / 用户名
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--md-sys-color-on-surface-variant))]" />
                        <Input
                          id="login-userid"
                          type="text"
                          placeholder="请输入用户ID或用户名"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          disabled={loading}
                          className={cn(
                            "h-12 pl-10 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-surface-container-highest)] border-[hsl(var(--md-sys-color-outline-variant))] text-[hsl(var(--md-sys-color-on-surface))] placeholder:text-[hsl(var(--md-sys-color-on-surface-variant))] login-input-focus-ring",
                            loginError && "login-input-error"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className={cn(
                      "space-y-2 login-animate-fade-in-up",
                      isAnimating && "login-stagger-4"
                    )}>
                      <Label htmlFor="login-password" className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                        密码
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--md-sys-color-on-surface-variant))]" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="请输入密码"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          className={cn(
                            "h-12 pl-10 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-surface-container-highest)] border-[hsl(var(--md-sys-color-outline-variant))] text-[hsl(var(--md-sys-color-on-surface))] placeholder:text-[hsl(var(--md-sys-color-on-surface-variant))] login-input-focus-ring",
                            loginError && "login-input-error"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className={cn(
                      "flex items-center justify-between login-animate-fade-in-up",
                      isAnimating && "login-stagger-5"
                    )}>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember-me" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          className="border-[hsl(var(--md-sys-color-outline))]"
                        />
                        <Label 
                          htmlFor="remember-me" 
                          className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))] cursor-pointer"
                        >
                          记住我
                        </Label>
                      </div>
                      <button
                        type="button"
                        className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-primary))] hover:text-[hsl(var(--md-sys-color-primary)/0.8)] md-sys-state-layer px-2 py-1 md-sys-shape-corner-sm"
                        onClick={() => {
                          toast({
                            title: '提示',
                            description: '请联系管理员重置密码',
                          });
                        }}
                      >
                        忘记密码？
                      </button>
                    </div>
                    
                    <div className={cn(
                      "login-animate-fade-in-up",
                      isAnimating && "login-stagger-6"
                    )}>
                      <Button 
                        type="submit" 
                        className="w-full h-12 md-sys-shape-corner-xl md-sys-typescale-label-large bg-[hsl(var(--md-sys-color-primary))] text-[hsl(var(--md-sys-color-on-primary))] hover:bg-[hsl(var(--md-sys-color-primary)/0.9)] login-button-transition" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            登录中...
                          </>
                        ) : (
                          <>
                            登录
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className={cn(
                      "relative my-6 login-animate-fade-in-up",
                      isAnimating && "login-stagger-7"
                    )}>
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[hsl(var(--md-sys-color-outline-variant))]" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-[hsl(var(--md-sys-color-surface-container-lowest))] px-3 md-sys-typescale-label-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                          或使用其他方式
                        </span>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "grid grid-cols-2 gap-3 login-animate-fade-in-up",
                      isAnimating && "login-stagger-8"
                    )}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPhoneLoginOpen(true)}
                        disabled={loading}
                        className="h-11 md-sys-shape-corner-lg border-[hsl(var(--md-sys-color-outline))] text-[hsl(var(--md-sys-color-on-surface))] hover:bg-[hsl(var(--md-sys-color-surface-container-highest))] login-button-transition"
                      >
                        <Smartphone className="w-5 h-5 mr-2" />
                        <span className="md-sys-typescale-label-large">手机登录</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFaceLoginOpen(true)}
                        disabled={loading}
                        className="h-11 md-sys-shape-corner-lg border-[hsl(var(--md-sys-color-outline))] text-[hsl(var(--md-sys-color-on-surface))] hover:bg-[hsl(var(--md-sys-color-surface-container-highest))] login-button-transition"
                      >
                        <ScanFace className="w-5 h-5 mr-2" />
                        <span className="md-sys-typescale-label-large">人脸识别</span>
                      </Button>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setGuestDialogOpen(true)}
                        disabled={loading}
                        className="w-full h-11 md-sys-shape-corner-lg text-[hsl(var(--md-sys-color-on-surface-variant))] hover:bg-[hsl(var(--md-sys-color-surface-container-highest))] login-button-transition"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        <span className="md-sys-typescale-label-large">访客模式浏览</span>
                        <ChevronRight className="w-5 h-5 ml-auto" />
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className={cn(
                      "space-y-2 login-animate-fade-in-up",
                      isAnimating && "login-stagger-3"
                    )}>
                      <Label htmlFor="register-username" className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                        用户名
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--md-sys-color-on-surface-variant))]" />
                        <Input
                          id="register-username"
                          type="text"
                          placeholder="3-20个字符，字母、数字、下划线"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                          maxLength={20}
                          className={cn(
                            "h-12 pl-10 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-surface-container-highest)] border-[hsl(var(--md-sys-color-outline-variant))] text-[hsl(var(--md-sys-color-on-surface))] placeholder:text-[hsl(var(--md-sys-color-on-surface-variant))] login-input-focus-ring",
                            registerError && "login-input-error"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className={cn(
                      "space-y-2 login-animate-fade-in-up",
                      isAnimating && "login-stagger-4"
                    )}>
                      <Label htmlFor="register-password" className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                        密码
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--md-sys-color-on-surface-variant))]" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="至少6位字符"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          minLength={6}
                          className={cn(
                            "h-12 pl-10 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-surface-container-highest)] border-[hsl(var(--md-sys-color-outline-variant))] text-[hsl(var(--md-sys-color-on-surface))] placeholder:text-[hsl(var(--md-sys-color-on-surface-variant))] login-input-focus-ring",
                            registerError && "login-input-error"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className={cn(
                      "space-y-2 login-animate-fade-in-up",
                      isAnimating && "login-stagger-5"
                    )}>
                      <Label htmlFor="register-captcha" className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                        验证码
                      </Label>
                      <div className="flex flex-col gap-2">
                        <Captcha
                          value={captchaValue}
                          onValueChange={setCaptchaValue}
                          onChange={setCaptchaValid}
                        />
                        <Input
                          id="register-captcha"
                          type="text"
                          placeholder="请输入验证码"
                          value={captchaValue}
                          onChange={(e) => setCaptchaValue(e.target.value)}
                          disabled={loading}
                          maxLength={4}
                          className={cn(
                            "h-12 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-surface-container-highest)] border-[hsl(var(--md-sys-color-outline-variant))] text-[hsl(var(--md-sys-color-on-surface))] placeholder:text-[hsl(var(--md-sys-color-on-surface-variant))] login-input-focus-ring",
                            registerError && "login-input-error"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className={cn(
                      "login-animate-fade-in-up",
                      isAnimating && "login-stagger-6"
                    )}>
                      <Button 
                        type="submit" 
                        className="w-full h-12 md-sys-shape-corner-xl md-sys-typescale-label-large bg-[hsl(var(--md-sys-color-primary))] text-[hsl(var(--md-sys-color-on-primary))] hover:bg-[hsl(var(--md-sys-color-primary)/0.9)] login-button-transition" 
                        disabled={loading || !captchaValid}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            注册中...
                          </>
                        ) : (
                          <>
                            注册账号
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center">
            <p className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
              登录即表示您同意我们的
              <button 
                className="text-[hsl(var(--md-sys-color-primary))] mx-1 md-sys-state-layer px-1 md-sys-shape-corner-sm"
                onClick={() => navigate('/docs')}
              >
                用户协议
              </button>
              和
              <button 
                className="text-[hsl(var(--md-sys-color-primary))] mx-1 md-sys-state-layer px-1 md-sys-shape-corner-sm"
                onClick={() => navigate('/docs')}
              >
                隐私政策
              </button>
            </p>
          </div>
        </div>
      </div>

      <PhoneLoginDialog
        open={phoneLoginOpen}
        onOpenChange={setPhoneLoginOpen}
        onSuccess={() => navigate(from, { replace: true })}
      />
      <FaceLoginDialog
        open={faceLoginOpen}
        onOpenChange={setFaceLoginOpen}
        onSuccess={() => navigate(from, { replace: true })}
      />
      
      <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
        <DialogContent className="sm:max-w-lg md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-surface-container-high))] border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 md-sys-typescale-headline-small text-[hsl(var(--md-sys-color-on-surface))] pb-2">
              <div className="w-10 h-10 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-tertiary-container))] flex items-center justify-center">
                <Eye className="w-5 h-5 text-[hsl(var(--md-sys-color-on-tertiary-container))]" />
              </div>
              <span>访客模式说明</span>
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              <div className="space-y-5">
                <div className="p-4 md-sys-shape-corner-xl bg-[hsl(var(--md-sys-color-surface-container-high))]">
                  <p className="md-sys-typescale-body-large font-medium text-[hsl(var(--md-sys-color-on-surface))] mb-3">欢迎使用访客模式！</p>
                  <p className="md-sys-typescale-body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                    访客模式让您无需注册即可快速体验平台的核心功能。
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 md-sys-shape-corner-md bg-[hsl(var(--md-sys-color-primary-container))] flex items-center justify-center">
                      <span className="md-sys-typescale-label-small text-[hsl(var(--md-sys-color-on-primary-container))]">✓</span>
                    </div>
                    <p className="md-sys-typescale-label-large text-[hsl(var(--md-sys-color-on-surface))]">可使用的功能</p>
                  </div>
                  <div className="grid gap-2 pl-8">
                    {[
                      { icon: Radio, text: '浏览所有公开内容和帖子' },
                      { icon: CloudSun, text: '查看天气预报和地图导航' },
                      { icon: Wrench, text: '使用Animas解谜工具' },
                      { icon: Compass, text: '探索放送广场内容' },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="flex items-center gap-3 p-2 md-sys-shape-corner-md bg-[hsl(var(--md-sys-color-surface-container))]">
                          <Icon className="w-5 h-5 text-[hsl(var(--md-sys-color-primary))]" />
                          <span className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface))]">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 md-sys-shape-corner-md bg-[hsl(var(--md-sys-color-error-container))] flex items-center justify-center">
                      <Lock className="w-3 h-3 text-[hsl(var(--md-sys-color-on-error-container))]" />
                    </div>
                    <p className="md-sys-typescale-label-large text-[hsl(var(--md-sys-color-on-surface))]">受限功能</p>
                  </div>
                  <div className="grid gap-2 pl-8">
                    {[
                      '聊天和即时通讯功能',
                      '创建帖子或发表评论',
                      'AI大模型服务',
                      '个人中心与钱包功能',
                    ].map((text, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 md-sys-shape-corner-md bg-[hsl(var(--md-sys-color-surface-container))] opacity-60">
                        <Lock className="w-5 h-5 text-[hsl(var(--md-sys-color-outline))]" />
                        <span className="md-sys-typescale-body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setGuestDialogOpen(false)}
              className="w-full sm:w-auto h-11 md-sys-shape-corner-lg border-[hsl(var(--md-sys-color-outline))] text-[hsl(var(--md-sys-color-on-surface))] hover:bg-[hsl(var(--md-sys-color-surface-container-highest))]"
            >
              取消
            </Button>
            <Button
              onClick={handleEnterGuestMode}
              className="w-full sm:w-auto h-11 md-sys-shape-corner-lg bg-[hsl(var(--md-sys-color-tertiary))] text-[hsl(var(--md-sys-color-on-tertiary))] hover:bg-[hsl(var(--md-sys-color-tertiary)/0.9)]"
            >
              <Eye className="w-5 h-5 mr-2" />
              进入访客模式
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
