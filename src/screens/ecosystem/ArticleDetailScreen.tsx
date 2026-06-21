import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';
import { fetchArticleById } from '../../services/learningService';
import { LearningArticle } from '../../types';

interface Props { navigation: any; route: any }

export default function ArticleDetailScreen({ navigation, route }: Props) {
  const { articleId } = route.params;
  const insets = useSafeAreaInsets();
  const [article, setArticle] = useState<LearningArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, []);

  const loadArticle = async () => {
    const data = await fetchArticleById(articleId);
    setArticle(data || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textLight }}>Article not found</Text>
      </View>
    );
  }

  const CATEGORY_ICONS: Record<string, string> = {
    crop: '🌾', soil: '🌱', irrigation: '💧', fertilizer: '🧪',
    pest: '🐛', organic: '🌿', harvest: '🌾', finance: '💰',
  };

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
          <Text style={styles.heroIcon}>{CATEGORY_ICONS[article.category] || '📄'}</Text>
          <Text style={styles.heroTitle}>{article.title}</Text>
          <View style={styles.heroMeta}>
            <Ionicons name="time-outline" size={14} color={colors.textLight} />
            <Text style={styles.heroTime}>{article.reading_time}</Text>
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
