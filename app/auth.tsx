/**
 * 用户认证界面
 * 包含登录和注册功能
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  registerUser, 
  loginUser, 
  RegisterData, 
  LoginData 
} from '../utils/supabaseAuth';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // true: 登录, false: 注册
  const [isLoading, setIsLoading] = useState(false);
  
  // 表单数据
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  /**
   * 处理用户登录
   */
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('提示', '请填写邮箱和密码');
      return;
    }

    setIsLoading(true);
    try {
      const loginData: LoginData = {
        email: email.trim(),
        password: password
      };

      const result = await loginUser(loginData);
      
      if (result.success) {
        Alert.alert('登录成功', `欢迎回来，${result.user?.email}！`, [
          { 
            text: '确定', 
            onPress: () => {
              // 登录成功后跳转到主页
              router.replace('/(tabs)');
            }
          }
        ]);
      } else {
        Alert.alert('登录失败', result.error || '未知错误');
      }
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理用户注册
   */
  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('提示', '请填写邮箱和密码');
      return;
    }

    if (password.length < 6) {
      Alert.alert('提示', '密码长度至少6位');
      return;
    }

    setIsLoading(true);
    try {
      const registerData: RegisterData = {
        email: email.trim(),
        password: password,
        displayName: displayName.trim() || undefined
      };

      const result = await registerUser(registerData);
      
      if (result.success) {
        Alert.alert(
          '注册成功', 
          '账户创建成功！请查看邮箱确认邮件。', 
          [
            { 
              text: '确定', 
              onPress: () => {
                // 注册成功后切换到登录模式
                setIsLogin(true);
                setPassword(''); // 清空密码
              }
            }
          ]
        );
      } else {
        Alert.alert('注册失败', result.error || '未知错误');
      }
    } catch (error: any) {
      Alert.alert('注册失败', error.message || '网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 跳过登录，以游客身份使用
   */
  const handleSkipLogin = () => {
    Alert.alert(
      '游客模式',
      '游客模式下无法保存聊天记录，确定继续吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          onPress: () => router.replace('/(tabs)')
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 背景图片 */}
      <Image 
        source={require('../assets/images/background_optimized.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        {/* 标题区域 */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>RIPractice</Text>
          <Text style={styles.subtitle}>温柔的告别练习</Text>
        </View>

        {/* 表单区域 */}
        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, isLogin && styles.activeTab]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                登录
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, !isLogin && styles.activeTab]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                注册
              </Text>
            </TouchableOpacity>
          </View>

          {/* 输入字段 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />

            {/* 注册模式下显示昵称输入 */}
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="昵称（可选）"
                value={displayName}
                onChangeText={setDisplayName}
                editable={!isLoading}
              />
            )}
          </View>

          {/* 操作按钮 */}
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isLogin ? '登录' : '注册'}
              </Text>
            )}
          </TouchableOpacity>

          {/* 跳过登录按钮 */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSkipLogin}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>游客模式</Text>
          </TouchableOpacity>
        </View>
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
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(247, 230, 230, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(240, 240, 240, 0.5)',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
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
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.5)',
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 182, 185, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 182, 185, 0.9)',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: 'rgba(255, 182, 185, 1)',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
  },
}); 