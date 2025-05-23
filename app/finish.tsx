import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface FarewellData {
  id: string;
  name: string;
  date: string;
  image: string;
  goodbyeText: string;
}

export default function FinishScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // 从参数中获取用户的告别主题、最后消息和选择的墓碑样式
  const goodbyeTheme = params.theme as string || '过去的自己';
  const lastMessage = params.lastMessage as string || '谢谢你曾经的陪伴，我会带着祝福继续前行。';
  const selectedTomb = params.selectedTomb as string || 'style1';
  
  // 墓碑样式映射
  const tombImages = {
    style1: require('../assets/images/ripractice/style1.png'),
    style2: require('../assets/images/ripractice/style2.png'),
    style3: require('../assets/images/ripractice/style3.png'),
    style4: require('../assets/images/ripractice/style4.png'),
  };
  
  // 根据用户选择获取对应的墓碑图片
  const tombImg = tombImages[selectedTomb as keyof typeof tombImages] || tombImages.style1;

  // 保存告别数据并跳转
  const handleSaveAndNavigate = async () => {
    try {
      // 创建新的告别记录
      const newFarewell: FarewellData = {
        id: Date.now().toString(),
        name: goodbyeTheme,
        date: new Date().toISOString().split('T')[0],
        image: selectedTomb,
        goodbyeText: lastMessage,
      };

      // 获取现有的告别记录
      const existingData = await AsyncStorage.getItem('farewells');
      const farewells: FarewellData[] = existingData ? JSON.parse(existingData) : [];
      
      // 添加新记录
      farewells.push(newFarewell);
      
      // 保存到AsyncStorage
      await AsyncStorage.setItem('farewells', JSON.stringify(farewells));
      
      // 跳转到墓园页面
      router.push('/(tabs)/cemetery' as any);
    } catch (error) {
      console.error('保存告别数据失败:', error);
      // 即使保存失败也跳转
      router.push('/(tabs)/cemetery' as any);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={tombImg} 
        style={styles.background}
        resizeMode="cover"
      >
        {/* 固定在屏幕3/4位置的文字 */}
        <View style={styles.textPositioner}>
          <View style={styles.engravedTextContainer}>
            <Text style={styles.engravedTitle}>
              再见，{goodbyeTheme}
            </Text>
            <Text style={styles.engravedText}>
              {lastMessage}
            </Text>
            <Text style={styles.dateText}>
              {new Date().toISOString().split('T')[0]}
            </Text>
          </View>
        </View>
      </ImageBackground>
      
      {/* 按钮固定在屏幕底部 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.btn} 
          onPress={handleSaveAndNavigate}
        >
          <Text style={styles.btnText}>前往内心墓园</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    flex: 1,
    width: width,
  },
  textPositioner: {
    position: 'absolute',
    top: '75%', // 放置在屏幕3/4处
    left: 0,
    right: 0,
    transform: [{ translateY: -80 }], // 微调，使文字区域中心在3/4处
    alignItems: 'center',
  },
  engravedTextContainer: {
    alignItems: 'center',
    width: '90%',
    padding: 16,
  },
  engravedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#777',
    marginBottom: 16,
    textAlign: 'center',
    // 刻印效果
    textShadowColor: '#fff',
    textShadowOffset: { width: -1, height: -1 },
    textShadowRadius: 1,
    // 需要两个阴影来模拟内凹效果
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 1,
    fontFamily: 'serif',
    letterSpacing: 2,
  },
  engravedText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    lineHeight: 24,
    // 刻印效果
    textShadowColor: '#fff',
    textShadowOffset: { width: -1, height: -1 },
    textShadowRadius: 1,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 1,
    fontFamily: 'serif',
    letterSpacing: 1,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    // 刻印效果
    textShadowColor: '#fff',
    textShadowOffset: { width: -1, height: -1 },
    textShadowRadius: 1,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 1,
    fontFamily: 'serif',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#ffb6b9',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20, // 为了不贴近底部边缘
  },
  btnText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18
  }
}); 