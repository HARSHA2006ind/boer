import { memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, LayoutChangeEvent } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MainTabParamList } from '../types';
import HomeDashboard from '../screens/HomeDashboard';
import FarmStack from './FarmStack';
import FinanceStack from './FinanceStack';
import MarketScreen from '../screens/MarketScreen';
import EcosystemStack from './EcosystemStack';
import { useLanguage } from '../i18n/LanguageContext';
import { duration } from '../theme/motion';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACTIVE_COLOR = '#6B705C';
const INACTIVE_COLOR = 'rgba(107,112,92,0.25)';
const PILL_COLOR = '#CB997E';
const BAR_HEIGHT = 64;
const PILL_SIZE = 44;

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
}

const TabBarPill = memo(function TabBarPill({ barWidth, activeIndex }: TabBarPillProps) {
  const tabWidth = barWidth / 5;
  const offset = (tabWidth - PILL_SIZE) / 2;
  const translateX = useSharedValue(activeIndex * tabWidth + offset);

  translateX.value = withTiming(activeIndex * tabWidth + offset, {
    duration: duration.normal,
    easing: Easing.bezier(0.2, 0.0, 0.0, 1),
  });

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(duration.normal)}
      style={[pillStyle, styles.pill]}
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
  const [barWidth, setBarWidth] = useState(0);

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  }, []);

  const bottomInset = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 4)
    : Math.max(insets.bottom, 4);

  return (
    <View style={[styles.barOuter, { paddingBottom: bottomInset }]}>
      <View onLayout={onBarLayout} style={styles.barInner}>
        {barWidth > 0 && (
          <TabBarPill barWidth={barWidth} activeIndex={state.index} />
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
                  color={focused ? '#FFFFFF' : INACTIVE_COLOR}
                />
              </View>
              <Text style={[styles.label, { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
                {t(TAB_LABELS[route.name] || route.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

function TabScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View
      entering={FadeIn.duration(300).withInitialValues({ opacity: 0 })}
      style={styles.screen}
    >
      {children}
    </Animated.View>
  );
}

function withTabTransition(Component: React.ComponentType<any>): React.ComponentType<any> {
  return function TabTransition(props: any) {
    return (
      <TabScreenWrapper>
        <Component {...props} />
      </TabScreenWrapper>
    );
  };
}

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
      <Tab.Screen name="Home" component={withTabTransition(HomeDashboard)} />
      <Tab.Screen name="Farms" component={withTabTransition(FarmStack)} />
      <Tab.Screen name="Finance" component={withTabTransition(FinanceStack)} />
      <Tab.Screen name="Market" component={withTabTransition(MarketScreen)} />
      <Tab.Screen name="Ecosystem" component={withTabTransition(EcosystemStack)} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  barOuter: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  barInner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(253,252,248,0.97)',
    borderRadius: 28,
    height: BAR_HEIGHT,
    borderWidth: 1,
    borderColor: 'rgba(107,112,92,0.06)',
    shadowColor: '#6B705C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  pill: {
    position: 'absolute',
    bottom: 8,
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: PILL_SIZE / 2,
    backgroundColor: PILL_COLOR,
    shadowColor: '#CB997E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 4,
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
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
