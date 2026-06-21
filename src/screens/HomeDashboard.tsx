import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated as RNAnimated } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Farm } from '../types';
import { useWeather } from '../hooks/useWeather';
import { fetchMarketPrices } from '../services/marketService';
import WeatherHero from '../components/WeatherHero';
import SmartRecommendations from '../components/SmartRecommendations';
import AlertsSection, { HomeAlert } from '../components/AlertsSection';
import SmartReminderCard, { Reminder } from '../components/SmartReminderCard';
import MarketPricesRow from '../components/MarketPricesRow';
import { spacing } from '../theme';
import { duration } from '../theme/motion';

const TAB_BAR_HEIGHT = 80;

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const CROP_ICONS: Record<string, string> = {
  rice: '🌾', wheat: '🌾', maize: '🌽', cotton: '🛡️', sugarcane: '🌿',
  tomato: '🍅', onion: '🧅', potato: '🥔', groundnut: '🥜', chilli: '🌶️',
  banana: '🍌', mango: '🥭', soybean: '🫘', sunflower: '🌻', coconut: '🥥',
};

const SECTION_DELAYS = [0, 100, 150, 200, 250];

interface Props { navigation: any }

export default function HomeDashboard({ navigation }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [marketCrops, setMarketCrops] = useState<{ name: string; icon: string; price: number; unit: string; change: number; trend: 'up' | 'down' }[]>([]);

  const defaultFarm = farms[0];
  const weatherLocation = defaultFarm
    ? [defaultFarm.village, defaultFarm.district, defaultFarm.state].filter(Boolean).join(', ')
    : null;
  const { weather } = useWeather(weatherLocation || undefined, defaultFarm?.name);
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  const loadMarketData = useCallback(async () => {
    try {
      const prices = await fetchMarketPrices({ limit: 10 });
      if (prices.length > 0) {
        setMarketCrops(prices.map(p => ({
          name: p.crop,
          icon: CROP_ICONS[p.crop.toLowerCase()] || '🌾',
          price: p.priceNum,
          unit: 'Quintal',
          change: p.changeNum,
          trend: (p.trend === 'up' ? 'up' : 'down') as 'up' | 'down',
        })));
      }
    } catch {}
  }, []);

  const fetchFarms = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('farms').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setFarms(data);
    } catch {}
    finally { setRefreshing(false); }
  }, [user]);

  useEffect(() => { fetchFarms(); loadMarketData(); }, [fetchFarms, loadMarketData]);
  useEffect(() => { RNAnimated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start(); }, []);

  const alerts: HomeAlert[] = useMemo(() => {
    const list: HomeAlert[] = [];
    const temp = weather.temperature || 30;
    const cond = (weather.condition || '').toLowerCase();
    if (temp > 38) list.push({ id: 'heat', type: 'heat_wave', title: 'Heat Wave Warning', description: `Temperature ${temp}°C expected`, severity: 'high', affectedFarm: defaultFarm?.name });
    if (cond.includes('rain') || cond.includes('thunder')) list.push({ id: 'rain', type: 'heavy_rain', title: 'Heavy Rain Expected Tomorrow', description: 'Prepare drainage, delay irrigation', severity: 'critical', affectedFarm: defaultFarm?.name });
    if (cond.includes('cyclone') || cond.includes('storm')) list.push({ id: 'cyclone', type: 'cyclone', title: 'Cyclone Warning', description: 'Secure equipment immediately', severity: 'critical', affectedFarm: defaultFarm?.name });
    if (cond.includes('fog') || cond.includes('mist')) list.push({ id: 'fog', type: 'flood', title: 'Dense Fog Alert', description: 'Low visibility, drive carefully', severity: 'medium' });
    if (cond.includes('pest') || defaultFarm?.current_crop === 'Cotton') list.push({ id: 'pest', type: 'pest', title: 'Pest Risk Warning', description: 'Aphids spotted in nearby farms', severity: 'high', affectedFarm: defaultFarm?.name });
    return list;
  }, [weather, defaultFarm]);

  const reminders: Reminder[] = useMemo(() => {
    const list: Reminder[] = [];
    const h = new Date().getHours();
    const isDay = h >= 6 && h < 18;
    const temp = weather.temperature || 30;
    const rain = weather.rainChance || 0;
    if (isDay && temp > 30 && rain < 40) list.push({ id: 'irrigate', icon: '💧', title: 'Irrigation Recommended Today', subtitle: 'Soil moisture levels dropping', color: '#3B82F6', bgColor: '#EFF6FF' });
    list.push({ id: 'harvest', icon: '🌾', title: 'Harvest Window Opens In 3 Days', subtitle: 'Prepare for harvesting activity', color: '#2D8A4E', bgColor: '#ECFDF5' });
    list.push({ id: 'fertilizer', icon: '🧪', title: 'Fertilizer Application Due This Week', subtitle: 'Apply NPK to active crops', color: '#D4872F', bgColor: '#FFF8F0' });
    return list;
  }, [weather]);

  return (
    <View style={styles.wrapper}>
      <RNAnimated.View style={[styles.content, { opacity: fadeAnim, paddingTop: Math.max(insets.top, 12) }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.lg }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFarms(); }} tintColor="#6B705C" />}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Good {getGreeting()}</Text>
              <Text style={styles.date}>{getFormattedDate()}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.aiBtn}
                onPress={() => navigation.navigate('AIHub')}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
                <Ionicons name="person-circle" size={38} color="#6B705C" />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View entering={FadeIn.duration(duration.normal)}>
            <WeatherHero
              temperature={weather.temperature || 30}
              condition={weather.condition || 'Sunny'}
              location={weather.location || ''}
              farmName={defaultFarm?.name}
              humidity={weather.humidity || 65}
              windSpeed={weather.windSpeed || 12}
              rainChance={weather.rainChance || 10}
              forecast={weather.forecast || []}
            />
          </Animated.View>

          <Animated.View entering={FadeIn.duration(duration.normal)}>
            <SmartRecommendations
              recommendations={[]}
              onPress={(id) => {
                if (id === 'irrigate' || id === 'harvest' || id === 'fertilizer') {
                  navigation.navigate('SmartReminder');
                } else {
                  navigation.navigate('AlertHistory');
                }
              }}
            />
          </Animated.View>

          <Animated.View entering={FadeIn.duration(duration.normal)}>
            <AlertsSection
              alerts={alerts}
              onViewAll={() => navigation.navigate('AlertHistory')}
              onAlertPress={(alert) => navigation.navigate('AlertDetail', { alert })}
            />
          </Animated.View>

          <Animated.View entering={FadeIn.duration(duration.normal)}>
            <SmartReminderCard
              reminders={reminders}
              onViewAll={() => navigation.navigate('SmartReminder')}
              onPress={() => navigation.navigate('SmartReminder')}
            />
          </Animated.View>

          <Animated.View entering={FadeIn.duration(duration.normal)}>
            <MarketPricesRow
              crops={marketCrops}
              onViewAll={() => navigation.navigate('Market')}
              onCropPress={(crop) => navigation.navigate('Market')}
            />
          </Animated.View>
        </ScrollView>
      </RNAnimated.View>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F3EF' },
  content: { flex: 1, paddingHorizontal: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  headerLeft: {},
  greeting: { fontSize: 22, fontWeight: '700', color: '#1F2937', letterSpacing: -0.3 },
  date: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6B705C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B705C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
