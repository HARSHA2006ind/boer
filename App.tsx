import 'react-native-reanimated';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { requestPermissions, registerForPushNotifications, cancelAllScheduled, scheduleIrrigationReminder, Notifications } from './src/services/notificationService';
import { Platform } from 'react-native';

function NotificationInit() {
  useEffect(() => {
    (async () => {
      await requestPermissions();
      await registerForPushNotifications();
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('weather', {
          name: 'Weather Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        });
        Notifications.setNotificationChannelAsync('reminders', {
          name: 'Smart Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      await cancelAllScheduled();
    })();
  }, []);
  return null;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <NotificationInit />
              <AppNavigator />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </SafeAreaProvider>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
