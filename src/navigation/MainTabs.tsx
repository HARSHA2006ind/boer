import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, LayoutChangeEvent } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from 'react-native-reanimated';
import { MainTabParamList } from '../types';
import HomeDashboard from '../screens/HomeDashboard';
import FarmStack from './FarmStack';
import FinanceStack from './FinanceStack';
import MarketScreen from '../screens/MarketScreen';
import EcosystemStack from './EcosystemStack';
import { useLanguage } from '../i18n/LanguageContext';
import Loading from '../components/Loading';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACTIVE_COLOR = '#2F5D50';
const BAR_BG = 'rgba(253,252,248,0.96)';
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

function TabScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View style={{ flex: 1 }} entering={FadeInDown.duration(300).springify().damping(22)}>
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

function SlidingPill({ barWidth, activeIndex }: { barWidth: number; activeIndex: number; prevIndex: number }) {
  const tabWidth = barWidth / 5;
  const offset = tabWidth / 2 - PILL_SIZE / 2;
  const targetX = activeIndex * tabWidth + offset;

  const translateX = useSharedValue(targetX);

  useEffect(() => {
    translateX.value = withSpring(targetX, { damping: 14, stiffness: 200, mass: 0.6 });
  }, [targetX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: withSpring(1, { damping: 20, stiffness: 300 }),
  }));

  return (
    <Animated.View style={[pillStyle, { position: 'absolute', bottom: 18 }]}>
      <Animated.View
        style={[
          {
            width: PILL_SIZE,
            height: PILL_SIZE,
            borderRadius: PILL_SIZE / 2,
            backgroundColor: ACTIVE_COLOR,
            shadowColor: ACTIVE_COLOR,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          },
          glowStyle,
        ]}
      />
    </Animated.View>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [barWidth, setBarWidth] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  }, []);

  const activeIndex = state.index;
  useEffect(() => {
    if (activeIndex !== prevIndex) setPrevIndex(activeIndex);
  }, [activeIndex]);

  return (
    <View
      style={[
        tabBarStyles.container,
        {
          bottom: Platform.OS === 'ios'
            ? Math.max(insets.bottom - 6, 6)
            : Math.max(insets.bottom, 6),
        },
      ]}
    >
      <View onLayout={onBarLayout} style={tabBarStyles.inner}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const icons = TAB_ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = focused ? icons.active : icons.inactive;
          const iconColor = focused ? '#FFFFFF' : 'rgba(47,93,80,0.3)';
          const labelColor = focused ? ACTIVE_COLOR : 'rgba(47,93,80,0.3)';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={1}
              style={tStyles.item}
            >
              <View style={[tStyles.iconWrap, focused && tStyles.iconWrapActive]}>
                <Ionicons name={iconName} size={22} color={iconColor} />
              </View>
              <Text style={[tStyles.label, { color: labelColor }]}>
                {t(TAB_LABELS[route.name] || route.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
        {barWidth > 0 && (
          <SlidingPill barWidth={barWidth} activeIndex={state.index} prevIndex={prevIndex} />
        )}
      </View>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
    >
      <Tab.Screen name="Home" component={withTabTransition(HomeDashboard)} />
      <Tab.Screen name="Farms" component={withTabTransition(FarmStack)} />
      <Tab.Screen name="Finance" component={withTabTransition(FinanceStack)} />
      <Tab.Screen name="Market" component={withTabTransition(MarketScreen)} />
      <Tab.Screen name="Ecosystem" component={withTabTransition(EcosystemStack)} />
    </Tab.Navigator>
  );
}

const tStyles = StyleSheet.create({
  item: {
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
  iconWrapActive: {},
  label: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  inner: {
    flexDirection: 'row',
    backgroundColor: BAR_BG,
    borderRadius: 28,
    height: 64,
    borderWidth: 1,
    borderColor: 'rgba(47,93,80,0.06)',
    shadowColor: '#2F5D50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
});
