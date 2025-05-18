import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

const promptsList = [
  '回忆你们相遇的场景，以及当时的感受。',
  '如果能对过去的自己说一句话，你会说什么？',
  '你最感谢这段经历带给你的是什么？',
  '这段经历教会了你什么，让你成长的地方是？',
  '如果可以重来一次，你会做出什么不同的选择？',
  '曾经的感受，现在想来有什么不同吗？',
  '你希望未来的自己如何面对类似的情况？',
  '允许自己表达遗憾和不舍，你想说什么？'
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
    
    setMessages(prev => [...prev, newUserMessage]);
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
      
      setMessages(prev => [...prev, newAIMessage]);
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
                style={styles.promptItem}
                onPress={() => handlePromptSelect(prompt)}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7e6e6',
  },
  introContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 182, 185, 0.3)',
    borderRadius: 8,
    margin: 16,
    marginTop: 24
  },
  introText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4
  },
  activeTab: {
    backgroundColor: '#ffb6b9',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16
  },
  promptsContainer: {
    flex: 1,
  },
  promptItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  promptText: {
    color: '#6a5acd',
    fontSize: 15,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#ffb6b9',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#ffb6b9',
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    marginLeft: 8,
  },
  sendButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  completeButton: {
    backgroundColor: '#ffb6b9',
    margin: 16,
    padding: 16,
    borderRadius: 32,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  }
}); 