import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const MOCK_SCHEMES: Record<string, any> = {
  '1': { name: 'PM-KISAN Samman Nidhi', description: 'Income support of ₹6,000/year to all landholding farmers.', benefits: '₹6,000 per year in 3 equal installments of ₹2,000 each. Direct bank transfer to Aadhaar-linked accounts.', eligibility: 'All landholding farmer families with cultivable land. Family includes husband, wife, and minor children.', website: 'https://pmkisan.gov.in', process: '1. Visit pmkisan.gov.in\n2. Register through CSC or agriculture department\n3. Provide Aadhaar and land records\n4. Link bank account to Aadhaar\n5. Receive installment directly', documents: 'Aadhaar Card, Land Records, Bank Account Details, Passport Size Photo' },
};

const SECTIONS = [
  { icon: 'information-circle', label: 'Description', color: '#3B82F6' },
  { icon: 'gift', label: 'Benefits', color: '#3BA55D' },
  { icon: 'people', label: 'Eligibility', color: '#F59E0B' },
  { icon: 'globe', label: 'Website', color: '#8B5CF6' },
  { icon: 'list', label: 'Application Process', color: colors.primary },
  { icon: 'document-text', label: 'Required Documents', color: '#EC4899' },
];

interface Props { navigation: any; route: any }

export default function SchemeDetailScreen({ navigation, route }: Props) {
  const { schemeId } = route.params;
  const insets = useSafeAreaInsets();
  const scheme = MOCK_SCHEMES[schemeId] || MOCK_SCHEMES['1'];

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
          { icon: 'list', label: 'Application Process', content: scheme.process, color: colors.primary },
          { icon: 'document-text', label: 'Required Documents', content: scheme.documents, color: '#EC4899' },
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

        <TouchableOpacity style={styles.websiteBtn} onPress={() => scheme.website && Linking.openURL(scheme.website)}>
          <Ionicons name="globe" size={18} color="#FFFFFF" />
          <Text style={styles.websiteText}>Visit Official Website</Text>
        </TouchableOpacity>
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
