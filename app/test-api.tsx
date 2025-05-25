import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  healthCheck, 
  sendChatMessage, 
  getFarewellGuidance, 
  generateSessionId, 
  checkApiConnection,
  handleApiError 
} from '../utils/api';

export default function TestAPIScreen() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  useEffect(() => {
    checkConnection();
  }, []);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const isConnected = await checkApiConnection();
      setApiStatus(isConnected ? 'connected' : 'disconnected');
      addResult(isConnected ? '✅ API连接正常' : '❌ API连接失败');
    } catch (error) {
      setApiStatus('disconnected');
      addResult(`❌ 连接检查失败: ${handleApiError(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setIsLoading(true);
    addResult('🔍 开始健康检查测试...');
    
    try {
      const result = await healthCheck();
      addResult(`✅ 健康检查成功: ${result.status}`);
      addResult(`   版本: ${result.version}`);
      addResult(`   ARK状态: ${result.services?.volcengine_ark}`);
    } catch (error) {
      addResult(`❌ 健康检查失败: ${handleApiError(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testChatAPI = async () => {
    setIsLoading(true);
    addResult('🤖 开始聊天API测试...');
    
    try {
      const sessionId = generateSessionId();
      const request = {
        message: "你好，我想开始一段告别练习",
        session_id: sessionId,
        farewell_type: "relationship",
        context: { theme: "relationship" }
      };

      addResult(`📤 发送消息: ${request.message}`);
      
      const response = await sendChatMessage(request);
      
      addResult(`✅ 聊天API成功`);
      addResult(`   AI回复: ${response.message.substring(0, 50)}...`);
      addResult(`   会话ID: ${response.session_id.substring(0, 20)}...`);
      addResult(`   建议数量: ${response.suggestions?.length || 0}`);
      addResult(`   可完成告别: ${response.is_completion_ready}`);
    } catch (error) {
      addResult(`❌ 聊天API失败: ${handleApiError(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGuidanceAPI = async () => {
    setIsLoading(true);
    addResult('🌟 开始告别引导API测试...');
    
    try {
      const request = {
        farewell_type: "relationship",
        farewell_name: "测试对象"
      };

      addResult(`📤 请求引导: ${request.farewell_type} - ${request.farewell_name}`);
      
      const response = await getFarewellGuidance(request);
      
      addResult(`✅ 告别引导API成功`);
      addResult(`   引导文字: ${response.guidance_text.substring(0, 50)}...`);
      addResult(`   告别类型: ${response.farewell_type}`);
      addResult(`   告别对象: ${response.farewell_name}`);
    } catch (error) {
      addResult(`❌ 告别引导API失败: ${handleApiError(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('🧪 开始完整API测试...');
    
    await testHealthCheck();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testChatAPI();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGuidanceAPI();
    
    addResult('🎉 所有测试完成！');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected': return '✅ 已连接';
      case 'disconnected': return '❌ 未连接';
      default: return '⏳ 检查中';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API 连接测试</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={checkConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>检查连接</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testHealthCheck}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>健康检查</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testChatAPI}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>测试聊天</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testGuidanceAPI}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>测试引导</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.successButton]} 
          onPress={runAllTests}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>运行所有测试</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={clearResults}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>清空结果</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>测试结果:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
        {isLoading && (
          <Text style={styles.loadingText}>⏳ 测试进行中...</Text>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>返回</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#9C27B0',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#FF9800',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  backButton: {
    backgroundColor: '#666',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 