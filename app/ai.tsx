import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { sendChatMessage, generateSessionId, handleApiError, type ChatRequest, type ChatResponse } from '../utils/api';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: Date;
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
  const [isCompletionReady, setIsCompletionReady] = useState(false);
  
  // 获取从select页面传递的参数
  const goodbyeTheme = params.theme as string || '';
  const selectedTomb = params.style as string || 'style1';
  
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

  const handleSend = async () => {
    if (userInput.trim() === '' || isLoading) return;

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
      // 构建API请求
      const chatRequest: ChatRequest = {
        message: userMessage,
        session_id: sessionId,
        farewell_type: goodbyeTheme || 'general',
        context: {
          theme: goodbyeTheme,
          tomb_style: selectedTomb
        }
      };

      console.log('🚀 发送聊天请求:', chatRequest);

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

      // 如果有建议回复，可以在这里处理
      if (response.suggestions && response.suggestions.length > 0) {
        console.log('💡 AI建议回复:', response.suggestions);
      }

    } catch (error) {
      console.error('❌ 聊天API调用失败:', error);
      
      // 显示错误消息
      const errorMessage = handleApiError(error);
      Alert.alert(
        '连接失败', 
        `无法连接到AI服务：${errorMessage}\n\n请确保后端服务正在运行。`,
        [
          { text: '重试', onPress: () => handleSend() },
          { text: '取消', style: 'cancel' }
        ]
      );

      // 添加错误提示消息
      const errorAIMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: '抱歉，我暂时无法回复。请检查网络连接或稍后再试。',
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
  };

  const handleComplete = () => {
    // 获取用户最后发送的消息
    const userMessages = messages.filter(msg => msg.isUser);
    const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : '';
    
    router.push({
      pathname: '/finish',
      params: {
        lastMessage: lastUserMessage,
        theme: goodbyeTheme,
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
          {/* 显示会话ID（调试用） */}
          <Text style={styles.debugText}>会话ID: {sessionId.slice(-8)}</Text>
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
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="开始告别..."
            multiline
            editable={!isLoading}
          />
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
    color: '#333',
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
    backgroundColor: 'rgba(255, 182, 185, 0.9)',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: '#333',
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
    width: '95%',
    alignSelf: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 48,
    marginRight: 8,
    minHeight: 48,
  },
  sendButton: {
    backgroundColor: 'rgba(255, 182, 185, 0.9)',
    width: 60,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  sendButtonText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: 'rgba(255, 182, 185, 0.9)',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 32,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completeButtonReady: {
    backgroundColor: 'rgba(255, 182, 185, 0.9)',
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
}); 