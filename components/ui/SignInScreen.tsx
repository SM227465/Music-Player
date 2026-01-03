// components/ui/SignInScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';

interface SignInScreenProps {
  onSkip?: () => void;
}

export default function SignInScreen({ onSkip }: SignInScreenProps = {}) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    console.log('Sign in:', { email, password });
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Sign in with ${provider}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: spacing.xxxl,
      paddingTop: 60,
      backgroundColor: theme.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: fontSize.xxxxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    subtitle: {
      fontSize: fontSize.base,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.xxxxl,
    },
    form: {
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.xl,
      padding: spacing.xxxl,
      marginBottom: spacing.xxxl,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 3,
    },
    inputContainer: {
      marginBottom: spacing.xl,
    },
    label: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      marginBottom: spacing.sm,
      fontWeight: fontWeight.medium,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background.secondary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    inputIcon: {
      marginRight: spacing.md,
    },
    input: {
      flex: 1,
      color: theme.text.primary,
      fontSize: fontSize.base,
    },
    signInButton: {
      backgroundColor: theme.accent.primary,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      marginTop: spacing.md,
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    signInButtonText: {
      color: theme.text.inverse,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
    },
    socialSection: {
      alignItems: 'center',
    },
    orText: {
      color: theme.text.tertiary,
      fontSize: fontSize.sm,
      marginBottom: spacing.xl,
    },
    socialButtons: {
      flexDirection: 'row',
      gap: spacing.lg,
      marginBottom: spacing.xxxl,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xxl,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: theme.border.primary,
      gap: spacing.sm,
    },
    socialButtonText: {
      color: theme.text.primary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    signUpLink: {
      alignItems: 'center',
    },
    signUpText: {
      color: theme.accent.primary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    skipButton: {
      position: 'absolute',
      top: 50,
      right: spacing.xxxl,
      zIndex: 10,
    },
    skipButtonText: {
      color: theme.accent.primary,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
    },
  });

  return (
    <View style={styles.container}>
      {onSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to Melodify</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name='mail-outline' size={iconSize.sm} color={theme.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder='your@email.com'
                placeholderTextColor={theme.text.tertiary}
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
              <Ionicons name='lock-closed-outline' size={iconSize.sm} color={theme.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder='••••••••'
                placeholderTextColor={theme.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={iconSize.sm} color={theme.text.secondary} />
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
              <Ionicons name='logo-apple' size={iconSize.lg} color={theme.text.primary} />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.signUpLink}>
          <Text style={styles.signUpText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
