import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';
import { fetchCommunityFeed } from '../../services/communityService';
import { CommunityPost } from '../../types';

const { width } = Dimensions.get('window');

const POST_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'text', label: 'Posts' },
  { key: 'question', label: 'Q&A' },
  { key: 'success_story', label: 'Stories' },
  { key: 'pest_alert', label: 'Alerts' },
  { key: 'tip', label: 'Tips' },
];

interface Props { navigation: any }

export default function CommunityFeedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeType, setActiveType] = useState('all');
  const [liked, setLiked] = useState<string[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const data = await fetchCommunityFeed(activeType);
    setPosts(data);
    setLoading(false);
  }, [activeType]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadPosts);
    return unsubscribe;
  }, [navigation, loadPosts]);

  const filtered = posts;

  const toggleLike = (id: string) => {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getBadge = (type: string) => {
    if (type === 'pest_alert') return <View style={styles.alertBadge}><Text style={styles.alertBadgeText}>Alert</Text></View>;
    if (type === 'success_story') return <View style={styles.storyBadge}><Text style={styles.storyBadgeText}>Story</Text></View>;
    if (type === 'question') return <View style={styles.qBadge}><Text style={styles.qBadgeText}>Q&A</Text></View>;
    if (type === 'tip') return <View style={styles.tipBadge}><Text style={styles.tipBadgeText}>Tip</Text></View>;
    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.feed, { paddingBottom: insets.bottom + spacing.xxl }]}>
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
                    <Text style={styles.farmerName}>{post.farmer_name || 'Farmer'}</Text>
                    <Text style={styles.farmerLoc}>{post.village ? `${post.village}, ${post.district}` : post.district} · {getTimeAgo(post.created_at)}</Text>
                  </View>
                  {getBadge(post.post_type)}
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)}>
                    <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={18} color={isLiked ? colors.danger : colors.textSecondary} />
                    <Text style={styles.actionText}>{post.likes_count + (isLiked ? 1 : 0)}</Text>
                  </TouchableOpacity>
                  <View style={styles.actionBtn}>
                    <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.actionText}>{post.comments_count}</Text>
                  </View>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  tipBadge: { backgroundColor: '#D1FAE5', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  tipBadgeText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  postContent: { fontSize: 14, lineHeight: 20, color: colors.text, fontWeight: '500', marginBottom: spacing.md },
  postActions: { flexDirection: 'row', gap: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
});
