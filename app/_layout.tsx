import React from 'react';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'CangErXiaoWanZi': require('../assets/fonts/CangErXiaoWanZi-2.ttf'),
    'AaHouDiHei': require('../assets/fonts/AaHouDiHei.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="select" 
            options={{ 
              presentation: 'card',
              headerShown: true,
              title: '选择告别方式',
              headerTintColor: '#333',
              headerStyle: { backgroundColor: '#f7e6e6' },
            }} 
          />
          <Stack.Screen 
            name="ai" 
            options={{ 
              presentation: 'card',
              headerShown: true,
              title: 'AI对话',
              headerTintColor: '#333',
              headerStyle: { backgroundColor: '#f7e6e6' },
            }} 
          />
          <Stack.Screen 
            name="finish" 
            options={{ 
              presentation: 'modal',
              headerShown: false, 
            }} 
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
