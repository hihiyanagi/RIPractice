import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Platform, Animated, Easing, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

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
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 组合动画
    Animated.parallel([
      // 向上移动
      Animated.timing(moveAnim, {
        toValue: { x: Math.random() * 60 - 30, y: -100 },
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 渐变消失
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      // 放大
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // 旋转
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationEnd();
    });
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${Math.random() * 180 - 90}deg`],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateX: moveAnim.x },
            { translateY: moveAnim.y },
            { scale: scaleAnim },
            { rotate: rotate },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <AntDesign name="heart" size={24} color="#ffb6b9" />
    </Animated.View>
  );
};

export default function CemeteryScreen() {
  const router = useRouter();
  const [selectedFarewell, setSelectedFarewell] = useState<Farewell | null>(null);
  const [flowers, setFlowers] = useState<{ [key: string]: number }>({
    '1': 0,
    '2': 0,
    '3': 0,
  });
  const [animations, setAnimations] = useState<Array<{ id: string }>>([]);
  
  // 示例数据
  const farewells: Farewell[] = [
    {
      id: '1',
      name: '曾经的友谊',
      date: '2023-11-10',
      image: require('../../assets/images/ripractice/style1.png'),
      goodbyeText: '谢谢你曾经的陪伴，我会带着祝福继续前行。',
    },
    {
      id: '2',
      name: '逝去的青春',
      date: '2023-12-05',
      image: require('../../assets/images/ripractice/style2.png'),
      goodbyeText: '青春已逝，但记忆长存，感谢那段美好时光。',
    },
    {
      id: '3',
      name: '过去的工作',
      date: '2024-01-20',
      image: require('../../assets/images/ripractice/style3.png'),
      goodbyeText: '感谢这段经历带给我的成长，是时候说再见了。',
    },
  ];

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
            <AntDesign name="heart" size={14} color="#ffb6b9" />
            <Text style={styles.flowerCount}> {flowers[item.id]}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // 处理新的告别 - 使用多种方法确保路由正常工作
  const handleNewFarewell = () => {
    try {
      // 尝试直接跳转（最简单的方式）
      router.push('/select');
    } catch (error) {
      try {
        // 如果直接跳转失败，尝试带参数的方式
        router.push({
          pathname: '/select'
        });
      } catch (secondError) {
        try {
          // 如果还是失败，尝试替代导航方法
          router.navigate('/select');
        } catch (thirdError) {
          // 所有方法都失败时，显示错误提示
          Alert.alert(
            '导航失败',
            '无法跳转到选择页面，请尝试重启应用或更新版本。',
            [{ text: '确定', style: 'default' }]
          );
          // 输出错误到控制台以便调试
          console.error('路由跳转失败:', thirdError);
        }
      }
    }
  };

  // 处理献花
  const handleFlower = () => {
    if (selectedFarewell) {
      // 更新花朵计数
      setFlowers(prev => ({
        ...prev,
        [selectedFarewell.id]: (prev[selectedFarewell.id] || 0) + 1,
      }));

      // 添加多朵花的动画，每朵花都有随机位置
      const newAnimations: Array<{ id: string }> = [];
      for (let i = 0; i < 5; i++) {
        newAnimations.push({ id: `${selectedFarewell.id}_${Date.now()}_${i}` });
      }
      setAnimations(prev => [...prev, ...newAnimations]);
    }
  };

  // 移除完成的动画
  const removeAnimation = (id: string) => {
    setAnimations(prev => prev.filter(animation => animation.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>内心墓园</Text>
      
      {selectedFarewell ? (
        <View style={styles.detailView}>
          <View style={styles.detailImageContainer}>
            <Image source={selectedFarewell.image} style={styles.detailImage} />
            
            {/* 花朵动画 */}
            {animations
              .filter(animation => animation.id.startsWith(selectedFarewell.id))
              .map(animation => (
                <FlowerAnimation
                  key={animation.id}
                  style={styles.flowerAnimation}
                  onAnimationEnd={() => removeAnimation(animation.id)}
                />
              ))}
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
              <AntDesign name="heart" size={18} color="#333" style={styles.flowerIcon} />
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
          <FlatList
            data={farewells}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />
          
          {/* 使用两种方式实现导航 - 按钮和Link组件 */}
          <View style={styles.addButtonContainer}>
            {/* 使用Link组件实现导航，这是Expo Router最可靠的导航方式 */}
            <Link href="/select" asChild style={styles.linkFullWidth}>
              <TouchableOpacity 
                style={styles.addButton}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>开始新的告别</Text>
              </TouchableOpacity>
            </Link>
            
            {/* 保留原按钮作为备用方案 */}
            {/* 
            <TouchableOpacity 
              style={styles.addButton}
              activeOpacity={0.7}
              onPress={handleNewFarewell}
            >
              <Text style={styles.buttonText}>开始新的告别</Text>
            </TouchableOpacity>
            */}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7e6e6',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  list: {
    flex: 1,
  },
  farewellItem: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'white',
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
    margin: 16,
    width: '100%',
    alignItems: 'center',
  },
  linkFullWidth: {
    width: '100%',
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
  },
  detailImage: {
    width: 160,
    height: 200,
    borderRadius: 12,
  },
  flowerAnimation: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
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
  flowerIcon: {
    marginRight: 8,
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
}); 