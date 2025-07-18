// app/(tabs)/_layout.tsx
import SignInScreen from '@/components/ui/SignInScreen';
import WelcomeScreen from '@/components/ui/WelcomeScreen';
import React, { useState } from 'react';
import { View } from 'react-native';
import SplashScreen from './index';

export default function TabLayout() {
  const [currentScreen, setCurrentScreen] = useState('splash');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen onNext={() => setCurrentScreen('signin')} />;
      case 'signin':
        return <SignInScreen />;
      default:
        return <SplashScreen />;
    }
  };

  // Auto-navigate from splash to welcome after 3 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScreen === 'splash') {
        setCurrentScreen('welcome');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}
