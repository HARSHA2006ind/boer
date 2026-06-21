import { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated as RNAnimated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useConnectivityContext } from '../contexts/ConnectivityContext';
import { RootStackParamList } from '../types';
import { processSyncQueue } from '../services/syncManager';
import { getDatabase } from '../database/database';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileStack from './ProfileStack';
import AIStack from './AIStack';
import AlertHistoryScreen from '../screens/AlertHistoryScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import SmartReminderScreen from '../screens/SmartReminderScreen';
import MarketIntelligenceScreen from '../screens/MarketIntelligenceScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SplashScreen from '../components/SplashScreen';
import { spacing } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function ConnectivityBanner() {
  const { status, pendingSyncCount } = useConnectivityContext();
  if (status === 'online') return null;
  const isSyncing = status === 'syncing';
  return (
    <View style={[styles.banner, { backgroundColor: isSyncing ? '#FEF3C7' : '#FEE2E2' }]}>
      <View style={styles.bannerDot} />
      <View style={{ flex: 1 }}>
        <RNAnimated.Text style={[styles.bannerText, { color: isSyncing ? '#92400E' : '#991B1B' }]}>
          {isSyncing
            ? `Syncing${pendingSyncCount > 0 ? ` (${pendingSyncCount})` : '...'}`
            : 'You are offline'}
        </RNAnimated.Text>
      </View>
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const splashOpacity = useRef(new RNAnimated.Value(1)).current;

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

  const isReady = !isLoading && onboardingDone !== null && dbReady;

  useEffect(() => {
    if (isReady) {
      requestAnimationFrame(() => {
        setContentReady(true);
        RNAnimated.timing(splashOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isReady]);

  return (
    <View style={styles.root}>
      {contentReady && (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 300 }}>
            {isAuthenticated ? (
              onboardingDone ? (
                <Stack.Screen name="Main">
                  {() => (
                    <View style={styles.root}>
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
          {isAuthenticated && <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />}
            {isAuthenticated && <Stack.Screen name="SmartReminder" component={SmartReminderScreen} />}
            {isAuthenticated && <Stack.Screen name="MarketIntelligence" component={MarketIntelligenceScreen} />}
          </Stack.Navigator>
        </NavigationContainer>
      )}
      {!contentReady && (
        <SplashScreen />
      )}
      {contentReady && (
        <RNAnimated.View
          style={[StyleSheet.absoluteFill, { opacity: splashOpacity }]}
          pointerEvents="none"
        >
          <SplashScreen />
        </RNAnimated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F7F2' },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    zIndex: 999,
    gap: 6,
  },
  bannerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C0392B' },
  bannerText: { fontSize: 12, fontWeight: '600' },
});
