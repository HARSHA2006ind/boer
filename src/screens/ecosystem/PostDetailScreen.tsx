import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const COMMENTS = [
  { id: '1', farmer: 'Suresh Reddy', text: 'Apply neem oil 5% solution. It works great for this!', time: '1h ago', likes: 8 },
  { id: '2', farmer: 'Mohan Rao', text: 'I had the same issue last month. Used copper fungicide and it cleared up in a week.', time: '3h ago', likes: 5 },
  { id: '3', farmer: 'Kavita Sharma', text: 'Remove affected leaves first. Then spray Bordeaux mixture 1%.', time: '5h ago', likes: 12 },
];

interface Props { navigation: any; route: any }

export default function PostDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);

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
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <Ionicons name="person-circle" size={40} color={colors.primary} />
            <View style={styles.postMeta}>
              <Text style={styles.farmerName}>Lakshmi Devi</Text>
              <Text style={styles.farmerLoc}>Guntur, Guntur · 4h ago</Text>
            </View>
          </View>
          <Text style={styles.postContent}>My tomato plants have yellow spots on leaves. What should I apply? 📸</Text>

          <View style={styles.postStats}>
            <TouchableOpacity style={styles.statBtn} onPress={() => setLiked(!liked)}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? colors.danger : colors.textSecondary} />
              <Text style={styles.statText}>{liked ? 16 : 15}</Text>
            </TouchableOpacity>
            <View style={styles.statBtn}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>12</Text>
            </View>
            <TouchableOpacity style={styles.statBtn}>
              <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.commentHeader}>Answers ({COMMENTS.length})</Text>

        {COMMENTS.map(c => (
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
        <TouchableOpacity style={[styles.sendBtn, !comment.trim() && styles.sendDisabled]} disabled={!comment.trim()}>
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
