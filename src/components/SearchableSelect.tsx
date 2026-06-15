import { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Option { label: string; value: string }

interface Props {
  label: string;
  options: Option[] | string[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  icon?: string;
  searchPlaceholder?: string;
}

export default function SearchableSelect({ label, options, value, onSelect, placeholder = 'Select...', icon, searchPlaceholder = 'Search...' }: Props) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const normalizedOptions: Option[] = useMemo(() =>
    options.map(o => typeof o === 'string' ? { label: o, value: o } : o), [options]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    const q = search.toLowerCase();
    return normalizedOptions.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
  }, [search, normalizedOptions]);

  const selectedLabel = normalizedOptions.find(o => o.value === value)?.label;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.selector} onPress={() => { setSearch(''); setVisible(true); }} activeOpacity={0.7}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.selectorText, !selectedLabel && styles.placeholder]}>
          {selectedLabel || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              value={search} onChangeText={setSearch}
              placeholder={searchPlaceholder} placeholderTextColor={colors.textLight}
              autoFocus
            />
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {filtered.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.option, opt.value === value && styles.optionActive]}
                  onPress={() => { onSelect(opt.value); setVisible(false); }}
                >
                  <Text style={[styles.optionText, opt.value === value && styles.optionTextActive]}>{opt.label}</Text>
                  {opt.value === value && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              ))}
              {filtered.length === 0 && (
                <Text style={styles.noResults}>No results found</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.sm + 4 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginLeft: 4 },
  selector: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md - 2,
    borderWidth: 1, borderColor: colors.border,
  },
  icon: { fontSize: 16, marginRight: spacing.sm, opacity: 0.6 },
  selectorText: { flex: 1, fontSize: 15, color: colors.text },
  placeholder: { color: colors.textLight },
  arrow: { fontSize: 10, color: colors.textLight, marginLeft: spacing.sm },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    maxHeight: '80%', paddingBottom: spacing.xxl,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  closeBtn: { fontSize: 20, color: colors.textLight, padding: spacing.xs },
  searchInput: {
    margin: spacing.md, backgroundColor: colors.background, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  list: { paddingHorizontal: spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionActive: { backgroundColor: '#F0F8E8', borderRadius: radius.sm, paddingHorizontal: spacing.sm, marginHorizontal: -spacing.sm },
  optionText: { flex: 1, fontSize: 15, color: colors.text },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
  check: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  noResults: { textAlign: 'center', color: colors.textLight, paddingVertical: spacing.xl, fontSize: 14 },
});
