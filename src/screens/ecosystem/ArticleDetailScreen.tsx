import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const ARTICLES: Record<string, any> = {
  '1': { title: 'Complete Guide to Rice Cultivation', icon: '🌾', content: 'Rice is the most important food crop in India. Here is a comprehensive guide to rice cultivation.\n\n**1. Land Preparation**\nPlough the field 2-3 times to achieve fine tilth. Level the field for uniform water distribution. Apply well-decomposed FYM @ 10-15 tonnes/ha during final ploughing.\n\n**2. Seed Selection**\nUse certified seeds from reliable sources. Popular varieties include Sona Masoori, BPT 5204, Swarna, and MTU 7029. Treat seeds with fungicide before sowing.\n\n**3. Nursery Preparation**\nPrepare raised beds for nursery. Sow seeds at 50-60 kg/ha. Maintain 2-3 cm water depth in nursery. Nursery age: 25-30 days.\n\n**4. Transplanting**\nTransplant 2-3 seedlings per hill at 20x15 cm spacing. Maintain 2-5 cm water depth after transplanting.\n\n**5. Water Management**\nMaintain 5-10 cm water depth during vegetative stage. Drain field 10 days before harvest. Total water requirement: 1200-1500 mm.\n\n**6. Fertilizer Application**\nApply NPK 60:30:30 kg/ha as basal. Top dress nitrogen at tillering (30 kg/ha) and panicle initiation (30 kg/ha). Apply Zinc sulfate @ 25 kg/ha.\n\n**7. Pest Management**\nMonitor for stem borer, leaf folder, and brown plant hopper. Use need-based pesticide application. Encourage natural enemies.\n\n**8. Harvesting**\nHarvest at 90-95% grain ripening. Dry grains to 14% moisture. Expected yield: 5-6 tonnes/ha.', category: 'crop', readingTime: '8 min' },
};

interface Props { navigation: any; route: any }

export default function ArticleDetailScreen({ navigation, route }: Props) {
  const { articleId } = route.params;
  const insets = useSafeAreaInsets();
  const article = ARTICLES[articleId] || { title: 'Article', icon: '📄', content: 'Content coming soon.', category: 'general', readingTime: '—' };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Article</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>{article.icon}</Text>
          <Text style={styles.heroTitle}>{article.title}</Text>
          <View style={styles.heroMeta}>
            <Ionicons name="time-outline" size={14} color={colors.textLight} />
            <Text style={styles.heroTime}>{article.readingTime}</Text>
            <View style={styles.dot} />
            <Text style={styles.heroCat}>{article.category}</Text>
          </View>
        </View>

        <Text style={styles.body}>{article.content}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { paddingBottom: spacing.xxl },
  heroCard: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.surface, marginBottom: spacing.md },
  heroIcon: { fontSize: 48, marginBottom: spacing.md },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', letterSpacing: -0.3 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  heroTime: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textLight },
  heroCat: { fontSize: 12, color: colors.textLight, fontWeight: '600', textTransform: 'capitalize' },
  body: { padding: spacing.md, fontSize: 14, lineHeight: 24, color: colors.text, fontWeight: '500' },
});
