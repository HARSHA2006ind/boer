import { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileStack from './ProfileStack';
import OnboardingScreen from '../screens/OnboardingScreen';
import Loading from '../components/Loading';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('boer_onboarding_done').then(val => {
      setOnboardingDone(val === 'true');
    });
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    await AsyncStorage.setItem('boer_onboarding_done', 'true');
    setOnboardingDone(true);
  }, []);

  if (isLoading || onboardingDone === null) {
    return <Loading fullScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          onboardingDone ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <Stack.Screen name="Onboarding">
              {({ navigation }) => <OnboardingScreen navigation={navigation} onComplete={handleOnboardingComplete} />}
            </Stack.Screen>
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
        {isAuthenticated && <Stack.Screen name="Profile" component={ProfileStack} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
