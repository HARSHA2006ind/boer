import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';
import { supabase } from '../../services/supabase';
import { CommunityPost } from '../../types';

interface Props { navigation: any; route: any }

interface Comment { id: string; farmer: string; text: string; time: string; likes: number; }

export default function PostDetailScreen({ navigation, route }: Props) {
  const { postId } = route.params;
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, []);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase.from('community_posts').select('*').eq('id', postId).single();
      if (!error && data) {
        setPost({
          id: data.id, user_id: data.user_id || '', content: data.content || '', image_urls: data.image_urls || [],
          post_type: data.post_type || 'text', farmer_name: data.farmer_name || '', village: data.village || '',
          district: data.district || '', likes_count: data.likes_count || 0, comments_count: data.comments_count || 0,
          created_at: data.created_at || new Date().toISOString(),
        });
      }
    } catch {}
    try {
      const { data } = await supabase.from('community_comments').select('*, farmer_name').eq('post_id', postId).order('created_at', { ascending: false }).limit(20);
      if (data) {
        setComments(data.map((c: any) => ({
          id: c.id, farmer: c.farmer_name || 'Farmer', text: c.content || '',
          time: getTimeAgo(c.created_at), likes: c.likes_count || 0,
        })));
      }
    } catch {
      setComments([
        { id: '1', farmer: 'Suresh Reddy', text: 'Apply neem oil 5% solution. It works great for this!', time: '1h ago', likes: 8 },
        { id: '2', farmer: 'Mohan Rao', text: 'I had the same issue last month. Used copper fungicide and it cleared up in a week.', time: '3h ago', likes: 5 },
        { id: '3', farmer: 'Kavita Sharma', text: 'Remove affected leaves first. Then spray Bordeaux mixture 1%.', time: '5h ago', likes: 12 },
      ]);
    }
    setLoading(false);
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('community_comments').insert({
        post_id: postId, user_id: user?.id || '', content: comment.trim(),
        farmer_name: user?.user_metadata?.full_name || user?.email || 'Farmer',
        created_at: new Date().toISOString(),
      });
      setComments([{ id: Date.now().toString(), farmer: user?.user_metadata?.full_name || 'You', text: comment.trim(), time: 'now', likes: 0 }, ...comments]);
      setComment('');
    } catch {}
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {post && (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <Ionicons name="person-circle" size={40} color={colors.primary} />
              <View style={styles.postMeta}>
                <Text style={styles.farmerName}>{post.farmer_name || 'Farmer'}</Text>
                <Text style={styles.farmerLoc}>{post.village ? `${post.village}, ${post.district}` : post.district} · {getTimeAgo(post.created_at)}</Text>
              </View>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>

            <View style={styles.postStats}>
              <TouchableOpacity style={styles.statBtn} onPress={() => setLiked(!liked)}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? colors.danger : colors.textSecondary} />
                <Text style={styles.statText}>{post.likes_count + (liked ? 1 : 0)}</Text>
              </TouchableOpacity>
              <View style={styles.statBtn}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.statText}>{post.comments_count}</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.commentHeader}>Answers ({comments.length})</Text>

        {comments.map(c => (
          <View key={c.id} style={styles.commentCard}>
            <View style={styles.commentHeaderRow}>
              <Ionicons name="person-circle" size={28} color={colors.textLight} />
              <View style={styles.commentMeta}>
                <Text style={styles.commentFarmer}>{c.farmer}</Text>
                <Text style={styles.commentTime}>{c.time}</Text>
              </View>
            </View>
            <Text style={styles.commentText}>{c.text}</Text>
            <View style={styles.commentActions}>
              <TouchableOpacity style={styles.commentAction}>
                <Ionicons name="arrow-up-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.commentActionText}>{c.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commentAction}>
                <Ionicons name="chatbubble-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.commentActionText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput style={styles.input} value={comment} onChangeText={setComment} placeholder="Write an answer..."
          placeholderTextColor={colors.textLight} />
        <TouchableOpacity style={[styles.sendBtn, !comment.trim() && styles.sendDisabled]} disabled={!comment.trim()} onPress={handleAddComment}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  postCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  postMeta: { marginLeft: spacing.sm },
  farmerName: { fontSize: 14, fontWeight: '700', color: colors.text },
  farmerLoc: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  postContent: { fontSize: 14, lineHeight: 20, color: colors.text, fontWeight: '500', marginBottom: spacing.md },
  postStats: { flexDirection: 'row', gap: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  statBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  commentHeader: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  commentCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  commentHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  commentMeta: { marginLeft: spacing.sm },
  commentFarmer: { fontSize: 13, fontWeight: '700', color: colors.text },
  commentTime: { fontSize: 10, color: colors.textLight },
  commentText: { fontSize: 13, lineHeight: 18, color: colors.text, fontWeight: '500', marginBottom: spacing.sm },
  commentActions: { flexDirection: 'row', gap: spacing.md },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  commentActionText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.secondary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 14, color: colors.text },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendDisabled: { backgroundColor: colors.textLight },
});
