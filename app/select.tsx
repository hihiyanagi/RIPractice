import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';

interface TombStyle {
  id: string;
  name: string;
  image: any;
}

interface GoodbyeType {
  id: string;
  name: string;
  description: string;
  icon: any;
}

// 将数据定义移到组件外部
const tombStyles: TombStyle[] = [
  { id: 'style1', name: '简约', image: require('../assets/images/ripractice/style1_optimized.jpg') },
  { id: 'style2', name: '传统', image: require('../assets/images/ripractice/style2_optimized.jpg') },
  { id: 'style3', name: '现代', image: require('../assets/images/ripractice/style3_optimized.jpg') },
  { id: 'style4', name: '艺术', image: require('../assets/images/ripractice/style4_optimized.jpg') },
  { id: 'style5', name: '优雅', image: require('../assets/images/ripractice/style5_optimized.jpg') },
];

const goodbyeTypes: GoodbyeType[] = [
  { 
    id: 'relationship', 
    name: '关系', 
    description: '走近过、牵挂过，也可以放下了',
    icon: require('../assets/images/ripractice/relationship.png')
  },
  { 
    id: 'experience', 
    name: '经历', 
    description: '一段路走过就好，值得纪念，也值得告别',
    icon: require('../assets/images/ripractice/experience.png')
  },
  { 
    id: 'emotion', 
    name: '情绪', 
    description: '它曾陪你熬过一些时刻，现在慢慢放下',
    icon: require('../assets/images/ripractice/emotion.png')
  },
  {
    id: 'identity',
    name: '身份',
    description: '曾努力扮演过的角色，不坚守也无妨',
    icon: require('../assets/images/ripractice/identity.png')
  },
  {
    id: 'past-self',
    name: '曾经的我',
    description: '那个你，曾真实存在，也能被温柔告别',
    icon: require('../assets/images/ripractice/past-self.png')
  }
];

export default function SelectScreen() {
  console.log('SelectScreen 组件开始渲染');
  
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedTomb, setSelectedTomb] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [goodbyeTheme, setGoodbyeTheme] = useState<string>('');

  // 加载自定义字体
  const [fontsLoaded] = useFonts({
    // 尝试多种字体名称
    'CangErXiaoWanZi-2': require('../assets/fonts/CangErXiaoWanZi-2.ttf'),
    'CangErXiaoWanZi': require('../assets/fonts/CangErXiaoWanZi-2.ttf'),
    'cangErXiaoWanZi': require('../assets/fonts/CangErXiaoWanZi-2.ttf'),
    'xiaowan': require('../assets/fonts/CangErXiaoWanZi-2.ttf'), // 尝试简单名称
    'AaHouDiHei': require('../assets/fonts/AaHouDiHei.ttf'),
  });

  // 确保在移动端正确显示页面
  useEffect(() => {
    console.log('SelectScreen useEffect 执行');
    if (Platform.OS !== 'web') {
      // 确保页面标题在移动端正确显示
      if (navigation.setOptions) {
        navigation.setOptions({
          title: '选择告别方式',
          headerShown: true
        });
      }
    }
  }, [navigation]);

  // 字体加载完成后隐藏启动屏幕并预加载图片
  useEffect(() => {
    if (fontsLoaded) {
      console.log('字体加载完成!', fontsLoaded);
      SplashScreen.hideAsync();
      
      // 预加载图片以提升性能
      const preloadImages = async () => {
        try {
          // 预加载墓碑图片
          await Promise.all(tombStyles.map(style => Image.prefetch(style.image)));
          // 预加载图标
          await Promise.all(goodbyeTypes.map(type => Image.prefetch(type.icon)));
          console.log('所有图片预加载完成!');
        } catch (error) {
          console.log('图片预加载失败:', error);
        }
      };
      
      preloadImages();
    }
  }, [fontsLoaded]);

  // 如果字体还没加载完成，不渲染内容
  if (!fontsLoaded) {
    return null;
  }

  const handleContinue = () => {
    if (selectedTomb && selectedType && goodbyeTheme.trim()) {
      // 处理移动端和网页端的不同导航方式
      if (Platform.OS === 'web') {
        router.push({
          pathname: '/ai',
          params: {
            type: selectedType,
            style: selectedTomb,
            theme: goodbyeTheme.trim()
          }
        } as any);
      } else {
        try {
          router.navigate({
            pathname: '/ai',
            params: {
              type: selectedType,
              style: selectedTomb,
              theme: goodbyeTheme.trim()
            }
          } as any);
        } catch (error) {
          router.push({
            pathname: '/ai',
            params: {
              type: selectedType,
              style: selectedTomb,
              theme: goodbyeTheme.trim()
            }
          } as any);
        }
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Image 
        source={require('../assets/images/background_optimized.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
        priority="high"
        cachePolicy="memory-disk"
        onError={(error) => {
          console.error('背景图片加载失败:', error);
        }}
        onLoad={() => {
          console.log('背景图片加载成功');
        }}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>这次，你想和什么告别呢</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {goodbyeTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeItem,
                selectedType === type.id && styles.selectedType
              ]}
              onPress={() => setSelectedType(type.id)}
              activeOpacity={0.7}
            >
              <View style={styles.typeContent}>
                <Image 
                  source={type.icon} 
                  style={styles.typeIcon}
                  contentFit="contain"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <Text style={styles.typeName}>{type.name}</Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>给这段告别，起个名字吧</Text>
        <View style={styles.themeInputContainer}>
          <TextInput
            style={styles.themeInput}
            placeholder="请输入告别主题..."
            value={goodbyeTheme}
            onChangeText={setGoodbyeTheme}
            maxLength={50}
          />
        </View>

        <Text style={styles.sectionTitle}>为它选一个安放的地方吧</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tombScroll}>
          {tombStyles.map(tomb => (
            <TouchableOpacity
              key={tomb.id}
              style={[
                styles.tombItem,
                selectedTomb === tomb.id && styles.selectedTomb
              ]}
              onPress={() => setSelectedTomb(tomb.id)}
              activeOpacity={0.7}
            >
              <Image 
                source={tomb.image} 
                style={styles.tombImage}
                contentFit="cover"
                transition={300}
                priority="high"
                cachePolicy="memory-disk"
                placeholder={{ blurhash: 'LGFFaXYk^6#M@-5c,1J5@[or[Q6.' }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedTomb || !selectedType || !goodbyeTheme.trim()) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedTomb || !selectedType || !goodbyeTheme.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>继续</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    marginTop: 24,
    marginBottom: 16,
    color: '#e1d8f7',
    textShadowColor: 'rgba(255, 255, 255, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'xiaowan',
  },
  typeScroll: {
    maxHeight: 200,
  },
  typeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedType: {
    backgroundColor: 'rgba(255, 182, 185, 0.7)',
  },
  typeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  typeIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  typeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  tombScroll: {
    maxHeight: 180,
  },
  tombItem: {
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  selectedTomb: {
    opacity: 0.7,
  },
  tombImage: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  continueButton: {
    backgroundColor: 'rgba(255, 182, 185, 0.7)',
    padding: 16,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#66666e',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'AaHouDiHei',
  },
  themeInputContainer: {
    marginBottom: 20,
  },
  themeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}); 