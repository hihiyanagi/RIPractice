/**
 * API 工具函数
 * 封装与后端服务的通信，集成Supabase JWT认证
 */

import { getCurrentToken } from './supabaseAuth';

// API 配置
const DEFAULT_API_URL = 'http://192.168.3.189:8000';  // 使用实际的IP地址作为默认
const FALLBACK_API_URLS = [
  'http://192.168.3.189:8000',   // 当前有效的IP地址
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://192.168.3.187:8000',   // 保留作为备用
];

// 确保API_BASE_URL是可变的
let API_BASE_URL = DEFAULT_API_URL;

/**
 * UUID校验正则表达式
 */
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// API连接状态
let workingApiUrl: string | null = null;

console.log('🌐 初始API Base URL:', API_BASE_URL);

/**
 * 检查API连接
 */
async function checkApiConnection(url: string): Promise<boolean> {
  try {
    const response = await fetch(`${url}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API连接成功: ${url}`, data.status);
      return true;
    }
    return false;
  } catch (error: any) {
    console.log(`❌ API连接失败: ${url} - ${error?.message || error}`);
    return false;
  }
}

/**
 * 自动检测可用的API地址
 */
async function detectWorkingApiUrl(): Promise<string> {
  if (workingApiUrl) {
    return workingApiUrl;
  }

  console.log('🔍 开始检测可用的API地址...');
  
  // 首先检查默认地址
  if (await checkApiConnection(API_BASE_URL)) {
    workingApiUrl = API_BASE_URL;
    return workingApiUrl;
  }
  
  // 检查备用地址
  for (const url of FALLBACK_API_URLS) {
    if (url !== API_BASE_URL && await checkApiConnection(url)) {
      workingApiUrl = url;
      API_BASE_URL = url;
      console.log(`🎯 切换到可用API: ${url}`);
      return workingApiUrl;
    }
  }
  
  console.warn('⚠️ 未找到可用的API地址，使用默认配置');
  workingApiUrl = DEFAULT_API_URL;
  return workingApiUrl;
}

// 请求和响应的类型定义
export interface ChatRequest {
  message: string;
  session_id: string;
  user_id: string;
  farewell_type?: string;
  farewell_name?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  suggestions: string[];
  is_completion_ready: boolean;
}

export interface FarewellGuidanceRequest {
  farewell_type: string;
  farewell_name: string;
}

export interface FarewellGuidanceResponse {
  guidance_text: string;
  farewell_type: string;
  farewell_name: string;
  timestamp: string;
}

export interface ApiError {
  error: boolean;
  message: string;
  timestamp: string;
  path: string;
}

/**
 * 通用的API请求函数 - 集成JWT认证
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 首次调用时检测可用的API地址
  if (!workingApiUrl) {
    API_BASE_URL = await detectWorkingApiUrl();
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 获取JWT Token
  const token = await getCurrentToken();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      // 如果有Token，添加到Authorization头中
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 API请求: ${options.method || 'GET'} ${url}`);
    if (token) {
      console.log(`🔐 携带JWT Token: ${token.substring(0, 20)}...`);
    } else {
      console.log(`⚠️ 未携带JWT Token - 用户可能未登录`);
    }
    
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        // 如果无法解析错误响应，使用默认错误消息
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ API响应成功:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ API请求失败:`, error);
    
    // 网络错误处理
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查后端服务是否正常运行');
    }
    
    throw error;
  }
}

/**
 * 发送聊天消息到AI
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    return await apiRequest<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  } catch (error) {
    console.error('聊天API调用失败:', error);
    throw error;
  }
}

/**
 * 获取告别引导文字
 */
export async function getFarewellGuidance(request: FarewellGuidanceRequest): Promise<FarewellGuidanceResponse> {
  try {
    return await apiRequest<FarewellGuidanceResponse>('/api/farewell/guidance', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  } catch (error) {
    console.error('告别引导API调用失败:', error);
    throw error;
  }
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<any> {
  try {
    return await apiRequest<any>('/api/health', {
      method: 'GET',
    });
  } catch (error) {
    console.error('健康检查失败:', error);
    throw error;
  }
}

/**
 * 生成唯一的会话ID - UUID格式
 */
export function generateSessionId(): string {
  // 使用相同的UUID生成逻辑
  return generateUserId();
}

/**
 * 生成唯一的用户ID (UUID格式) - 修复版本
 */
export function generateUserId(): string {
  // 生成真正的UUID v4格式
  const hex = '0123456789abcdef';
  let uuid = '';
  
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    if (i === 12) {
      uuid += '4'; // UUID v4的版本标识
    } else if (i === 16) {
      uuid += hex[(Math.random() * 4 | 0) + 8]; // 8, 9, a, b
    } else {
      uuid += hex[Math.random() * 16 | 0];
    }
  }
  
  return uuid;
}

// 临时存储用户ID（在实际应用中应该使用AsyncStorage）
let temporaryUserId: string | null = null;

/**
 * 获取或创建用户ID (持久化存储) - 增强版本
 */
export function getUserId(): string {
  // 在实际应用中，这里应该从AsyncStorage获取
  // 为了演示，我们使用临时变量存储
  // 在生产环境中，应该实现真正的用户登录系统
  
  if (!temporaryUserId) {
    // 生成新的用户ID
    temporaryUserId = generateUserId();
    console.log('🆔 生成新用户ID:', temporaryUserId);
    
    // 验证生成的UUID格式
    if (!uuidRegex.test(temporaryUserId)) {
      console.error('❌ 生成的UUID格式无效:', temporaryUserId);
      // 如果格式无效，使用一个已知有效的UUID
      temporaryUserId = '550e8400-e29b-41d4-a716-446655440000';
      console.log('🔧 使用备用UUID:', temporaryUserId);
    }
  } else {
    console.log('🆔 使用已存在的用户ID:', temporaryUserId);
  }
  
  return temporaryUserId;
}

/**
 * 错误处理工具函数
 */
export function handleApiError(error: any): string {
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '网络连接失败，请检查后端服务是否正常运行';
}

/**
 * 手动刷新API连接检测
 */
export async function refreshApiConnection(): Promise<string> {
  workingApiUrl = null;
  return await detectWorkingApiUrl();
}

/**
 * 获取当前使用的API地址
 */
export function getCurrentApiUrl(): string {
  return API_BASE_URL;
} 