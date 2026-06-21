import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';
import { fetchSchemes } from '../../services/schemeService';
import { GovernmentScheme } from '../../types';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' as const },
  { id: 'crop_insurance', label: 'Crop Insurance', icon: 'shield-checkmark' as const },
  { id: 'irrigation', label: 'Irrigation', icon: 'water' as const },
  { id: 'equipment', label: 'Equipment', icon: 'cog' as const },
  { id: 'loans', label: 'Loans', icon: 'card' as const },
  { id: 'subsidies', label: 'Subsidies', icon: 'gift' as const },
  { id: 'state', label: 'State Schemes', icon: 'business' as const },
];

interface Props { navigation: any }

export default function GovernmentSchemesScreen({ navigation }: Props) {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    setLoading(true);
    const data = await fetchSchemes();
    setSchemes(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let list = activeCat === 'all' ? schemes : schemes.filter(s => s.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return list;
  }, [activeCat, search, schemes]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search schemes..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

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

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={40} color={colors.textLight} />
          <Text style={styles.emptyText}>No schemes found</Text>
        </View>
      ) : (
        filtered.map((scheme) => (
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
                <Text style={styles.schemeTagText}>{scheme.benefits}</Text>
              </View>
              <View style={styles.schemeMeta}>
                <Text style={styles.schemeEligibility}>{scheme.eligibility}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  loadingContainer: { paddingVertical: spacing.xxl * 2, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { paddingVertical: spacing.xxl * 2, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textLight, fontWeight: '500' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, paddingVertical: spacing.xs },
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
  schemeFooter: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.xs },
  schemeTag: { backgroundColor: colors.secondary, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'flex-start' },
  schemeTagText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },
  schemeMeta: { flexDirection: 'row', alignItems: 'center' },
  schemeEligibility: { fontSize: 10, color: colors.textLight, fontWeight: '500' },
});
