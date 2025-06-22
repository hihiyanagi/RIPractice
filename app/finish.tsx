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
    top: '78%', // 从77%改为78%，向下移动1%
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
    color: '#e1d8f7',
    marginBottom: 16,
    textAlign: 'center',
    // 增强阴影效果让文字更明显
    shadowColor: '#2a2a2a',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1.0, // 增强阴影不透明度
    shadowRadius: 5, // 增大阴影模糊半径
    elevation: 8, // 提升立体效果
    fontFamily: 'AaHouDiHei',
    letterSpacing: 2,
  },
  engravedText: {
    fontSize: 18,
    color: '#e1d8f7',
    textAlign: 'center',
    lineHeight: 26,
    // 增强阴影效果让文字更明显
    shadowColor: '#2a2a2a',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.9, // 增强阴影不透明度
    shadowRadius: 4, // 增大阴影模糊半径
    elevation: 6, // 提升立体效果
    fontFamily: 'AaHouDiHei',
    letterSpacing: 1,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#e1d8f7',
    textAlign: 'center',
    // 增强阴影效果让文字更明显
    shadowColor: '#2a2a2a',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8, // 增强阴影不透明度
    shadowRadius: 3, // 增大阴影模糊半径
    elevation: 5, // 提升立体效果
    fontFamily: 'AaHouDiHei',
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
    backgroundColor: '#ffc8dd',
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
    color: '#66666e',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'AaHouDiHei',
  }
}); 