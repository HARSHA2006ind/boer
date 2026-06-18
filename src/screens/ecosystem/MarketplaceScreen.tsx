import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'seeds', label: 'Seeds', icon: 'leaf' },
  { key: 'fertilizers', label: 'Fertilizers', icon: 'flask' },
  { key: 'pesticides', label: 'Pesticides', icon: 'bug' },
  { key: 'equipment', label: 'Equipment', icon: 'cog' },
  { key: 'irrigation', label: 'Irrigation', icon: 'water' },
];

const PRODUCTS = [
  { id: 'p1', category: 'seeds', name: 'Hybrid Cotton Seeds', desc: 'High-yield BT cotton, 450g pack', price: 850, seller: 'Agro Seeds Co.', location: 'Hyderabad' },
  { id: 'p2', category: 'seeds', name: 'Sona Masoori Paddy Seeds', desc: 'Premium quality, 10kg bag', price: 1200, seller: 'Rice Growers Ltd.', location: 'Sangareddy' },
  { id: 'p3', category: 'fertilizers', name: 'NPK 10-26-26', desc: 'Balanced fertilizer, 50kg bag', price: 950, seller: 'Fertilizers India', location: 'Hyderabad' },
  { id: 'p4', category: 'fertilizers', name: 'Urea (46% N)', desc: 'Nitrogen fertilizer, 50kg bag', price: 550, seller: 'Fertilizers India', location: 'Hyderabad' },
  { id: 'p5', category: 'pesticides', name: 'Neem Oil 5% Spray', desc: 'Organic pesticide, 1L bottle', price: 350, seller: 'Organic Solutions', location: 'Pune' },
  { id: 'p6', category: 'pesticides', name: 'Imidacloprid 17.8% SL', desc: 'Systemic insecticide, 100ml', price: 280, seller: 'Crop Care Ltd.', location: 'Mumbai' },
  { id: 'p7', category: 'equipment', name: 'Power Tiller (8 HP)', desc: 'Compact tiller for small farms', price: 45000, seller: 'Farm Machinery Co.', location: 'Rajkot' },
  { id: 'p8', category: 'equipment', name: 'Manual Seed Drill', desc: 'Hand-operated, 5-row', price: 3200, seller: 'Agri Tools Ltd.', location: 'Ludhiana' },
  { id: 'p9', category: 'irrigation', name: 'Drip Kit (1 Acre)', desc: 'Complete drip system for 1 acre', price: 8500, seller: 'Drip Tech India', location: 'Bengaluru' },
  { id: 'p10', category: 'irrigation', name: 'Sprinkler Set (1/2 Acre)', desc: 'Portable sprinkler system', price: 4500, seller: 'Water Solutions', location: 'Chennai' },
];

export default function MarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [saved, setSaved] = useState<string[]>([]);

  const filtered = PRODUCTS.filter(p => {
    if (activeCat !== 'all' && p.category !== activeCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSave = (id: string) => setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="Search products..." placeholderTextColor={colors.textLight}
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
        <View style={styles.futureBanner}>
          <Ionicons name="time-outline" size={20} color="#92400E" />
          <Text style={styles.futureText}>Online ordering coming soon. Browse and save products for later.</Text>
        </View>

        {filtered.map(p => {
          const isSaved = saved.includes(p.id);
          return (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.placeholderImg}>
                  <Ionicons name="cube-outline" size={28} color={colors.textLight} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.prodName}>{p.name}</Text>
                  <Text style={styles.prodDesc}>{p.desc}</Text>
                  <Text style={styles.prodSeller}>{p.seller} · {p.location}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleSave(p.id)}>
                  <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.prodPrice}>₹{p.price.toLocaleString('en-IN')}</Text>
                <TouchableOpacity style={styles.contactBtn}>
                  <Ionicons name="call-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.contactText}>Contact Seller</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  futureBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#FFFBEB', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#FDE68A' },
  futureText: { fontSize: 12, color: '#92400E', fontWeight: '500', flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', gap: spacing.md },
  placeholderImg: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  prodName: { fontSize: 14, fontWeight: '700', color: colors.text },
  prodDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  prodSeller: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  prodPrice: { fontSize: 18, fontWeight: '800', color: colors.primary },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  contactText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});
