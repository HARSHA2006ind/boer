import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import HomeDashboard from '../screens/HomeDashboard';
import FarmStack from './FarmStack';
import FinanceStack from './FinanceStack';
import AIStack from './AIStack';
import ProfileStack from './ProfileStack';
import { colors, radius, spacing, shadows } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Farms: { active: 'leaf', inactive: 'leaf-outline' },
  Finance: { active: 'wallet', inactive: 'wallet-outline' },
  AI: { active: 'sparkles', inactive: 'sparkles-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function TabButton({ icon, label, focused, onPress }: { icon: IconName; label: string; focused: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
  }, [focused]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={tStyles.item}>
      <Animated.View style={[tStyles.iconWrap, focused && tStyles.iconWrapActive, { transform: [{ scale }] }]}>
        <Ionicons name={focused ? icon : icon.replace('-outline', '-outline') as any} size={22} color={focused ? colors.primary : colors.textLight} />
      </Animated.View>
      <Text style={[tStyles.label, focused && tStyles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const tStyles = StyleSheet.create({
  item: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 6 },
  iconWrap: { width: 40, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  iconWrapActive: { backgroundColor: 'rgba(107,142,35,0.12)' },
  label: { fontSize: 10, fontWeight: '500', color: colors.textLight, marginTop: 3, textAlign: 'center' },
  labelActive: { color: colors.primary, fontWeight: '700' },
});

export default function MainTabs() {
  const renderTabIcon = (routeName: string, focused: boolean) => {
    const icons = TAB_ICONS[routeName];
    if (!icons) return null;
    const ico = focused ? icons.active : icons.inactive;
    return <Ionicons name={ico} size={22} color={focused ? colors.primary : colors.textLight} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: tabBarStyles.container,
        tabBarShowLabel: true,
        tabBarLabelStyle: tabBarStyles.label,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarIcon: ({ focused }) => renderTabIcon(route.name, focused),
        tabBarLabel: route.name === 'AI' ? 'AI' : route.name,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeDashboard} />
      <Tab.Screen name="Farms" component={FarmStack} />
      <Tab.Screen name="Finance" component={FinanceStack} />
      <Tab.Screen name="AI" component={AIStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    height: 64,
    paddingBottom: spacing.xs,
    borderTopWidth: 0,
    ...shadows.lg,
    elevation: 8,
  },
  label: { fontSize: 10, fontWeight: '500', marginTop: -2 },
});
