/**
 * Supabase 用户认证服务
 * 处理用户注册、登录、登出、Token管理等功能
 */

import { createClient, AuthSession, User, AuthError } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase 配置 - 从环境变量获取
const SUPABASE_URL = 'https://ohhnihlkyqxgfqlrymxz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaG5paGxreXF4Z2ZxbHJ5bXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTI5NzksImV4cCI6MjA2NDkyODk3OX0.9gX5eAbgwks8o3hUs7mliAjPhbzd8zq4j8elq-IOOOY';

// 创建Supabase客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // 使用AsyncStorage存储认证状态
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 认证响应类型定义
export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: AuthSession;
  error?: string;
}

// 用户注册接口参数
export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

// 用户登录接口参数
export interface LoginData {
  email: string;
  password: string;
}

/**
 * 用户注册
 * 使用邮箱和密码创建新用户账户
 */
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('🔐 开始用户注册:', data.email);
    
    // 调用Supabase注册API
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName || data.email.split('@')[0],
        }
      }
    });

    if (error) {
      console.error('❌ 注册失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ 注册成功:', authData.user?.email);
    return {
      success: true,
      user: authData.user || undefined,
      session: authData.session || undefined
    };

  } catch (error: any) {
    console.error('❌ 注册异常:', error);
    return {
      success: false,
      error: error.message || '注册失败'
    };
  }
};

/**
 * 用户登录
 * 使用邮箱和密码进行身份验证
 */
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    console.log('🔐 开始用户登录:', data.email);
    
    // 调用Supabase登录API
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error('❌ 登录失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }

    // 保存JWT Token到AsyncStorage（Supabase SDK会自动处理）
    if (authData.session?.access_token) {
      console.log('💾 JWT Token已保存');
    }

    console.log('✅ 登录成功:', authData.user?.email);
    return {
      success: true,
      user: authData.user || undefined,
      session: authData.session || undefined
    };

  } catch (error: any) {
    console.error('❌ 登录异常:', error);
    return {
      success: false,
      error: error.message || '登录失败'
    };
  }
};

/**
 * 用户登出
 * 清除本地认证状态和Token
 */
export const logoutUser = async (): Promise<AuthResponse> => {
  try {
    console.log('🔐 开始用户登出');
    
    // 调用Supabase登出API
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ 登出失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ 登出成功');
    return {
      success: true
    };

  } catch (error: any) {
    console.error('❌ 登出异常:', error);
    return {
      success: false,
      error: error.message || '登出失败'
    };
  }
};

/**
 * 获取当前用户信息
 * 从本地存储中获取已登录的用户
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    return null;
  }
};

/**
 * 获取当前JWT Token
 * 用于API请求的Authorization头
 */
export const getCurrentToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('❌ 获取Token失败:', error);
    return null;
  }
};

/**
 * 检查用户是否已登录
 */
export const isUserLoggedIn = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};

/**
 * 监听认证状态变化
 * 当用户登录/登出时触发回调
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 认证状态变化:', event, session?.user?.email || 'anonymous');
    callback(session?.user || null);
  });
}; 