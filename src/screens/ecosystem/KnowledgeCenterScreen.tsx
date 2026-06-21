import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';
import { fetchArticles } from '../../services/learningService';
import { LearningArticle } from '../../types';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'crop', label: 'Crop Mgmt', icon: 'leaf' },
  { key: 'soil', label: 'Soil Health', icon: 'earth' },
  { key: 'irrigation', label: 'Irrigation', icon: 'water' },
  { key: 'fertilizer', label: 'Fertilizers', icon: 'flask' },
  { key: 'pest', label: 'Pest Mgmt', icon: 'bug' },
  { key: 'organic', label: 'Organic', icon: 'leaf' },
  { key: 'harvest', label: 'Harvesting', icon: 'crop' },
  { key: 'finance', label: 'Farm Finance', icon: 'wallet' },
];

interface Props { navigation: any }

export default function KnowledgeCenterScreen({ navigation }: Props) {
  const [activeCat, setActiveCat] = useState('all');
  const [articles, setArticles] = useState<LearningArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    const data = await fetchArticles(activeCat);
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => { loadArticles(); }, [activeCat]);

  const CATEGORY_ICONS: Record<string, string> = {
    crop: '🌾', soil: '🌱', irrigation: '💧', fertilizer: '🧪',
    pest: '🐛', organic: '🌿', harvest: '🌾', finance: '💰',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map(cat => {
          const active = activeCat === cat.key;
          return (
            <TouchableOpacity key={cat.key} style={[styles.catChip, active && styles.catActive]} onPress={() => setActiveCat(cat.key)}>
              <Ionicons name={cat.icon as any} size={14} color={active ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <View style={styles.grid}>
          {articles.map(article => (
            <TouchableOpacity key={article.id} style={styles.articleCard} activeOpacity={0.8}
              onPress={() => navigation.navigate('ArticleDetail', { articleId: article.id })}>
              <View style={styles.iconWrap}>
                <Text style={styles.articleIcon}>{CATEGORY_ICONS[article.category] || '📄'}</Text>
              </View>
              <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
              <Text style={styles.articleSummary} numberOfLines={2}>{article.summary}</Text>
              <View style={styles.articleMeta}>
                <Ionicons name="time-outline" size={11} color={colors.textLight} />
                <Text style={styles.readingTime}>{article.reading_time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  loadingContainer: { paddingVertical: spacing.xxl * 2, justifyContent: 'center', alignItems: 'center' },
  catScroll: { marginBottom: spacing.md },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  catLabelActive: { color: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  articleCard: { width: (width - spacing.md * 2 - spacing.md) / 2, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, ...shadows.sm },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  articleIcon: { fontSize: 18 },
  articleTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: spacing.xs, lineHeight: 18 },
  articleSummary: { fontSize: 11, color: colors.textSecondary, lineHeight: 15, marginBottom: spacing.sm },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readingTime: { fontSize: 10, color: colors.textLight, fontWeight: '500' },
});
