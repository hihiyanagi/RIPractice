/**
 * API 工具函数
 * 封装与后端服务的通信
 */

// API 基础配置 - 支持环境变量
// 使用本机IP地址，这样移动设备就能访问了
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.3.187:8000';

console.log('🌐 API Base URL:', API_BASE_URL);

// 请求和响应的类型定义
export interface ChatRequest {
  message: string;
  session_id: string;
  farewell_type?: string;
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
 * 通用的API请求函数
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 API请求: ${options.method || 'GET'} ${url}`);
    
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
  } catch (error) {
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
 * 生成唯一的会话ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${random}`;
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
 * 检查API连接状态
 */
export async function checkApiConnection(): Promise<boolean> {
  try {
    await healthCheck();
    return true;
  } catch (error) {
    console.error('API连接检查失败:', error);
    return false;
  }
} 