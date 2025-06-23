import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { sendChatMessage, generateSessionId, getUserId, handleApiError, getCurrentApiUrl, refreshApiConnection, type ChatRequest, type ChatResponse } from '../utils/api';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: Date;
}

interface ApiConnectionStatus {
  isConnected: boolean;
  currentUrl: string;
  error?: string;
}

/**
 * 根据告别类型和用户消息生成合适的告别对象名称
 */
function generateFarewellName(farewellType: string, userMessage: string): string {
  // 简单的名称生成逻辑，可以根据需要优化
  switch (farewellType) {
    case 'relationship':
      if (userMessage.includes('前任') || userMessage.includes('前男友') || userMessage.includes('前女友')) {
        return '前任';
      }
      if (userMessage.includes('朋友')) {
        return '朋友';
      }
      if (userMessage.includes('恋人')) {
        return '恋人';
      }
      return '那个人';
    
    case 'emotion':
      if (userMessage.includes('愤怒') || userMessage.includes('生气')) {
        return '愤怒';
      }
      if (userMessage.includes('悲伤') || userMessage.includes('难过')) {
        return '悲伤';
      }
      if (userMessage.includes('恐惧') || userMessage.includes('害怕')) {
        return '恐惧';
      }
      return '那种情绪';
    
    case 'experience':
      if (userMessage.includes('工作') || userMessage.includes('职业')) {
        return '那份工作';
      }
      if (userMessage.includes('学校') || userMessage.includes('学习')) {
        return '校园时光';
      }
      return '那段经历';
    
    case 'identity':
      if (userMessage.includes('完美主义')) {
        return '完美主义的自己';
      }
      if (userMessage.includes('懒惰')) {
        return '懒惰的自己';
      }
      return '那个角色';
    
    case 'past-self':
      return '过去的自己';
    
    default:
      return '要告别的东西';
  }
}

const promptsList = [
  '你舍不得的是什么？此刻又是什么让你愿意放手？',
  '允许所有感受浮现——想念、愤怒、遗憾、不舍。',
  '回忆它在你心中最后的模样，最后一次温柔凝视。',
  '鼓起勇气，告别可以只是你一个人的决定。',
  '对它说一句，哪怕只是："谢谢你"或"再见了"。',
  '轻声说：我准备好了，过去留在这里，我继续往前走。'
];

export default function AIScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'guide' | 'chat'>('guide');
  const [userInput, setUserInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  const [chatImageLoaded, setChatImageLoaded] = useState(false);
  const [showChatContent, setShowChatContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [userId] = useState(() => getUserId());
  const [isCompletionReady, setIsCompletionReady] = useState(false);
  const [farewellName, setFarewellName] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ApiConnectionStatus>({
    isConnected: false,
    currentUrl: getCurrentApiUrl()
  });
  
  // 获取从select页面传递的参数
  const farewellType = params.type as string || 'emotion';  // 告别类型：relationship/experience/emotion/identity/past-self
  const selectedTomb = params.style as string || 'style1';
  const farewellTheme = params.theme as string || '';        // 用户输入的告别主题名称
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '你好，我在这里陪你完成这次告别。请告诉我你想要告别的是什么？',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // 在组件加载时检查API连接
  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      const currentUrl = getCurrentApiUrl();
      console.log('🔍 检查API连接状态:', currentUrl);
      
      // 刷新连接检测
      const workingUrl = await refreshApiConnection();
      
      setConnectionStatus({
        isConnected: true,
        currentUrl: workingUrl
      });
      
      console.log('✅ API连接正常:', workingUrl);
    } catch (error: any) {
      console.error('❌ API连接失败:', error);
      setConnectionStatus({
        isConnected: false,
        currentUrl: getCurrentApiUrl(),
        error: error.message || '连接失败'
      });
    }
  };

  const handleSend = async () => {
    if (userInput.trim() === '' || isLoading) return;

    // 如果API连接有问题，先尝试重新连接
    if (!connectionStatus.isConnected) {
      await checkApiConnection();
    }

    const userMessage = userInput.trim();
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    // 添加用户消息到界面
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      // 如果还没有设置告别对象名称，根据用户消息生成一个
      const currentFarewellName = farewellName || generateFarewellName(farewellType, userMessage);
      
      // 如果是第一次设置，保存到状态中
      if (!farewellName) {
        setFarewellName(currentFarewellName);
      }
      
      // 构建API请求
      const chatRequest: ChatRequest = {
        message: userMessage,
        session_id: sessionId,
        user_id: userId,
        farewell_type: farewellType,
        farewell_name: currentFarewellName,
        context: {
          theme: farewellTheme,
          tomb_style: selectedTomb,
          message_count: messages.length
        }
      };

      console.log('🚀 发送聊天请求:', chatRequest);
      console.log('🌐 使用API地址:', getCurrentApiUrl());

      // 调用后端API
      const response: ChatResponse = await sendChatMessage(chatRequest);
      
      console.log('✅ 收到AI回复:', response);

      // 添加AI回复到界面
      const newAIMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAIMessage]);
      setIsCompletionReady(response.is_completion_ready);

      // 更新连接状态为成功
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        error: undefined
      }));

      // 如果有建议回复，可以在这里处理
      if (response.suggestions && response.suggestions.length > 0) {
        console.log('💡 AI建议回复:', response.suggestions);
      }

    } catch (error) {
      console.error('❌ 聊天API调用失败:', error);
      
      // 更新连接状态
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        error: handleApiError(error)
      }));
      
      // 显示错误消息
      const errorMessage = handleApiError(error);
      Alert.alert(
        '连接失败', 
        `无法连接到AI服务：${errorMessage}\n\n当前API地址：${getCurrentApiUrl()}\n\n请确保：\n1. 后端服务正在运行\n2. 手机和电脑在同一网络\n3. IP地址配置正确`,
        [
          { text: '重试连接', onPress: () => checkApiConnection() },
          { text: '重试发送', onPress: () => handleSend() },
          { text: '取消', style: 'cancel' }
        ]
      );

      // 添加错误提示消息
      const errorAIMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: `抱歉，我暂时无法回复。连接问题：${errorMessage}\n\n当前API: ${getCurrentApiUrl()}`,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorAIMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setUserInput(prompt);
    setActiveTab('chat');
    setShowPrompts(false);
    setShowChatContent(false);
    setSelectedPrompt(prompt);
  };

  const handleComplete = () => {
    let farewellMessage = '';
    
    if (activeTab === 'guide') {
      // 场景1：在引导页面，优先使用输入框内容，其次是选择的引导词
      if (userInput.trim()) {
        farewellMessage = userInput.trim();
      } else if (selectedPrompt) {
        farewellMessage = selectedPrompt;
      }
    } else {
      // 场景2：在聊天页面，使用最后发送的消息
      const userMessages = messages.filter(msg => msg.isUser);
      farewellMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : '';
    }
    
    router.push({
      pathname: '/finish',
      params: {
        lastMessage: farewellMessage,
        theme: farewellTheme,
        selectedTomb: selectedTomb,
        sessionId: sessionId
      }
    } as any);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Image 
        source={require('../assets/images/background_optimized.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
        onLoad={() => setBackgroundImageLoaded(true)}
        onError={() => setBackgroundImageLoaded(true)}
      />
      <View style={styles.contentWrapper}>
        <View style={styles.introContainer}>
          <Text style={styles.introText}>
            "嗨，我是为这场告别而来的小信使。准备好了吗？让我带你走进内心的小小墓园，开始一场告别的练习。"
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'guide' && styles.activeTab]}
            onPress={() => {
              setActiveTab('guide');
              setShowPrompts(true);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'guide' && styles.activeTabText]}>告别引导</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'chat' && styles.activeTab]}
            onPress={() => {
              setActiveTab('chat');
              setShowPrompts(false);
              setShowChatContent(false);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>和我聊聊</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          {activeTab === 'guide' && showPrompts ? (
            <ScrollView style={styles.promptsContainer}>
              {promptsList.map((prompt, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.promptItem,
                    index === promptsList.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => handlePromptSelect(prompt)}
                >
                  <Text style={styles.promptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.chatWrapper}>
              <Image
                source={require('../assets/images/ripractice/chatnew_optimized.png')}
                style={styles.chatBackgroundImage}
                resizeMode="stretch"
                onLoad={() => setShowChatContent(true)}
                onError={() => setShowChatContent(true)}
              />
              {showChatContent && (
                <ScrollView 
                  ref={scrollViewRef}
                  style={styles.chatContainer}
                  contentContainerStyle={styles.chatContent}
                >
                  {messages.map(message => (
                    <View 
                      key={message.id} 
                      style={[
                        styles.messageBubble, 
                        message.isUser ? styles.userBubble : styles.aiBubble
                      ]}
                    >
                      <Text style={styles.messageText}>{message.text}</Text>
                    </View>
                  ))}
                  {/* 加载指示器 */}
                  {isLoading && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#666" />
                      <Text style={styles.loadingText}>AI正在思考...</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              activeTab === 'guide' && styles.inputFullWidth // 引导页面输入框占满宽度
            ]}
            value={userInput}
            onChangeText={setUserInput}
            placeholder={activeTab === 'guide' ? "输入你的告别词..." : "开始告别..."}
            multiline
            editable={!isLoading}
          />
          {/* 只在聊天页面显示发送按钮 */}
          {activeTab === 'chat' && (
            <TouchableOpacity 
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#333" />
              ) : (
                <Text style={styles.sendButtonText}>发送</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.completeButton, isCompletionReady && styles.completeButtonReady]} 
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>
            {isCompletionReady ? '完成告别 ✨' : '完成告别'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: 'rgba(247, 230, 230, 0.3)',
  },
  introContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 182, 185, 0.2)',
    borderRadius: 8,
    margin: 16,
    marginTop: 16
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#ffc8dd',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 4,
    maxWidth: 160,
  },
  activeTab: {
    backgroundColor: '#ffc8dd',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#66666e',
    fontFamily: 'xiaowan',
    fontSize: 16,
  },
  activeTabText: {
    color: '#66666e',
    fontFamily: 'xiaowan',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 0,
    width: '95%',
    alignSelf: 'center',
  },
  promptsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  promptItem: {
    padding: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.5)',
    width: '100%',
    backgroundColor: 'transparent',
  },
  promptText: {
    color: '#6a5acd',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
  chatWrapper: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBackgroundImage: {
    position: 'absolute',
    top: '-17%',
    left: '-7%',
    width: '119%',
    height: undefined,
    aspectRatio: 0.63,
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    width: '30%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    top: '-2%',
    aspectRatio: 0.7,
    transform: [{ scaleY: 0.7 }],
    maxHeight: '85%',
  },
  chatContent: {
    padding: 12,
    paddingTop: 16,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    maxWidth: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: [{ scaleY: 1.12 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: 'rgba(255, 182, 185, 0.9)',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    marginRight: 6,
  },
  aiBubble: {
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    marginLeft: 6,
  },
  messageText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#333',
    transform: [{ scaleY: 1.43 }],
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  input: {
    flex: 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 48,
    marginRight: 8,
    minHeight: 48,
  },
  inputFullWidth: {
    marginRight: 0,
  },
  sendButton: {
    backgroundColor: '#ffc8dd',
    width: 80,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  sendButtonText: {
    fontWeight: 'bold',
    color: '#66666e',
    fontSize: 16,
    fontFamily: 'AaHouDiHei',
  },
  completeButton: {
    backgroundColor: '#ffc8dd',
    margin: 16,
    marginTop: 'auto',
    marginBottom: 24,
    padding: 12,
    borderRadius: 32,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  completeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#66666e',
    fontFamily: 'AaHouDiHei',
  },
  completeButtonReady: {
    backgroundColor: '#ffc8dd',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(238, 238, 238, 0.9)',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 182, 185, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  debugInfo: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
}); 