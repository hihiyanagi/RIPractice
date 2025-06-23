import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Platform, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

// 获取屏幕尺寸
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

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
                这是一座可随时进入的小小心灵墓园
              </Text>
              <Text style={styles.description}>
                来悄悄告别那些重要但该放下的事物
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
    opacity: 1.0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
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
    fontSize: 16,
    color: '#f5f5f5',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'CangErXiaoWanZi',
    textShadowColor: '#A78BFA',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  buttonContainer: {
    flex: 0.37,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 65,
  },
  button: {
    backgroundColor: '#ffc8dd',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: '#66666e',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'AaHouDiHei',
  },
});
