import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';
import { fetchSchemeById } from '../../services/schemeService';
import { GovernmentScheme } from '../../types';

interface Props { navigation: any; route: any }

export default function SchemeDetailScreen({ navigation, route }: Props) {
  const { schemeId } = route.params;
  const insets = useSafeAreaInsets();
  const [scheme, setScheme] = useState<GovernmentScheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheme();
  }, []);

  const loadScheme = async () => {
    const data = await fetchSchemeById(schemeId);
    setScheme(data || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!scheme) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textLight }}>Scheme not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scheme Details</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.titleCard}>
          <View style={styles.titleIcon}>
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>{scheme.name}</Text>
          <Text style={styles.desc}>{scheme.description}</Text>
        </View>

        <TouchableOpacity style={[styles.card, styles.aiCard]} onPress={() => navigation.navigate('AIChat')}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.aiTitle}>Ask AI about this scheme</Text>
          </View>
          <Text style={styles.aiSub}>Get simple farmer-friendly explanation</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} style={{ position: 'absolute', right: spacing.md, top: '50%' }} />
        </TouchableOpacity>

        {[
          { icon: 'information-circle', label: 'Description', content: scheme.description, color: '#3B82F6' },
          { icon: 'gift', label: 'Benefits', content: scheme.benefits, color: '#3BA55D' },
          { icon: 'people', label: 'Eligibility', content: scheme.eligibility, color: '#F59E0B' },
          { icon: 'list', label: 'Application Process', content: scheme.application_process, color: colors.primary },
        ].map((section, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: section.color + '15' }]}>
                <Ionicons name={section.icon as any} size={18} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.label}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {scheme.website_url ? (
          <TouchableOpacity style={styles.websiteBtn} onPress={() => Linking.openURL(scheme.website_url!)}>
            <Ionicons name="globe" size={18} color="#FFFFFF" />
            <Text style={styles.websiteText}>Visit Official Website</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  titleCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.md, ...shadows.sm },
  titleIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  desc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, lineHeight: 18 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  aiCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  aiSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2, marginLeft: spacing.lg + spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  sectionIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  sectionContent: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, paddingLeft: spacing.md + 36 + spacing.md },
  websiteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm },
  websiteText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
