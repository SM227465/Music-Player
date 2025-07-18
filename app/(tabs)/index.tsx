import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#533483']} style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <Text style={styles.appName}>Melodify</Text>
        <Text style={styles.tagline}>Your Music, Your Vibe</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#B8B8D1',
    opacity: 0.8,
  },
});
