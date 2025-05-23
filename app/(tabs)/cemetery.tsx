import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Platform, Animated, Easing, Alert, ImageBackground } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Farewell {
  id: string;
  name: string;
  date: string;
  image: any;
  goodbyeText: string;
  flowers?: number;
}

// 定义花朵动画组件的属性类型
interface FlowerAnimationProps {
  style: any;
  onAnimationEnd: () => void;
}

// 创建一个花朵动画组件
const FlowerAnimation = ({ style, onAnimationEnd }: FlowerAnimationProps) => {
  const moveAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current; // 从正常大小开始，确保可见
  const rotateAnim = useRef(new Animated.Value(0)).current; // 新增旋转动画

  useEffect(() => {
    console.log('🌸 开始小花动画!'); 
    
    // 从"献上小花"按钮飞向墓碑中央的轨迹，位置再上移80%
    const randomX = (Math.random() - 0.5) * 60 + 150; // 向墓碑中央飞，带一些随机性
    const randomY = -540 - Math.random() * 80; // 再上移80%：从-300~-345px 改为 -540~-620px
    
    console.log('🌸 动画参数:', { randomX, randomY });
    
    // 增强动画：移动、缩放、旋转
    Animated.parallel([
      // 移动动画
      Animated.timing(moveAnim, {
        toValue: { x: randomX, y: randomY },
        duration: 3000, // 保持3秒
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 缩放动画
      Animated.timing(scaleAnim, {
        toValue: 2.0, // 放大到2倍
        duration: 2000,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      // 旋转动画 - 新增
      Animated.timing(rotateAnim, {
        toValue: 360, // 旋转360度
        duration: 3000, // 与移动动画同步
        easing: Easing.linear, // 匀速旋转
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('🌸 小花动画完成!');
      // 延迟一点再移除，确保用户能看到
      setTimeout(() => {
        onAnimationEnd();
      }, 500);
    });
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateX: moveAnim.x },
            { translateY: moveAnim.y },
            { scale: scaleAnim },
            { rotate: rotateAnim.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              })
            },
          ],
          opacity: 1, // 始终完全不透明
        },
      ]}
    >
      <Image 
        source={require('../../assets/images/ripractice/flower_optimized.png')} 
        style={styles.flowerImage}
      />
    </Animated.View>
  );
};

export default function CemeteryScreen() {
  const router = useRouter();
  const [selectedFarewell, setSelectedFarewell] = useState<Farewell | null>(null);
  const [flowers, setFlowers] = useState<{ [key: string]: number }>({});
  const [animations, setAnimations] = useState<Array<{ id: string }>>([]);
  const [farewells, setFarewells] = useState<Farewell[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 墓碑图片映射
  const tombImages = {
    style1: require('../../assets/images/ripractice/style1_optimized.jpg'),
    style2: require('../../assets/images/ripractice/style2_optimized.jpg'),
    style3: require('../../assets/images/ripractice/style3_optimized.jpg'),
    style4: require('../../assets/images/ripractice/style4_optimized.jpg'),
    style5: require('../../assets/images/ripractice/style5_optimized.jpg'),
  };

  // 加载保存的告别数据
  const loadFarewells = async () => {
    try {
      setLoading(true);
      const existingData = await AsyncStorage.getItem('farewells');
      if (existingData) {
        const savedFarewells = JSON.parse(existingData);
        // 转换数据格式，将image字符串转换为require的图片
        const transformedFarewells = savedFarewells.map((farewell: any) => ({
          ...farewell,
          image: tombImages[farewell.image as keyof typeof tombImages] || tombImages.style1
        }));
        setFarewells(transformedFarewells);
        
        // 为现有的告别数据初始化flowers状态
        const initialFlowers: { [key: string]: number } = {};
        savedFarewells.forEach((farewell: any) => {
          initialFlowers[farewell.id] = 0;
        });
        setFlowers(initialFlowers);
      } else {
        // 如果没有保存的数据，设置为空数组
        setFarewells([]);
      }
    } catch (error) {
      console.error('加载告别数据失败:', error);
      setFarewells([]);
    } finally {
      setLoading(false);
    }
  };

  // 当页面获得焦点时重新加载数据
  useFocusEffect(
    React.useCallback(() => {
      loadFarewells().catch(error => {
        console.error('数据加载失败，但不阻塞UI:', error);
        setFarewells([]);
        setLoading(false);
      });
    }, [])
  );

  const renderItem = ({ item }: { item: Farewell }) => (
    <TouchableOpacity 
      style={styles.farewellItem} 
      onPress={() => setSelectedFarewell(item)}
    >
      <Image source={item.image} style={styles.thumbnailImage} />
      <View style={styles.farewellInfo}>
        <Text style={styles.farewellName}>{item.name}</Text>
        <Text style={styles.farewellDate}>{item.date}</Text>
        {flowers[item.id] > 0 && (
          <View style={styles.flowerCountContainer}>
            <Image 
              source={require('../../assets/images/ripractice/flower_optimized.png')} 
              style={styles.smallFlowerIcon}
            />
            <Text style={styles.flowerCount}> {flowers[item.id]}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // 处理献花
  const handleFlower = () => {
    console.log('🎯 献花按钮被点击！');
    if (selectedFarewell) {
      console.log('🎯 selectedFarewell存在:', selectedFarewell.name);
      
      // 更新花朵计数
      setFlowers(prev => ({
        ...prev,
        [selectedFarewell.id]: (prev[selectedFarewell.id] || 0) + 1,
      }));

      // 改为1朵花，创造更精致的效果
      const newAnimations: Array<{ id: string }> = [];
      for (let i = 0; i < 1; i++) {
        const animationId = `${selectedFarewell.id}_${Date.now()}_${i}`;
        newAnimations.push({ id: animationId });
        console.log('🎯 创建动画ID:', animationId);
      }
      
      setAnimations(prev => {
        const updated = [...prev, ...newAnimations];
        console.log('🎯 更新后animations数组长度:', updated.length);
        return updated;
      });
    } else {
      console.log('🎯 selectedFarewell不存在！');
    }
  };

  // 移除完成的动画
  const removeAnimation = (id: string) => {
    setAnimations(prev => prev.filter(animation => animation.id !== id));
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/ripractice/cemetery_background2_optimized.jpg')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <Text style={styles.pageTitle}>内心墓园</Text>
      
      {/* 花朵动画 - 移到最高层级，可以飞到整个屏幕 */}
      {selectedFarewell && (() => {
        const filteredAnimations = animations.filter(animation => animation.id.startsWith(selectedFarewell.id));
        console.log('🎨 总动画数量:', animations.length, '过滤后动画数量:', filteredAnimations.length);
        
        return filteredAnimations.map(animation => {
          console.log('🎨 渲染动画:', animation.id);
          return (
            <FlowerAnimation
              key={animation.id}
              style={styles.flowerAnimation}
              onAnimationEnd={() => {
                console.log('🎨 动画结束，移除:', animation.id);
                removeAnimation(animation.id);
              }}
            />
          );
        });
      })()}
      
      {selectedFarewell ? (
        <View style={styles.detailView}>
          <View style={styles.detailImageContainer}>
            <Image source={selectedFarewell.image} style={styles.detailImage} />
          </View>
          
          <Text style={styles.detailName}>{selectedFarewell.name}</Text>
          <Text style={styles.detailDate}>{selectedFarewell.date}</Text>
          
          <View style={styles.goodbyeBox}>
            <Text style={styles.goodbyeTitle}>告别词</Text>
            <Text style={styles.goodbyeText}>{selectedFarewell.goodbyeText}</Text>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.offerFlowerButton}
              onPress={handleFlower}
              activeOpacity={0.7}
            >
              <Image 
                source={require('../../assets/images/ripractice/flower_optimized.png')} 
                style={styles.buttonFlowerIcon}
              />
              <Text style={styles.buttonText}>献上小花</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedFarewell(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>返回列表</Text>
            </TouchableOpacity>
          </View>
          
          {flowers[selectedFarewell.id] > 0 && (
            <View style={styles.flowerCountBadge}>
              <Text style={styles.flowerCountText}>
                已献上 {flowers[selectedFarewell.id]} 朵小花
              </Text>
            </View>
          )}
        </View>
      ) : (
        <>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>正在加载告别记录...</Text>
            </View>
          ) : farewells.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AntDesign name="heart" size={48} color="#ccc" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>还没有告别记录</Text>
              <Text style={styles.emptySubtitle}>开始你的第一次告别练习吧</Text>
            </View>
          ) : (
            <FlatList
              data={farewells}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.list}
            />
          )}
          
          <View style={styles.addButtonContainer}>
            <TouchableOpacity 
              style={styles.addButton}
              activeOpacity={0.7}
              onPress={() => {
                console.log('按钮被点击');
                console.log('当前路由状态:', router);
                
                // 重置任何可能的状态问题
                setSelectedFarewell(null);
                
                try {
                  router.push('/select');
                  console.log('router.push 成功');
                } catch (error) {
                  console.log('router.push 失败，尝试 router.replace');
                  try {
                    router.replace('/select');
                    console.log('router.replace 成功');
                  } catch (error2) {
                    console.log('router.replace 失败，尝试 router.navigate');
                    try {
                      (router as any).navigate('/select');
                      console.log('router.navigate 成功');
                    } catch (error3) {
                      console.error('所有导航方法都失败了:', error3);
                      Alert.alert('导航错误', '无法跳转到选择页面，请重启应用');
                    }
                  }
                }
              }}
            >
              <Text style={styles.buttonText}>
                {farewells.length === 0 ? '开始第一次告别' : '开始新的告别'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  farewellItem: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  farewellInfo: {
    marginLeft: 16,
    flex: 1,
  },
  farewellName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  farewellDate: {
    fontSize: 14,
    color: '#666',
  },
  addButtonContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#ffb6b9',
    padding: 16,
    borderRadius: 32,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailView: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  detailImageContainer: {
    position: 'relative',
    marginBottom: 16,
    overflow: 'visible', // 确保动画不被裁剪
  },
  detailImage: {
    width: 160,
    height: 200,
    borderRadius: 12,
  },
  flowerAnimation: {
    position: 'absolute',
    bottom: 80, // 从按钮区域开始（大约按钮的位置）
    left: '25%', // 从"献上小花"按钮的位置开始
    marginLeft: -20, // 调整到中央
    zIndex: 9999, // 最高层级，确保显示在所有元素之上
  },
  detailName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  goodbyeBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  goodbyeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  goodbyeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6a5acd',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    backgroundColor: '#b6eaff',
    padding: 16,
    borderRadius: 32,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  offerFlowerButton: {
    backgroundColor: '#ffb6b9',
    padding: 16,
    borderRadius: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  buttonFlowerIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 4,
  },
  flowerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  flowerCount: {
    fontSize: 14,
    color: '#888',
  },
  flowerCountBadge: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 182, 185, 0.2)',
    borderRadius: 16,
  },
  flowerCountText: {
    color: '#666',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backgroundImage: {
    opacity: 1.0,
    resizeMode: 'cover',
  },
  flowerImage: {
    width: 40, // 减小到40%大小
    height: 40,
    resizeMode: 'contain',
    // 移除阴影效果以提高性能和避免渲染问题
    backgroundColor: 'transparent',
  },
  smallFlowerIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
}); 