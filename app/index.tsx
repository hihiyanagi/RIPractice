import { Redirect } from 'expo-router';

export default function Index() {
  // 将根路径重定向到主页Tab
  return <Redirect href="/(tabs)" />;
} 