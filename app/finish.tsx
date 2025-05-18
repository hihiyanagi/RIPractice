import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function FinishScreen() {
  const tombImg = require('../assets/images/ripractice/style1.png');
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // 这里可以从params或全局状态获取用户选择的告别主题
  const farewellSubject = params.type || '过去的自己';
  const goodbyeText = '谢谢你曾经的陪伴，我会带着祝福继续前行。';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={tombImg} 
        style={styles.background}
        resizeMode="cover"
      >
        {/* 固定在屏幕3/4位置的文字 */}
        <View style={styles.textPositioner}>
          <View style={styles.engravedTextContainer}>
            <Text style={styles.engravedTitle}>
              再见，我的{farewellSubject}
            </Text>
            <Text style={styles.engravedText}>
              {goodbyeText}
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
          onPress={() => {
            router.push('/(tabs)/cemetery' as any);
          }}
        >
          <Text style={styles.btnText}>前往内心墓园</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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