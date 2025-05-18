import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Platform, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

// 获取屏幕尺寸
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  
  // 调试状态
  const [debugInfo, setDebugInfo] = useState('');
  
  useEffect(() => {
    // 记录调试信息
    setDebugInfo(`平台: ${Platform.OS}, 屏幕: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}`);
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground
        source={require('../../assets/images/ripractice/page1.png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.topSpacer} />
          <View style={styles.textContainer}>
            <View style={styles.additionalSpacer} />
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                这是一座随时可以进入的小小心灵墓园，
              </Text>
              <Text style={styles.description}>
                用来悄悄告别那些重要却该放下的事物。
              </Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                router.push('/select');
              }}
            >
              <Text style={styles.buttonText}>开始我的告别练习</Text>
            </TouchableOpacity>
          </View>
          
          {/* 调试信息 */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                {debugInfo}
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  backgroundImage: {
    opacity: 0.95,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
  },
  topSpacer: {
    flex: 0.48,
  },
  textContainer: {
    flex: 0.15,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 85,
  },
  additionalSpacer: {
    height: 30,
  },
  descriptionContainer: {
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#f5f5f5',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flex: 0.37,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 65,
  },
  button: {
    backgroundColor: '#ffb6b9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
  }
});
