import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform, Animated, Easing, Alert, ImageBackground } from 'react-native';
import { Image } from 'expo-image';
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
        contentFit="contain"
        cachePolicy="memory-disk"
        priority="normal"
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

  // 删除告别记录
  const deleteFarewell = async (farewellId: string) => {
    try {
      // 显示确认对话框
      Alert.alert(
        '确认删除',
        '确定要删除这条告别记录吗？此操作无法撤销。',
        [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '删除',
            style: 'destructive',
            onPress: async () => {
              // 从状态中移除
              const updatedFarewells = farewells.filter(farewell => farewell.id !== farewellId);
              setFarewells(updatedFarewells);
              
              // 从AsyncStorage中移除
              const farewellsForStorage = updatedFarewells.map(farewell => ({
                ...farewell,
                image: Object.keys(tombImages).find(key => 
                  tombImages[key as keyof typeof tombImages] === farewell.image
                ) || 'style1'
              }));
              
              await AsyncStorage.setItem('farewells', JSON.stringify(farewellsForStorage));
              
              // 如果删除的是当前选中的记录，返回列表
              if (selectedFarewell && selectedFarewell.id === farewellId) {
                setSelectedFarewell(null);
              }
              
              // 清理花朵计数
              setFlowers(prev => {
                const updated = { ...prev };
                delete updated[farewellId];
                return updated;
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('删除告别记录失败:', error);
      Alert.alert('删除失败', '无法删除记录，请稍后重试');
    }
  };

  const renderItem = ({ item }: { item: Farewell }) => (
    <View style={styles.farewellItemContainer}>
      <TouchableOpacity 
        style={styles.farewellItem} 
        onPress={() => setSelectedFarewell(item)}
      >
        <Image 
          source={item.image} 
          style={styles.thumbnailImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          transition={150}
        />
        <View style={styles.farewellInfo}>
          <Text style={styles.farewellName}>{item.name}</Text>
          <Text style={styles.farewellDate}>{item.date}</Text>
          {flowers[item.id] > 0 && (
            <View style={styles.flowerCountContainer}>
              <Image 
                source={require('../../assets/images/ripractice/flower_optimized.png')} 
                style={styles.smallFlowerIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
              <Text style={styles.flowerCount}> {flowers[item.id]}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* 删除按钮 */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteFarewell(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
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
    <View style={styles.container}>
      {/* 使用更简单的背景图实现 */}
      <Image 
        source={require('../../assets/images/ripractice/cemetery_background2_medium.jpg')}
        style={styles.backgroundImageFixed}
        contentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
      />
      
      {/* 内容层 */}
      <View style={styles.contentLayer}>
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
              <Image 
                source={selectedFarewell.image} 
                style={styles.detailImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                priority="high"
                transition={200}
              />
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
                  contentFit="contain"
                  cachePolicy="memory-disk"
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
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                initialNumToRender={5}
                windowSize={10}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImageFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 1.0,
  },
  contentLayer: {
    flex: 1,
    padding: 16,
    position: 'relative',
    zIndex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#ffee9d',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 20,
    fontFamily: 'xiaowan',
  },
  list: {
    flex: 1,
  },
  farewellItemContainer: {
    position: 'relative',
    marginVertical: 8,
  },
  farewellItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(200, 200, 200, 0.8)', // 改为浅灰色
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 0.5,
    elevation: 1,
    zIndex: 1,
  },
  deleteButtonText: {
    fontSize: 10,
    lineHeight: 10,
    color: '#333', // 相应调整文字颜色为深色，确保在浅色背景上可读
    fontWeight: 'bold',
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
    backgroundColor: '#ffc8dd',
    padding: 16,
    borderRadius: 32,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#66666e',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'AaHouDiHei',
  },
  detailView: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  detailImageContainer: {
    position: 'relative',
    marginBottom: 16,
    overflow: 'visible',
  },
  detailImage: {
    width: 160,
    height: 200,
    borderRadius: 12,
  },
  flowerAnimation: {
    position: 'absolute',
    bottom: 80,
    left: '25%',
    marginLeft: -20,
    zIndex: 9999,
  },
  detailName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'xiaowan',
    color: '#444',
  },
  detailDate: {
    fontSize: 16,
    color: '#444',
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
    fontSize: 16,
    fontWeight: 'normal',
    marginBottom: 8,
    color: '#444',
  },
  goodbyeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6a5acd',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    backgroundColor: '#ffc8dd',
    padding: 16,
    borderRadius: 32,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  offerFlowerButton: {
    backgroundColor: '#ffc8dd',
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
  flowerImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  smallFlowerIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
}); 