import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Platform, TextInput } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';

interface TombStyle {
  id: string;
  name: string;
  image: any;
}

interface GoodbyeType {
  id: string;
  name: string;
  description: string;
}

export default function SelectScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedTomb, setSelectedTomb] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [goodbyeTheme, setGoodbyeTheme] = useState<string>('');

  // 确保在移动端正确显示页面
  useEffect(() => {
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

  const tombStyles: TombStyle[] = [
    { id: 'style1', name: '简约', image: require('../assets/images/ripractice/style1.png') },
    { id: 'style2', name: '传统', image: require('../assets/images/ripractice/style2.png') },
    { id: 'style3', name: '现代', image: require('../assets/images/ripractice/style3.png') },
    { id: 'style4', name: '艺术', image: require('../assets/images/ripractice/style4.png') },
  ];

  const goodbyeTypes: GoodbyeType[] = [
    { 
      id: 'relationship', 
      name: '关系', 
      description: '一段友谊、爱情或亲情关系的结束' 
    },
    { 
      id: 'experience', 
      name: '经历', 
      description: '工作、学习或生活阶段的结束' 
    },
    { 
      id: 'emotion', 
      name: '情绪', 
      description: '消极情绪，如悲伤、愤怒、恐惧等' 
    }
  ];

  const handleContinue = () => {
    if (selectedTomb && selectedType && goodbyeTheme.trim()) {
      // 处理移动端和网页端的不同导航方式
      if (Platform.OS === 'web') {
        router.push('/ai' as any);
      } else {
        try {
          router.navigate('/ai' as any);
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
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>选择告别类型</Text>
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
            <Text style={styles.typeName}>{type.name}</Text>
            <Text style={styles.typeDescription}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>选择告别主题</Text>
      <View style={styles.themeInputContainer}>
        <TextInput
          style={styles.themeInput}
          placeholder="请输入告别主题..."
          value={goodbyeTheme}
          onChangeText={setGoodbyeTheme}
          maxLength={50}
        />
      </View>

      <Text style={styles.sectionTitle}>选择墓碑风格</Text>
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
            <Image source={tomb.image} style={styles.tombImage} />
            <Text style={styles.tombName}>{tomb.name}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7e6e6',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  typeScroll: {
    maxHeight: 120,
  },
  typeItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 220,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedType: {
    backgroundColor: '#ffb6b9',
  },
  typeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
  },
  tombScroll: {
    maxHeight: 180,
  },
  tombItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTomb: {
    backgroundColor: '#ffb6b9',
  },
  tombImage: {
    width: 100,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  tombName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#ffb6b9',
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
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeInputContainer: {
    marginBottom: 20,
  },
  themeInput: {
    backgroundColor: 'white',
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