import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, typography } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { signOut } from '../services/authService';
import { Alert } from 'react-native';

interface Props { navigation: any }

const SECTIONS = [
  {
    title: 'Finance',
    items: [
      { icon: 'wallet-outline', label: 'Financial Summary', color: '#3BA55D', screen: 'FinanceDashboard' },
      { icon: 'trending-up-outline', label: 'Income', color: '#3B82F6', screen: 'IncomeList' },
      { icon: 'trending-down-outline', label: 'Expenses', color: '#F59E0B', screen: 'ExpenseList' },
      { icon: 'swap-horizontal-outline', label: 'Transactions', color: '#8B5CF6', screen: 'TransactionHistory' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help & FAQ', color: colors.primary, screen: undefined },
      { icon: 'chatbubble-outline', label: 'Contact Us', color: '#3B82F6', screen: undefined },
      { icon: 'document-text-outline', label: 'Privacy Policy', color: '#64748B', screen: undefined },
    ],
  },
];

export default function MoreScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useLanguage();
  const m = user?.user_metadata || {};

  function handleNav(screen?: string) {
    if (!screen) return;
    navigation.navigate(screen);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('ProfileMain')}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle" size={48} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{m.full_name || 'Farmer'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </TouchableOpacity>

        {SECTIONS.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity key={ii} style={[styles.row, ii < section.items.length - 1 && styles.rowBorder]} onPress={() => handleNav(item.screen)}>
                  <View style={[styles.rowIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer}>Boer v1.0 · Made for Farmers</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg, ...shadows.sm },
  avatar: { marginRight: spacing.md },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700', color: colors.text },
  profileEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginLeft: spacing.xs },
  sectionCard: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadows.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 11, color: colors.textLight, marginTop: spacing.xl, marginBottom: spacing.md },
});
