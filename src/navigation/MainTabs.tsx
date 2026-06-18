import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import HomeDashboard from '../screens/HomeDashboard';
import FarmStack from './FarmStack';
import FinanceStack from './FinanceStack';
import AIStack from './AIStack';
import EcosystemStack from './EcosystemStack';
import { colors, radius, spacing, shadows } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Farms: { active: 'leaf', inactive: 'leaf-outline' },
  Finance: { active: 'wallet', inactive: 'wallet-outline' },
  AI: { active: 'sparkles', inactive: 'sparkles-outline' },
  Ecosystem: { active: 'planet', inactive: 'planet-outline' },
};

const TAB_KEYS: Record<string, string> = {
  Home: 'nav.home',
  Farms: 'nav.farms',
  Finance: 'nav.finance',
  AI: 'nav.ai',
  Ecosystem: 'nav.ecosystem',
};

function TabButton({ routeName, focused, onPress }: { routeName: string; focused: boolean; onPress: (e: any) => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const { t } = useLanguage();
  const icons = TAB_ICONS[routeName] || { active: 'ellipse', inactive: 'ellipse-outline' };

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0.92, useNativeDriver: true, friction: 8, tension: 80,
    }).start();
  }, [focused]);

  const labelKey = TAB_KEYS[routeName] || routeName;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={tStyles.item}>
      <Animated.View style={[tStyles.iconWrap, focused && tStyles.iconWrapActive, { transform: [{ scale }] }]}>
        <Ionicons name={focused ? icons.active : icons.inactive} size={20} color={focused ? '#FFFFFF' : colors.textSecondary} />
      </Animated.View>
      <Text style={[tStyles.label, focused && tStyles.labelActive]}>{t(labelKey)}</Text>
    </TouchableOpacity>
  );
}

const tStyles = StyleSheet.create({
  item: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 6 },
  iconWrap: { width: 36, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  iconWrapActive: { backgroundColor: colors.primary },
  label: { fontSize: 9, fontWeight: '600', color: colors.textLight, marginTop: 2, textAlign: 'center' },
  labelActive: { color: colors.primary, fontWeight: '800' },
});

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 4 : 8);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            ...tabBarStyles.container,
            bottom: bottomInset + spacing.sm,
          },
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarButton: ({ onPress, accessibilityState }) => (
            <TabButton routeName={route.name} focused={accessibilityState?.selected || false} onPress={onPress || (() => {})} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeDashboard} />
        <Tab.Screen name="Farms" component={FarmStack} />
        <Tab.Screen name="Finance" component={FinanceStack} />
        <Tab.Screen name="AI" component={AIStack} />
        <Tab.Screen name="Ecosystem" component={EcosystemStack} />
      </Tab.Navigator>
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: '#FDFCF8',
    borderRadius: radius.pill,
    height: 60,
    paddingBottom: 0,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.8)',
    ...shadows.md,
    elevation: 6,
  },
});
