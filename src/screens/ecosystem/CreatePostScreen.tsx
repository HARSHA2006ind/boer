import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const POST_TYPES = [
  { key: 'text', icon: 'document-text', label: 'Post' },
  { key: 'question', icon: 'help-circle', label: 'Question' },
  { key: 'success_story', icon: 'star', label: 'Success Story' },
  { key: 'pest_alert', icon: 'warning', label: 'Pest Alert' },
  { key: 'tip', icon: 'bulb', label: 'Tip' },
] as const;

interface Props { navigation: any }

export default function CreatePostScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');

  const handleSubmit = () => {
    if (!content.trim()) { Alert.alert('Please write something'); return; }
    Alert.alert('Posted!', 'Your post has been shared with the community.');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity style={[styles.postBtn, !content.trim() && styles.postBtnDisabled]} onPress={handleSubmit} disabled={!content.trim()}>
          <Text style={styles.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Post Type</Text>
        <View style={styles.typeRow}>
          {POST_TYPES.map(pt => {
            const active = postType === pt.key;
            return (
              <TouchableOpacity key={pt.key} style={[styles.typeChip, active && styles.typeActive]} onPress={() => setPostType(pt.key)}>
                <Ionicons name={pt.icon as any} size={14} color={active ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{pt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput style={styles.contentInput} multiline placeholder="Share your farming experience, ask a question, or report an issue..."
          placeholderTextColor={colors.textLight} value={content} onChangeText={setContent}
          textAlignVertical="top" />

        <View style={styles.attachRow}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="camera-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.attachText}>Add Photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  postBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  postBtnDisabled: { backgroundColor: colors.textLight },
  postBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  content: { padding: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  typeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  typeLabelActive: { color: '#FFFFFF' },
  contentInput: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, fontSize: 15, color: colors.text, minHeight: 160, borderWidth: 1, borderColor: colors.border, lineHeight: 22 },
  attachRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  attachBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  attachText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
});
