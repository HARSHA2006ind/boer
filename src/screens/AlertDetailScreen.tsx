import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface AlertDetail {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  farm: string;
  timestamp: string;
  reason?: string;
  affectedFarms?: string[];
  recommendedActions?: string[];
  weatherContext?: string;
  marketContext?: string;
  aiRecommendations?: string[];
}

interface Props { navigation: any; route: any }

export default function AlertDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const alert: AlertDetail = route.params?.alert || {};

  const sections = [
    { key: 'reason', icon: 'help-circle-outline', label: 'alert.detail.reason', content: alert.reason || alert.description },
    { key: 'farms', icon: 'leaf-outline', label: 'alert.detail.affectedFarms', content: alert.affectedFarms?.join(', ') || alert.farm },
    { key: 'actions', icon: 'bulb-outline', label: 'alert.detail.recommendedActions', content: alert.recommendedActions?.join('\n') || 'Monitor conditions closely. Take preventive measures as needed.' },
    { key: 'weather', icon: 'cloud-outline', label: 'alert.detail.weatherContext', content: alert.weatherContext || 'Current weather data not available for this alert.' },
    { key: 'market', icon: 'trending-up-outline', label: 'alert.detail.marketContext', content: alert.marketContext || 'Market data not available for this alert.' },
    { key: 'ai', icon: 'sparkles-outline', label: 'alert.detail.aiRecommendations', content: alert.aiRecommendations?.join('\n') || 'AI recommendations not available for this alert.' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.secondary }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('alert.detail.reason')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Animated.View entering={FadeIn.duration(300)} style={[styles.hero, { backgroundColor: colors.surface }]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{alert.title}</Text>
          <View style={styles.heroMeta}>
            <Ionicons name="time-outline" size={14} color={colors.textLight} />
            <Text style={[styles.heroTime, { color: colors.textLight }]}>{alert.timestamp}</Text>
          </View>
          {alert.farm && (
            <View style={styles.heroFarm}>
              <Ionicons name="location-outline" size={14} color={colors.textLight} />
              <Text style={[styles.heroFarmText, { color: colors.textLight }]}>{alert.farm}</Text>
            </View>
          )}
        </Animated.View>

        {sections.map((section, i) => (
          <Animated.View key={section.key} entering={FadeIn.duration(300).delay(100 + i * 60)} style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon as any} size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t(section.label)}</Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{section.content}</Text>
          </Animated.View>
        ))}

        <TouchableOpacity style={[styles.resolveBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.resolveText}>{t('alert.action.markResolved')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  content: { padding: spacing.md },
  hero: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  heroTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, marginBottom: spacing.sm },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  heroTime: { fontSize: 13, fontWeight: '500' },
  heroFarm: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  heroFarmText: { fontSize: 13, fontWeight: '500' },
  section: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionContent: { fontSize: 14, lineHeight: 20 },
  resolveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.pill, paddingVertical: spacing.md, marginTop: spacing.sm },
  resolveText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
