import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../services/supabase';
import { Farm } from '../types';
import { getExpenses } from '../services/expenseService';
import { getIncomeRecords } from '../services/incomeService';
import { colors, spacing, radius, shadows } from '../theme';
import WeatherWidget from '../components/WeatherWidget';
import FarmCard from '../components/FarmCard';
import AICard from '../components/AICard';
import Loading from '../components/Loading';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const REMINDERS = [
  { icon: '🌱', textKey: 'reminder.water', gradient: ['#4A6B12', '#6B8E23'] as const },
  { icon: '🌾', textKey: 'reminder.harvest', gradient: ['#D4A843', '#E8B84A'] as const },
  { icon: '⚠️', textKey: 'reminder.rain', gradient: ['#3B82F6', '#60A5FA'] as const },
  { icon: '💧', textKey: 'reminder.irrigation', gradient: ['#0891B2', '#22D3EE'] as const },
  { icon: '🧪', textKey: 'reminder.fertilizer', gradient: ['#7C3AED', '#A78BFA'] as const },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay: index * 100, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

interface Props { navigation: any }

export default function HomeDashboard({ navigation }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    try {
      const [farmResult, expData, incData] = await Promise.all([
        supabase.from('farms').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        getExpenses(),
        getIncomeRecords(),
      ]);
      if (farmResult.data) setFarms(farmResult.data);
      setTotalExpenses(expData.reduce((s, e) => s + (e.amount || 0), 0));
      setTotalIncome(incData.reduce((s, i) => s + (i.amount || 0), 0));
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const m = user?.user_metadata || {};
  const name = m.full_name || 'Farmer';
  const location = [m.village, m.district, m.state].filter(Boolean).join(', ') || 'Your Farm';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = getGreeting();
  const greetingKey = `home.greeting.${greeting}` as const;
  const iconKey = `home.greeting.icon.${greeting}` as const;
  const reminder = REMINDERS[new Date().getDate() % REMINDERS.length];

  const avatarLetter = (name.charAt(0) || 'F').toUpperCase();

  if (loading) return <Loading fullScreen />;

  return (
    <ScrollView
      style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <AnimatedCard index={0}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingText}>{t(greetingKey)} {t(iconKey)}</Text>
            <Text style={styles.farmerName}>{name}</Text>
            <Text style={styles.dateLocation}>{today} • {location}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
        </View>
      </AnimatedCard>

      <AnimatedCard index={1}>
        <WeatherWidget location={location} />
      </AnimatedCard>

      <AnimatedCard index={2}>
        <LinearGradient colors={reminder.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.reminderCard}>
          <Text style={styles.reminderIcon}>{reminder.icon}</Text>
          <View style={styles.reminderTextBlock}>
            <Text style={styles.reminderLabel}>{t('home.smartReminder')}</Text>
            <Text style={styles.reminderText}>{t(reminder.textKey)}</Text>
          </View>
        </LinearGradient>
      </AnimatedCard>

      <AnimatedCard index={3}>
        <View style={styles.quickGrid}>
          <QuickActionTile icon="🌾" label={t('home.farms')} color="#4A6B12" onPress={() => navigation.navigate('Farms', { screen: 'FarmList' })} />
          <QuickActionTile icon="📒" label={t('home.cropDiary')} color="#D4A843" onPress={() => navigation.navigate('Farms', { screen: 'FarmList' })} />
          <QuickActionTile icon="💰" label={t('home.finance')} color="#2E7D32" onPress={() => navigation.navigate('Finance', { screen: 'FinanceDashboard' })} />
          <QuickActionTile icon="🤖" label={t('home.aiAssistant')} color="#4338CA" onPress={() => navigation.navigate('AI', { screen: 'AIChat' })} />
        </View>
      </AnimatedCard>

      <AnimatedCard index={4}>
        <AICard onPress={() => navigation.navigate('AI', { screen: 'AIChat' })} />
      </AnimatedCard>

      {farms.length > 0 && (
        <AnimatedCard index={5}>
          <View style={styles.farmSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.myFarms')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Farms', { screen: 'FarmList' })}>
                <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={farms}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={f => f.id}
              contentContainerStyle={styles.farmScroll}
              renderItem={({ item }) => (
                <View style={styles.farmCardWrap}>
                  <FarmCard
                    name={item.name}
                    village={item.village}
                    landArea={`${item.land_area_value || ''} ${item.land_area_unit || ''}`.trim()}
                    soilType={item.soil_type}
                    currentCrop={item.current_crop}
                    aiActive
                    onPress={() => navigation.navigate('Farms', { screen: 'FarmDetail', params: { farmId: item.id } })}
                  />
                </View>
              )}
            />
          </View>
        </AnimatedCard>
      )}

      {farms.length === 0 && (
        <AnimatedCard index={5}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>{t('home.noFarms.title')}</Text>
            <Text style={styles.emptyText}>{t('home.noFarms.text')}</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Farms', { screen: 'AddEditFarm' })}>
              <Text style={styles.emptyBtnText}>{t('home.noFarms.action')}</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>
      )}
    </ScrollView>
  );
}

function QuickActionTile({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      style={styles.quickTile}
      onPress={onPress}
      activeOpacity={0.85}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <View style={[styles.quickTileIcon, { backgroundColor: color + '18' }]}>
          <Text style={styles.quickTileEmoji}>{icon}</Text>
        </View>
        <Text style={styles.quickTileLabel}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl + 60 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md, marginTop: spacing.sm },
  greetingLeft: { flex: 1 },
  greetingText: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
  farmerName: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 2 },
  dateLocation: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  reminderCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: radius.xl, padding: spacing.md,
    marginBottom: spacing.md, ...shadows.md,
  },
  reminderIcon: { fontSize: 32, marginRight: spacing.md },
  reminderTextBlock: { flex: 1 },
  reminderLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  reminderText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  quickTile: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  quickTileIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  quickTileEmoji: { fontSize: 24 },
  quickTileLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  farmSection: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 13, fontWeight: '600', color: colors.primary },
  farmScroll: { paddingRight: spacing.md },
  farmCardWrap: { width: SCREEN_WIDTH * 0.7, marginRight: spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, marginTop: spacing.sm },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xl },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.pill },
  emptyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
