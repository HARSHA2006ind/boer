import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { getCrop, createCrop, updateCrop } from '../services/cropService';
import { colors, radius, spacing } from '../theme';
import Button from '../components/Button';
import Loading from '../components/Loading';
import SearchableSelect from '../components/SearchableSelect';
import { CROPS, CROP_SEASONS, LAND_AREA_UNITS, GROWTH_STAGES } from '../data/farming';
import { useLanguage } from '../i18n/LanguageContext';

interface Props { navigation: any; route: any }

export default function CropFormScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { farmId, cropId } = route.params || {};
  const [cropName, setCropName] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [season, setSeason] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [areaAllocated, setAreaAllocated] = useState('');
  const [areaUnit, setAreaUnit] = useState('Hectares');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!cropId);

  useEffect(() => { if (cropId) load(); else setFetching(false); }, [cropId]);

  async function load() {
    try { const d = await getCrop(cropId); setCropName(d.crop_name); setSowingDate(d.sowing_date || ''); setHarvestDate(d.expected_harvest_date || ''); setSeason(d.season || ''); setGrowthStage(d.growth_stage || ''); setAreaAllocated(String(d.area_allocated || '')); setAreaUnit(d.area_unit || 'Hectares'); setNotes(d.notes || ''); }
    catch (err: any) { Alert.alert('Error', err.message); navigation.goBack(); }
    finally { setFetching(false); }
  }

  async function handleSave() {
    if (!cropName.trim()) { Alert.alert('Validation', `${t('crop.name')} ${t('common.required')}`); return; }
    setLoading(true);
    const payload = { user_id: user!.id, farm_id: farmId, crop_name: cropName.trim(), sowing_date: sowingDate, expected_harvest_date: harvestDate, season: season.trim(), growth_stage: growthStage.trim(), area_allocated: Number(areaAllocated) || 0, area_unit: areaUnit, notes: notes.trim() };
    try { if (cropId) await updateCrop(cropId, payload); else await createCrop(payload); navigation.goBack(); }
    catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }

  if (fetching) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{cropId ? t('crop.edit') : t('crop.add')}</Text>
      <SearchableSelect label={`${t('crop.name')} *`} options={CROPS} value={cropName} onSelect={setCropName} icon="🌾" searchPlaceholder={t('common.search')} />
      <InputField label={t('crop.sowingDate')} value={sowingDate} onChangeText={setSowingDate} placeholder="YYYY-MM-DD" />
      <InputField label={t('crop.harvestDate')} value={harvestDate} onChangeText={setHarvestDate} placeholder="YYYY-MM-DD" />
      <SearchableSelect label={t('crop.season')} options={CROP_SEASONS} value={season} onSelect={setSeason} icon="☀️" />
      <SearchableSelect label={t('crop.growthStage')} options={GROWTH_STAGES} value={growthStage} onSelect={setGrowthStage} icon="🌱" />
      <InputField label={t('crop.areaAllocated')} value={areaAllocated} onChangeText={setAreaAllocated} placeholder="e.g. 2.5" keyboardType="decimal-pad" />
      <SearchableSelect label={t('crop.areaUnit')} options={LAND_AREA_UNITS} value={areaUnit} onSelect={setAreaUnit} icon="📐" />
      <InputField label={t('crop.notes')} value={notes} onChangeText={setNotes} placeholder="Any notes..." multiline style={styles.multiline} />
      <View style={styles.buttons}>
        <Button title={cropId ? t('crop.update') : t('crop.save')} onPress={handleSave} loading={loading} size="lg" />
        <Button title={t('common.cancel')} variant="outline" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

function InputField(props: any) {
  return (
    <View style={fieldStyles.group}>
      {props.label && <Text style={fieldStyles.label}>{props.label}</Text>}
      <TextInput style={[fieldStyles.input, props.multiline && fieldStyles.multiline]} placeholderTextColor={colors.textLight} {...props} />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: { marginBottom: spacing.sm + 4 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginLeft: 4 },
  input: { backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md - 2, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  buttons: { marginTop: spacing.md, gap: spacing.sm },
});
