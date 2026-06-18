import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';
import { useLanguage } from '../../i18n/LanguageContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' as const },
  { id: 'pm_kisan', label: 'PM-KISAN', icon: 'leaf' as const },
  { id: 'insurance', label: 'Crop Insurance', icon: 'shield-checkmark' as const },
  { id: 'fertilizer', label: 'Fertilizer Subsidy', icon: 'flask' as const },
  { id: 'irrigation', label: 'Irrigation Subsidy', icon: 'water' as const },
  { id: 'equipment', label: 'Equipment Support', icon: 'cog' as const },
  { id: 'state', label: 'State Schemes', icon: 'business' as const },
  { id: 'organic', label: 'Organic Farming', icon: 'leaf' as const },
];

const SCHEMES = [
  { id: '1', category: 'pm_kisan', name: 'PM-KISAN Samman Nidhi', description: 'Income support of ₹6,000/year to all landholding farmers.', benefits: '₹6,000 per year in 3 installments', eligibility: 'All landholding farmers', website: 'https://pmkisan.gov.in', process: 'Apply online or through CSC centers with Aadhaar and land records.' },
  { id: '2', category: 'insurance', name: 'PM Fasal Bima Yojana', description: 'Comprehensive crop insurance covering all stages of crop cycle.', benefits: 'Coverage against natural calamities, pests, diseases', eligibility: 'All farmers growing notified crops', website: 'https://pmfby.gov.in', process: 'Enroll through bank branches before the cutoff date.' },
  { id: '3', category: 'fertilizer', name: 'Nutrient Based Subsidy', description: 'Subsidy on P&K fertilizers to ensure availability at affordable prices.', benefits: 'Fixed subsidy per kg on nutrients', eligibility: 'All farmers', website: 'https://fert.nic.in', process: 'Subsidy is reflected in MRP at point of sale.' },
  { id: '4', category: 'irrigation', name: 'PM Krishi Sinchayee Yojana', description: 'Harness every drop of water through efficient irrigation systems.', benefits: '50-70% subsidy on drip/sprinkler systems', eligibility: 'All farmers with cultivable land', website: 'https://pmksy.gov.in', process: 'Apply through state agriculture department.' },
  { id: '5', category: 'equipment', name: 'SMAM - Farm Mechanization', description: 'Subsidized farm machinery and equipment for small farmers.', benefits: 'Up to 50% subsidy on tractors, power tillers, harvesters', eligibility: 'Small and marginal farmers', website: 'https://agriwelfare.gov.in', process: 'Submit application to district agriculture office.' },
  { id: '6', category: 'state', name: 'Rythu Bandhu Scheme (Telangana)', description: 'Investment support for farmers in Telangana state.', benefits: '₹10,000 per acre per year', eligibility: 'All farmers in Telangana', website: 'https://telangana.gov.in', process: 'Automatic disbursement based on land records.' },
  { id: '7', category: 'organic', name: 'PKVY - Organic Farming', description: 'Promotion of organic farming through cluster approach.', benefits: '₹50,000/ha for 3 years', eligibility: 'Groups of farmers forming clusters', website: 'https://pgsindia-ncof.gov.in', process: 'Apply through state agriculture department.' },
  { id: '8', category: 'insurance', name: 'Weather Based Crop Insurance', description: 'Insurance based on weather parameters like rainfall, temperature.', benefits: 'Automatic claim settlement based on weather data', eligibility: 'All farmers', website: 'https://pmfby.gov.in', process: 'Enroll before season cutoff dates.' },
  { id: '9', category: 'pm_kisan', name: 'Kisan Credit Card (KCC)', description: 'Short-term loan facility for farmers at subsidized interest rates.', benefits: 'Up to ₹3 lakh at 7% interest', eligibility: 'All farmers', website: 'https://pmkisan.gov.in', process: 'Apply at any nationalized bank with land documents.' },
  { id: '10', category: 'equipment', name: 'Kisan drone subsidy', description: 'Subsidy for drone-based agricultural operations.', benefits: 'Up to 50% subsidy on agricultural drones', eligibility: 'Farmers and FPOs', website: 'https://agriwelfare.gov.in', process: 'Apply through state agriculture department.' },
  { id: '11', category: 'fertilizer', name: 'Soil Health Card Scheme', description: 'Free soil testing and customized fertilizer recommendations.', benefits: 'Free soil testing every 2 years', eligibility: 'All farmers', website: 'https://soilhealth.dac.gov.in', process: 'Visit nearest soil testing lab with soil sample.' },
  { id: '12', category: 'state', name: 'Rythu Bharosa (Andhra)', description: 'Investment support for farmers in Andhra Pradesh.', benefits: '₹13,500 per year per family', eligibility: 'All farmers in Andhra Pradesh', website: 'https://ap.gov.in', process: 'Automatic based on land records.' },
];

interface Props { navigation: any }

export default function GovernmentSchemesScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [activeCat, setActiveCat] = useState('all');

  const filtered = activeCat === 'all' ? SCHEMES : SCHEMES.filter(s => s.category === activeCat);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map(cat => {
          const active = activeCat === cat.id;
          return (
            <TouchableOpacity key={cat.id} style={[styles.catChip, active && styles.catActive]} onPress={() => setActiveCat(cat.id)}>
              <Ionicons name={cat.icon} size={14} color={active ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filtered.map((scheme) => (
        <TouchableOpacity key={scheme.id} style={styles.schemeCard} activeOpacity={0.7}
          onPress={() => navigation.navigate('SchemeDetail', { schemeId: scheme.id })}>
          <View style={styles.schemeHeader}>
            <View style={styles.schemeIcon}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            </View>
            <View style={styles.schemeInfo}>
              <Text style={styles.schemeName}>{scheme.name}</Text>
              <Text style={styles.schemeDesc}>{scheme.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </View>
          <View style={styles.schemeFooter}>
            <View style={styles.schemeTag}>
              <Text style={styles.schemeTagText}>{scheme.benefits.substring(0, 30)}...</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  catScroll: { marginBottom: spacing.md },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  catLabelActive: { color: '#FFFFFF' },
  schemeCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  schemeHeader: { flexDirection: 'row', alignItems: 'center' },
  schemeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  schemeInfo: { flex: 1 },
  schemeName: { fontSize: 15, fontWeight: '700', color: colors.text },
  schemeDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 17 },
  schemeFooter: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  schemeTag: { backgroundColor: colors.secondary, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'flex-start' },
  schemeTagText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },
});
