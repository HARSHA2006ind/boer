import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

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
  { key: 'video', label: 'Videos', icon: 'videocam' },
];

const ARTICLES = [
  { id: '1', category: 'crop', title: 'Complete Guide to Rice Cultivation', summary: 'Learn everything about rice farming from sowing to harvest.', readingTime: '8 min', coverIcon: '🌾', type: 'article' },
  { id: '2', category: 'soil', title: 'How to Test Your Soil pH at Home', summary: 'Simple methods to check soil acidity and alkalinity without lab equipment.', readingTime: '5 min', coverIcon: '🌱', type: 'article' },
  { id: '3', category: 'irrigation', title: 'Drip Irrigation: Complete Setup Guide', summary: 'Step-by-step guide to installing drip irrigation for maximum water efficiency.', readingTime: '12 min', coverIcon: '💧', type: 'article' },
  { id: '4', category: 'fertilizer', title: 'NPK Fertilizers Explained Simply', summary: 'Understanding nitrogen, phosphorus, and potassium for better crop yields.', readingTime: '6 min', coverIcon: '🧪', type: 'article' },
  { id: '5', category: 'pest', title: 'Natural Pest Control Methods', summary: 'Effective organic pest control solutions for common crop pests.', readingTime: '10 min', coverIcon: '🐛', type: 'article' },
  { id: '6', category: 'organic', title: 'Starting Organic Farming: Beginner\'s Guide', summary: 'Everything you need to know to transition to organic farming.', readingTime: '15 min', coverIcon: '🌿', type: 'article' },
  { id: '7', category: 'harvest', title: 'Post-Harvest Management Best Practices', summary: 'Reduce losses and maximize profits with proper post-harvest handling.', readingTime: '7 min', coverIcon: '🌾', type: 'article' },
  { id: '8', category: 'finance', title: 'Farm Budgeting & Financial Planning', summary: 'Simple financial planning strategies for small and marginal farmers.', readingTime: '9 min', coverIcon: '💰', type: 'article' },
  { id: '9', category: 'crop', title: 'Vegetable Farming for Maximum Profit', summary: 'High-yield vegetable farming techniques for small landholdings.', readingTime: '11 min', coverIcon: '🍅', type: 'article' },
  { id: '10', category: 'video', title: 'Rice Transplanting Techniques', summary: 'Watch our video guide on proper rice transplanting methods.', readingTime: '15 min', coverIcon: '🎥', type: 'video' },
  { id: '11', category: 'video', title: 'Organic Compost Making at Home', summary: 'Step-by-step video guide to making nutrient-rich compost.', readingTime: '20 min', coverIcon: '🎥', type: 'video' },
  { id: '12', category: 'video', title: 'Tractor Operation Safety Tips', summary: 'Essential safety guidelines for operating farm machinery.', readingTime: '12 min', coverIcon: '🎥', type: 'video' },
];

interface Props { navigation: any }

export default function KnowledgeCenterScreen({ navigation }: Props) {
  const [activeCat, setActiveCat] = useState('all');

  const filtered = activeCat === 'all' ? ARTICLES : ARTICLES.filter(a => a.category === activeCat);
  const videos = filtered.filter(a => a.type === 'video');
  const articles = filtered.filter(a => a.type !== 'video');

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

      {videos.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Video Lessons</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoScroll}>
            {videos.map(v => (
              <TouchableOpacity key={v.id} style={styles.videoCard} activeOpacity={0.8}
                onPress={() => navigation.navigate('ArticleDetail', { articleId: v.id })}>
                <View style={styles.videoThumb}>
                  <Text style={styles.videoIcon}>{v.coverIcon}</Text>
                  <View style={styles.playBtn}>
                    <Ionicons name="play" size={20} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
                <Text style={styles.videoDuration}>{v.readingTime}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={styles.sectionTitle}>{activeCat === 'video' ? '' : 'Articles'}</Text>
      {articles.map(article => (
        <TouchableOpacity key={article.id} style={styles.articleCard} activeOpacity={0.7}
          onPress={() => navigation.navigate('ArticleDetail', { articleId: article.id })}>
          <Text style={styles.articleIcon}>{article.coverIcon}</Text>
          <View style={styles.articleInfo}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleSummary} numberOfLines={2}>{article.summary}</Text>
            <View style={styles.articleMeta}>
              <Ionicons name="time-outline" size={12} color={colors.textLight} />
              <Text style={styles.articleTime}>{article.readingTime}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </TouchableOpacity>
      ))}

      {articles.length === 0 && videos.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyText}>No content yet in this category</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  catScroll: { marginBottom: spacing.md },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  catLabelActive: { color: '#FFFFFF' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
  videoScroll: { marginBottom: spacing.md },
  videoCard: { width: width * 0.45, marginRight: spacing.md },
  videoThumb: { height: 110, borderRadius: radius.lg, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  videoIcon: { fontSize: 36 },
  playBtn: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  videoTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  videoDuration: { fontSize: 11, color: colors.textLight, fontWeight: '500', marginTop: 2 },
  articleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  articleIcon: { fontSize: 28, marginRight: spacing.md },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  articleSummary: { fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 15 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  articleTime: { fontSize: 10, color: colors.textLight, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyText: { fontSize: 14, color: colors.textLight, fontWeight: '600' },
});
