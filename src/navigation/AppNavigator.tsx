import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useConnectivityContext } from '../contexts/ConnectivityContext';
import { RootStackParamList } from '../types';
import { processSyncQueue } from '../services/syncManager';
import { getDatabase } from '../database/database';
import { runMigrations } from '../database/migrations';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileStack from './ProfileStack';
import AIStack from './AIStack';
import AlertHistoryScreen from '../screens/AlertHistoryScreen';
import SmartReminderScreen from '../screens/SmartReminderScreen';
import MarketIntelligenceScreen from '../screens/MarketIntelligenceScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import Loading from '../components/Loading';
import { spacing } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function ConnectivityBanner() {
  const { status, pendingSyncCount } = useConnectivityContext();
  if (status === 'online') return null;
  const isSyncing = status === 'syncing';
  return (
    <View style={[styles.banner, { backgroundColor: isSyncing ? '#FEF3C7' : '#FEE2E2' }]}>
      <Text style={[styles.bannerText, { color: isSyncing ? '#92400E' : '#991B1B' }]}>
        {isSyncing
          ? `Syncing... ${pendingSyncCount > 0 ? `(${pendingSyncCount} items)` : ''}`
          : 'You are offline'}
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    getDatabase().then(() => {
      setDbReady(true);
      processSyncQueue();
    }).catch(() => setDbReady(true));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('boer_onboarding_done').then(val => {
      setOnboardingDone(val === 'true');
    });
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    await AsyncStorage.setItem('boer_onboarding_done', 'true');
    setOnboardingDone(true);
  }, []);

  if (isLoading || onboardingDone === null || !dbReady) {
    return <Loading fullScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          onboardingDone ? (
            <Stack.Screen name="Main">
              {() => (
                <View style={{ flex: 1 }}>
                  <MainTabs />
                  <ConnectivityBanner />
                </View>
              )}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Onboarding">
              {({ navigation }) => <OnboardingScreen navigation={navigation} onComplete={handleOnboardingComplete} />}
            </Stack.Screen>
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
        {isAuthenticated && <Stack.Screen name="Profile" component={ProfileStack} />}
        {isAuthenticated && <Stack.Screen name="AIHub" component={AIStack} />}
        {isAuthenticated && <Stack.Screen name="AlertHistory" component={AlertHistoryScreen} />}
        {isAuthenticated && <Stack.Screen name="SmartReminder" component={SmartReminderScreen} />}
        {isAuthenticated && <Stack.Screen name="MarketIntelligence" component={MarketIntelligenceScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    zIndex: 999,
  },
  bannerText: { fontSize: 12, fontWeight: '600' },
});
