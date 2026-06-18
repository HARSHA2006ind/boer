import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'people' },
  { key: 'farmer', label: 'Farmers', icon: 'person' },
  { key: 'expert', label: 'Experts', icon: 'school' },
  { key: 'officer', label: 'Officers', icon: 'business' },
  { key: 'vendor', label: 'Vendors', icon: 'storefront' },
];

const PEOPLE = [
  { id: 'f1', name: 'Ramesh Kumar', village: 'Sangareddy', district: 'Sangareddy', state: 'Telangana', category: 'farmer', bio: 'Cotton and paddy farmer, 15 years experience', crops: ['Cotton', 'Paddy'] },
  { id: 'f2', name: 'Dr. Venkatesh Rao', village: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', category: 'expert', bio: 'Agricultural scientist specializing in pest management', crops: [] },
  { id: 'f3', name: 'Smt. Lakshmi Devi', village: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', category: 'farmer', bio: 'Organic vegetable farmer, 8 years experience', crops: ['Tomato', 'Chilli', 'Brinjal'] },
  { id: 'f4', name: 'Shri. Surya Prakash', village: 'Warangal', district: 'Warangal', state: 'Telangana', category: 'officer', bio: 'District Agriculture Officer, Warangal', crops: [] },
  { id: 'f5', name: 'Anjali Reddy', village: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', category: 'farmer', bio: 'Groundnut and sunflower farmer', crops: ['Groundnut', 'Sunflower'] },
  { id: 'f6', name: 'Krishna Seeds Co.', village: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', category: 'vendor', bio: 'Certified seed dealer since 2005', crops: [] },
  { id: 'f7', name: 'Dr. Priya Sharma', village: 'Nashik', district: 'Nashik', state: 'Maharashtra', category: 'expert', bio: 'Soil health and irrigation specialist', crops: [] },
  { id: 'f8', name: 'Nagarjuna Fertilizers', village: 'Vijayawada', district: 'Vijayawada', state: 'Andhra Pradesh', category: 'vendor', bio: 'Fertilizer and pesticide supplier', crops: [] },
];

const CATEGORY_ICONS: Record<string, string> = { farmer: 'person', expert: 'school', officer: 'business', vendor: 'storefront' };

export default function FarmerDirectoryScreen() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const filtered = PEOPLE.filter(p => {
    if (activeCat !== 'all' && p.category !== activeCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.village.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="Search farmers, experts, vendors..." placeholderTextColor={colors.textLight}
        value={search} onChangeText={setSearch} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map(cat => {
          const active = activeCat === cat.key;
          return (
            <TouchableOpacity key={cat.key} style={[styles.catChip, active && styles.catActive]} onPress={() => setActiveCat(cat.key)}>
              <Ionicons name={cat.icon as any} size={14} color={active ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map(p => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: p.category === 'expert' ? '#DBEAFE' : p.category === 'officer' ? '#FEF3C7' : p.category === 'vendor' ? '#F3E8FF' : '#E8F5E9' }]}>
                <Ionicons name={CATEGORY_ICONS[p.category] as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.location}>{p.village}, {p.district}, {p.state}</Text>
                <Text style={styles.bio}>{p.bio}</Text>
                {p.crops.length > 0 && (
                  <View style={styles.cropRow}>
                    {p.crops.map((c, i) => <View key={i} style={styles.cropTag}><Text style={styles.cropTagText}>{c}</Text></View>)}
                  </View>
                )}
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{p.category.charAt(0).toUpperCase() + p.category.slice(1)}</Text>
              </View>
              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.primary} />
                <Text style={styles.contactText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  search: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  catScroll: { marginBottom: spacing.md },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  catLabelActive: { color: '#FFFFFF' },
  list: { paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', gap: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  location: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  bio: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 16 },
  cropRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  cropTag: { backgroundColor: colors.primaryLight, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  cropTagText: { fontSize: 9, color: colors.primaryDark, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  catBadge: { backgroundColor: colors.secondary, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  catBadgeText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary },
  contactText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
});
