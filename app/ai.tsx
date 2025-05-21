import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Image } from 'react-native';
import { useRouter } from 'expo-router';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
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
  const [activeTab, setActiveTab] = useState<'guide' | 'chat'>('guide');
  const [userInput, setUserInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '你好，我在这里陪你完成这次告别。请告诉我你想要告别的是什么？',
      isUser: false
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

  const handleSend = () => {
    if (userInput.trim() === '') return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userInput,
      isUser: true
    };
    
    setMessages(prev => {
      const latestMessages = [...prev, newUserMessage].slice(-5);
      return latestMessages;
    });
    setUserInput('');
    Keyboard.dismiss();

    setTimeout(() => {
      const aiResponses = [
        '这听起来是个重要的练习。你能多告诉我一些关于这件事的感受吗？',
        '告别确实需要勇气。你想从哪个角度开始这次告别？',
        '理解你的感受。如果要对这段经历说最后的话，你会说什么？',
        '这是很有价值的思考。你觉得这次告别对你的意义是什么？'
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const newAIMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false
      };
      
      setMessages(prev => {
        const latestMessages = [...prev, newAIMessage].slice(-6);
        return latestMessages;
      });
    }, 1000);
  };

  const handlePromptSelect = (prompt: string) => {
    setUserInput(prompt);
    setActiveTab('chat');
    setShowPrompts(false);
  };

  const handleComplete = () => {
    router.push('/finish' as any);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Image 
        source={require('../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
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
                source={require('../assets/images/ripractice/chatnew.png')}
                style={styles.chatBackgroundImage}
                resizeMode="stretch"
              />
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
              </ScrollView>
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
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>发送</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>完成告别</Text>
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
  }
}); 