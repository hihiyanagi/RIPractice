import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';

type IconNames = 'home' | 'heart' | 'leaf';

// 定义路由及其图标
const tabRoutes = {
  index: {
    title: '首页',
    icon: 'home' as IconNames,
  },
  practice: {
    title: '练习',
    icon: 'leaf' as IconNames,
  },
  cemetery: {
    title: '内心墓园',
    icon: 'heart' as IconNames, 
  }
};

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: '#f7e6e6',
        borderTopWidth: 0,
        elevation: 0,
        height: 50,
        paddingBottom: 5
      },
      tabBarActiveTintColor: '#ffb6b9',
      tabBarInactiveTintColor: '#888',
      tabBarLabelStyle: {
        fontSize: 12
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: tabRoutes.index.title,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome 
              name={tabRoutes.index.icon}
              size={size-2} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: tabRoutes.practice.title,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome 
              name={tabRoutes.practice.icon}
              size={size-2} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cemetery"
        options={{
          title: tabRoutes.cemetery.title,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome 
              name={tabRoutes.cemetery.icon}
              size={size-2} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
