// components/ui/SignInScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Add sign in logic here
    console.log('Sign in:', { email, password });
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Sign in with ${provider}`);
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#533483']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to Melodify</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name='mail-outline' size={20} color='#B8B8D1' style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder='your@email.com'
                placeholderTextColor='#6B7280'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name='lock-closed-outline' size={20} color='#B8B8D1' style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder='••••••••'
                placeholderTextColor='#6B7280'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color='#B8B8D1' />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialSection}>
          <Text style={styles.orText}>Or continue with</Text>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
              <Ionicons name='logo-apple' size={18} color='#fff' />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.signUpLink}>
          <Text style={styles.signUpText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8B8D1',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#B8B8D1',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  socialSection: {
    alignItems: 'center',
  },
  orText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  signUpLink: {
    alignItems: 'center',
  },
  signUpText: {
    color: '#8B5CF6',
    fontSize: 14,
  },
});
