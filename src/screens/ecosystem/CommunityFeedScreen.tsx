import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

const POST_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'text', label: 'Posts' },
  { key: 'question', label: 'Q&A' },
  { key: 'success_story', label: 'Stories' },
  { key: 'pest_alert', label: 'Alerts' },
  { key: 'tip', label: 'Tips' },
];

const FEED = [
  { id: '1', farmer: 'Ramesh Kumar', village: 'Sangareddy', district: 'Sangareddy', time: '2h ago', type: 'success_story' as const, content: 'My cotton yield improved 40% this season using drip irrigation! So happy with the results. Thanks Boer for the advice 🌱', likes: 28, comments: 7, image: '' },
  { id: '2', farmer: 'Lakshmi Devi', village: 'Guntur', district: 'Guntur', time: '4h ago', type: 'question' as const, content: 'My tomato plants have yellow spots on leaves. What should I apply? 📸', likes: 15, comments: 12, image: '' },
  { id: '3', farmer: 'Venkatesh Rao', village: 'Warangal', district: 'Warangal', time: '6h ago', type: 'pest_alert' as const, content: '⚠️ Fall Armyworm spotted in Warangal region! Check your maize crops immediately. Apply recommended pesticides.', likes: 45, comments: 23, image: '' },
  { id: '4', farmer: 'Priya Sharma', village: 'Nashik', district: 'Nashik', time: '8h ago', type: 'tip' as const, content: 'Tip: Apply neem oil 5% solution weekly to prevent pest attacks. Works great for vegetables! 🥬', likes: 32, comments: 5, image: '' },
  { id: '5', farmer: 'Surya Prakash', village: 'Khammam', district: 'Khammam', time: '12h ago', type: 'success_story' as const, content: 'Switched to organic farming 2 years ago. Now my soil is healthier and profits are better. Best decision ever! 🌾✨', likes: 56, comments: 18, image: '' },
  { id: '6', farmer: 'Anjali Reddy', village: 'Kurnool', district: 'Kurnool', time: '1d ago', type: 'question' as const, content: 'Best fertilizer for groundnut in sandy soil? Please suggest 🙏', likes: 11, comments: 9, image: '' },
];

interface Props { navigation: any }

export default function CommunityFeedScreen({ navigation }: Props) {
  const [activeType, setActiveType] = useState('all');
  const [liked, setLiked] = useState<string[]>([]);

  const filtered = activeType === 'all' ? FEED : FEED.filter(p => p.type === activeType);

  const toggleLike = (id: string) => {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll} contentContainerStyle={styles.typeContent}>
        {POST_TYPES.map(pt => {
          const active = activeType === pt.key;
          return (
            <TouchableOpacity key={pt.key} style={[styles.typeChip, active && styles.typeActive]} onPress={() => setActiveType(pt.key)}>
              <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{pt.label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreatePost')}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feed}>
        {filtered.map(post => {
          const isLiked = liked.includes(post.id);
          return (
            <TouchableOpacity key={post.id} style={styles.postCard} activeOpacity={0.95}
              onPress={() => navigation.navigate('PostDetail', { postId: post.id })}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="person-circle" size={36} color={colors.primary} />
                </View>
                <View style={styles.postMeta}>
                  <Text style={styles.farmerName}>{post.farmer}</Text>
                  <Text style={styles.farmerLoc}>{post.village}, {post.district} · {post.time}</Text>
                </View>
                {post.type === 'pest_alert' && <View style={styles.alertBadge}><Text style={styles.alertBadgeText}>⚠️ Alert</Text></View>}
                {post.type === 'success_story' && <View style={styles.storyBadge}><Text style={styles.storyBadgeText}>🌟 Story</Text></View>}
                {post.type === 'question' && <View style={styles.qBadge}><Text style={styles.qBadgeText}>❓ Q&A</Text></View>}
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)}>
                  <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={18} color={isLiked ? colors.danger : colors.textSecondary} />
                  <Text style={styles.actionText}>{post.likes + (isLiked ? 1 : 0)}</Text>
                </TouchableOpacity>
                <View style={styles.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.actionText}>{post.comments}</Text>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  typeScroll: { maxHeight: 48, marginBottom: spacing.sm },
  typeContent: { paddingHorizontal: spacing.md, alignItems: 'center', gap: spacing.sm },
  typeChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  typeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  typeLabelActive: { color: '#FFFFFF' },
  createBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  feed: { padding: spacing.md, paddingBottom: spacing.xxl },
  postCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { marginRight: spacing.sm },
  postMeta: { flex: 1 },
  farmerName: { fontSize: 14, fontWeight: '700', color: colors.text },
  farmerLoc: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  alertBadge: { backgroundColor: '#FEE2E2', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  alertBadgeText: { fontSize: 10, fontWeight: '700', color: colors.danger },
  storyBadge: { backgroundColor: '#FEF3C7', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  storyBadgeText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  qBadge: { backgroundColor: '#DBEAFE', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  qBadgeText: { fontSize: 10, fontWeight: '700', color: '#1E40AF' },
  postContent: { fontSize: 14, lineHeight: 20, color: colors.text, fontWeight: '500', marginBottom: spacing.md },
  postActions: { flexDirection: 'row', gap: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
});
