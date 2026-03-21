import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
  return data;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isGuestMode: boolean;
  signIn: (userId: string, password: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string, code: string) => Promise<{ error: Error | null }>;
  signInWithFace: (userId: string) => Promise<{ error: Error | null }>;
  signUp: (username: string, password: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // 进入访客模式
  const enterGuestMode = () => {
    setIsGuestMode(true);
    setLoading(false);
    // 保存访客模式状态到localStorage
    localStorage.setItem('guestMode', 'true');
  };

  // 退出访客模式
  const exitGuestMode = () => {
    setIsGuestMode(false);
    localStorage.removeItem('guestMode');
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    let authInitialized = false;
    
    const initAuth = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (mounted && !authInitialized) {
            console.warn('[AuthContext] Session fetch timeout, setting loading to false');
            setLoading(false);
          }
        }, 10000);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        authInitialized = true;
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('[AuthContext] Session fetch error:', error);
          setLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            const profileData = await getProfile(session.user.id);
            if (mounted) {
              setProfile(profileData);
            }
          } catch (profileError) {
            console.error('[AuthContext] Profile fetch error:', profileError);
          }
          localStorage.removeItem('guestMode');
          setIsGuestMode(false);
        } else {
          const guestMode = localStorage.getItem('guestMode');
          if (guestMode === 'true') {
            setIsGuestMode(true);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('[AuthContext] Init auth error:', error);
        clearTimeout(timeoutId);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile).catch(console.error);
        exitGuestMode();
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // 通过用户ID（numeric_id或username）登录
  const signInWithUserId = async (userId: string, password: string) => {
    try {
      // 尝试将userId解析为数字ID
      const numericId = parseInt(userId);
      let email: string;

      if (!isNaN(numericId)) {
        // 如果是数字，通过numeric_id查找用户
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email, username')
          .eq('numeric_id', numericId)
          .maybeSingle();

        if (profileError) {
          console.error('查询用户失败:', profileError);
          throw new Error('查询用户信息失败，请稍后重试');
        }

        if (!profileData) {
          throw new Error('用户ID不存在，请检查后重试');
        }

        // 使用查找到的email登录
        email = profileData.email || `${profileData.username}@miaoda.com`;
      } else {
        // 如果不是数字，当作用户名处理（向后兼容）
        email = `${userId}@miaoda.com`;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('登录失败:', error);
        // 提供更友好的错误信息
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('用户名或密码错误');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('邮箱未验证，请联系管理员');
        } else {
          throw new Error(error.message || '登录失败，请稍后重试');
        }
      }
      
      // 登录成功后退出访客模式
      exitGuestMode();
      
      // 显式更新用户信息
      if (data?.user) {
        setUser(data.user);
        const profileData = await getProfile(data.user.id);
        setProfile(profileData);
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // 注册新用户（使用用户名）
  const signUpWithUsername = async (username: string, password: string, phone?: string) => {
    try {
      // 检查用户名是否已存在
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('检查用户名失败:', checkError);
        throw new Error('检查用户名失败，请稍后重试');
      }

      if (existingProfile) {
        throw new Error('用户名已存在，请换一个用户名');
      }

      const email = `${username}@miaoda.com`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            phone: phone || null,
          }
        }
      });

      if (error) {
        console.error('注册失败:', error);
        // 提供更友好的错误信息
        if (error.message.includes('User already registered')) {
          throw new Error('该用户名已被注册');
        } else if (error.message.includes('Password should be')) {
          throw new Error('密码强度不够，请使用更复杂的密码');
        } else {
          throw new Error(error.message || '注册失败，请稍后重试');
        }
      }

      // 检查是否成功创建了用户
      if (!data.user) {
        throw new Error('注册失败，请稍后重试');
      }

      // 等待一小段时间，确保触发器执行完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 验证 profile 是否创建成功
      const profile = await getProfile(data.user.id);
      if (!profile) {
        console.error('Profile 创建失败，用户ID:', data.user.id);
        throw new Error('账户创建失败，请联系管理员');
      }

      // 如果提供了手机号，更新到profile
      if (phone) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ phone })
          .eq('id', data.user.id);
        
        if (updateError) {
          console.error('更新手机号失败:', updateError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // 手机号验证码登录
  const signInWithPhone = async (phone: string, code: string) => {
    try {
      // 注意：验证码验证应该在调用此方法之前完成
      // 调用edge function处理登录
      const { data, error } = await supabase.functions.invoke('phone-login', {
        body: { phone },
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        console.error('edge function error in <phone-login>:', errorMsg || error?.message);
        throw new Error(errorMsg || error?.message || '登录失败');
      }

      if (!data?.success || !data?.session) {
        throw new Error(data?.error || '登录失败');
      }

      // 设置session
      const { error: sessionError } = await supabase.auth.setSession(data.session);
      if (sessionError) {
        throw new Error('设置会话失败');
      }

      return { error: null };
    } catch (error) {
      console.error('手机号登录错误:', error);
      return { error: error as Error };
    }
  };

  // 人脸识别登录
  const signInWithFace = async (userId: string) => {
    try {
      // 通过userId查找用户的email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, username, face_registered')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !profileData) {
        throw new Error('用户不存在');
      }

      if (!profileData.face_registered) {
        throw new Error('该用户未注册人脸信息');
      }

      // 使用magic link方式登录（无密码登录）
      const email = profileData.email || `${profileData.username}@miaoda.com`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        console.error('人脸登录失败:', error);
        throw new Error('登录失败，请稍后重试');
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading,
      isGuestMode,
      signIn: signInWithUserId, 
      signInWithPhone,
      signInWithFace,
      signUp: signUpWithUsername, 
      signOut, 
      refreshProfile,
      enterGuestMode,
      exitGuestMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}