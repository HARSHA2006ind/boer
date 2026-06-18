import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Farm, IncomeRecord, Expense } from '../types';
import { useWeather } from '../hooks/useWeather';
import { useLanguage } from '../i18n/LanguageContext';
import WeatherHero from '../components/WeatherHero';
import AlertsSection, { HomeAlert } from '../components/AlertsSection';
import TodayPlanCard, { PlanTask } from '../components/TodayPlanCard';
import FinanceSnapshotCard from '../components/FinanceSnapshotCard';
import { spacing } from '../theme';

const TAB_BAR_HEIGHT = 68;

function getCurrentMonth() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

interface Props {
  navigation: any;
}

export default function HomeDashboard({ navigation }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const defaultFarm = farms[0];
  const weatherLocation = defaultFarm
    ? [defaultFarm.village, defaultFarm.district, defaultFarm.state].filter(Boolean).join(', ')
    : null;
  const { weather } = useWeather(weatherLocation || undefined, defaultFarm?.name);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [farmRes, incomeRes, expenseRes] = await Promise.all([
        supabase.from('farms').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('income_records').select('*').eq('user_id', user.id).order('income_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('user_id', user.id).order('expense_date', { ascending: false }),
      ]);
      if (farmRes.data) setFarms(farmRes.data);
      if (incomeRes.data) setIncomes(incomeRes.data);
      if (expenseRes.data) setExpenses(expenseRes.data);
    } catch {
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const monthIncomes = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return incomes
      .filter((i) => i.income_date >= start)
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [incomes]);

  const monthExpenses = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return expenses
      .filter((e) => e.expense_date >= start)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const monthProfit = monthIncomes - monthExpenses;

  const alerts: HomeAlert[] = useMemo(() => {
    const list: HomeAlert[] = [];
    const h = new Date().getHours();
    const isDay = h >= 6 && h < 18;
    const temp = weather.temperature || 30;
    const cond = (weather.condition || '').toLowerCase();
    if (temp > 38) {
      list.push({
        id: 'heat',
        type: 'heat_wave',
        title: 'Heat Wave Warning',
        description: `Temperature ${temp}°C — take precautions`,
        severity: 'high',
      });
    }
    if (cond.includes('rain') || cond.includes('thunder')) {
      list.push({
        id: 'rain',
        type: 'heavy_rain',
        title: 'Heavy Rain Expected',
        description: 'Prepare drainage and delay irrigation',
        severity: 'critical',
      });
    }
    if (cond.includes('fog') || cond.includes('mist')) {
      list.push({
        id: 'fog',
        type: 'fog',
        title: 'Dense Fog Alert',
        description: 'Low visibility — drive carefully',
        severity: 'medium',
      });
    }
    if (isDay && temp > 35) {
      list.push({
        id: 'sun_alert',
        type: 'heat',
        title: 'High UV Index',
        description: 'Use shade nets for sensitive crops',
        severity: 'medium',
      });
    }
    return list;
  }, [weather]);

  const tasks: PlanTask[] = useMemo(() => {
    const list: PlanTask[] = [];
    if (tempCropNeedsIrrigation(weather)) {
      list.push({ id: 'irrigation', title: t('reminder.water'), completed: false });
    }
    list.push({ id: 'fertilizer', title: t('reminder.fertilizer'), completed: false });
    list.push({ id: 'inspection', title: t('reminder.cropInspection'), completed: false });
    if (monthExpenses === 0) {
      list.push({ id: 'finance', title: 'Record monthly expenses', completed: false });
    }
    return list.slice(0, 4);
  }, [weather, monthExpenses, t]);

  return (
    <View style={styles.wrapper}>
      <Animated.ScrollView
        entering={FadeInDown.duration(600)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor="#1E6F50"
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}
        >
          <View>
            <Text style={styles.greeting}>
              Boer
            </Text>
            <Text style={styles.greetingSub}>
              Smart Farming App
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={28} color="#1E6F50" />
          </TouchableOpacity>
        </Animated.View>

        {/* Section 1: Weather Hero */}
        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <WeatherHero
            temperature={weather.temperature || 30}
            condition={weather.condition || 'Sunny'}
            location={weather.location || ''}
            humidity={weather.humidity || 65}
            windSpeed={weather.windSpeed || 12}
            rainChance={weather.rainChance || 10}
            sunrise={weather.sunrise || '6:15 AM'}
            sunset={weather.sunset || '6:45 PM'}
            isDay={weather.isDay ?? true}
            forecast={weather.forecast || []}
          />
        </Animated.View>

        {/* Section 2: Alerts */}
        <AlertsSection
          alerts={alerts}
          onViewAll={() => navigation.navigate('Ecosystem', { screen: 'AlertsTab' })}
        />

        {/* Section 3: Today's Plan */}
        <TodayPlanCard
          tasks={tasks}
          onViewFull={() => navigation.navigate('Farms')}
        />

        {/* Section 4: Finance Snapshot */}
        <FinanceSnapshotCard
          revenue={monthIncomes}
          expenses={monthExpenses}
          profit={monthProfit}
          month={getCurrentMonth()}
          onViewDetails={() => navigation.navigate('Finance')}
        />
      </Animated.ScrollView>
    </View>
  );
}

function tempCropNeedsIrrigation(weather: any): boolean {
  const h = new Date().getHours();
  const isDay = h >= 6 && h < 18;
  const temp = weather.temperature || 30;
  const rain = weather.rainChance || 0;
  if (!isDay) return false;
  if (rain > 60) return false;
  if (temp > 32) return true;
  return false;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F7F8F6',
  },
  scrollInner: {
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 1,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F1EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
