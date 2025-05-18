import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function PracticeScreen() {
  const router = useRouter();

  const handleStartPractice = () => {
    router.push('/select');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>练习告别</Text>
      
      <View style={styles.contentContainer}>
        <Text style={styles.description}>
          每一次告别，都是成长的机会。
          通过练习告别，我们学会接受失去，
          享受当下，期待未来。
        </Text>

        <View style={styles.infoCard}>
          <FontAwesome name="info-circle" size={24} color="#ffb6b9" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            告别练习会引导你通过思考与写作，为需要告别的事物举行一场仪式性的告别。
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartPractice}
        >
          <Text style={styles.buttonText}>开始告别练习</Text>
        </TouchableOpacity>
      </View>
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  infoIcon: {
    marginRight: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#ffb6b9',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    marginTop: 20,
  },
  buttonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 