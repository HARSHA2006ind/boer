import { memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, LayoutChangeEvent } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MainTabParamList } from '../types';
import HomeDashboard from '../screens/HomeDashboard';
import FarmStack from './FarmStack';
import FinanceStack from './FinanceStack';
import MarketScreen from '../screens/MarketScreen';
import EcosystemStack from './EcosystemStack';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { duration } from '../theme/motion';

const Tab = createBottomTabNavigator<MainTabParamList>();

const BAR_HEIGHT = 60;
const PILL_SIZE = 40;

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Farms: { active: 'leaf', inactive: 'leaf-outline' },
  Finance: { active: 'wallet', inactive: 'wallet-outline' },
  Market: { active: 'trending-up', inactive: 'trending-up-outline' },
  Ecosystem: { active: 'planet', inactive: 'planet-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Home: 'nav.home',
  Farms: 'nav.farms',
  Finance: 'nav.finance',
  Market: 'nav.market',
  Ecosystem: 'nav.ecosystem',
};

interface TabBarPillProps {
  barWidth: number;
  activeIndex: number;
  isDark: boolean;
}

const TabBarPill = memo(function TabBarPill({ barWidth, activeIndex, isDark }: TabBarPillProps) {
  const tabWidth = barWidth / 5;
  const offset = (tabWidth - PILL_SIZE) / 2;
  const translateX = useSharedValue(activeIndex * tabWidth + offset);

  translateX.value = withTiming(activeIndex * tabWidth + offset, {
    duration: 250,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[pillStyle, styles.pill, { backgroundColor: isDark ? '#14B8A6' : '#14B8A6' }]}
    />
  );
});

interface CustomTabBarProps {
  state: any;
  navigation: any;
}

const CustomTabBar = memo(function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const [barWidth, setBarWidth] = useState(0);

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  }, []);

  const bottomInset = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 8)
    : Math.max(insets.bottom, 8);

  return (
    <View style={[styles.barOuter, { paddingBottom: bottomInset }]}>
      <View
        onLayout={onBarLayout}
        style={[
          styles.barInner,
          {
            backgroundColor: isDark ? 'rgba(24,28,35,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(226,232,240,0.8)',
            shadowColor: isDark ? '#000' : '#0F172A',
          },
        ]}
      >
        {barWidth > 0 && (
          <TabBarPill barWidth={barWidth} activeIndex={state.index} isDark={isDark} />
        )}
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const icons = TAB_ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };

          const onPress = () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={1}
              style={styles.tabItem}
            >
              <View style={[styles.iconWrap, focused && styles.iconActive]}>
                <Ionicons
                  name={focused ? icons.active : icons.inactive}
                  size={22}
                  color={focused ? '#FFFFFF' : (isDark ? '#64748B' : '#94A3B8')}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: focused
                      ? (isDark ? '#F8FAFC' : '#0F172A')
                      : (isDark ? '#64748B' : '#94A3B8'),
                  },
                ]}
              >
                {t(TAB_LABELS[route.name] || route.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: 'fade',
      }}
    >
      <Tab.Screen name="Home" component={HomeDashboard} />
      <Tab.Screen name="Farms" component={FarmStack} />
      <Tab.Screen name="Finance" component={FinanceStack} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Ecosystem" component={EcosystemStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barOuter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  barInner: {
    flexDirection: 'row',
    borderRadius: 24,
    height: BAR_HEIGHT,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  pill: {
    position: 'absolute',
    top: 10,
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: PILL_SIZE / 2,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 2,
  },
  iconWrap: {
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: PILL_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {},
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
