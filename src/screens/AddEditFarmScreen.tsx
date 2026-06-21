import { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { colors, radius, spacing } from '../theme';
import Button from '../components/Button';
import Loading from '../components/Loading';
import SearchableSelect from '../components/SearchableSelect';
import { COUNTRIES } from '../data/countries';
import { STATES_BY_COUNTRY } from '../data/states';
import { DISTRICTS_BY_STATE, VILLAGES_BY_DISTRICT } from '../data/districts';
import { SOIL_TYPES, WATER_SOURCES, LAND_AREA_UNITS, CROPS } from '../data/farming';

interface Props { navigation: any; route: any }

export default function AddEditFarmScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const farmId = route.params?.farmId;
  const [name, setName] = useState('');
  const [country, setCountry] = useState('IN');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [location, setLocation] = useState('');
  const [landArea, setLandArea] = useState('');
  const [landAreaUnit, setLandAreaUnit] = useState('Hectares');
  const [soilType, setSoilType] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [currentCrop, setCurrentCrop] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!farmId);

  useEffect(() => { if (farmId) fetchFarm(); }, [farmId]);

  const statesList = useMemo(() => STATES_BY_COUNTRY[country] || STATES_BY_COUNTRY.default || [], [country]);
  const districtsList = useMemo(() => DISTRICTS_BY_STATE[state] || DISTRICTS_BY_STATE.default || [], [state]);
  const villagesList = useMemo(() => VILLAGES_BY_DISTRICT[district] || VILLAGES_BY_DISTRICT.default || [], [district]);

  async function fetchFarm() {
    try {
      const { data, error } = await supabase.from('farms').select('*').eq('id', farmId).single();
      if (error) throw error;
      if (data) {
        setName(data.name); setCountry(data.country || 'IN'); setState(data.state || '');
        setDistrict(data.district || ''); setVillage(data.village || '');
        setLocation(data.location || '');
        setLandArea(String(data.land_area_value || ''));
        setLandAreaUnit(data.land_area_unit || 'Hectares');
        setSoilType(data.soil_type || ''); setWaterSource(data.water_source || '');
        setCurrentCrop(data.current_crop || ''); setNotes(data.notes || '');
      }
    } catch (err: any) { Alert.alert('Error', err.message); navigation.goBack(); }
    finally { setFetching(false); }
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Validation', 'Farm name is required'); return; }
    setLoading(true);
    const parsedLandArea = Number(landArea.trim()) || 0;
    const farmData = {
      user_id: user!.id, name: name.trim(), location: location.trim(),
      country, state: state, district, village,
      land_area_value: parsedLandArea, land_area_unit: landAreaUnit,
      soil_type: soilType, water_source: waterSource,
      current_crop: currentCrop, notes: notes.trim(),
    };
    try {
      if (farmId) {
        const { error } = await supabase.from('farms').update(farmData).eq('id', farmId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('farms').insert([farmData]);
        if (error) throw error;
      }
      navigation.goBack();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }

  if (fetching) return <Loading fullScreen />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{farmId ? 'Edit Farm' : 'Add New Farm'}</Text>
        <Text style={styles.subtitle}>Enter your farm details below</Text>

        <InputField label="Farm Name *" value={name} onChangeText={setName} placeholder="Green Valley Farm" />
        <SearchableSelect label="Country" options={COUNTRIES.map(c => ({ label: `${c.name} (${c.dialCode})`, value: c.code }))} value={country} onSelect={setCountry} icon="🌍" />
        <SearchableSelect label="State" options={statesList} value={state} onSelect={(v) => { setState(v); setDistrict(''); setVillage(''); }} icon="🗺️" />
        <SearchableSelect label="District" options={districtsList} value={district} onSelect={(v) => { setDistrict(v); setVillage(''); }} icon="🏛️" />
        <SearchableSelect label="Village" options={villagesList} value={village} onSelect={setVillage} icon="🏘️" />
        <InputField label="Location (broader area)" value={location} onChangeText={setLocation} placeholder="Near NH-65, Sangareddy" />
        <InputField label="Land Area" value={landArea} onChangeText={setLandArea} placeholder="e.g. 5.5" keyboardType="decimal-pad" />
        <SearchableSelect label="Land Area Unit" options={LAND_AREA_UNITS} value={landAreaUnit} onSelect={setLandAreaUnit} icon="📐" />
        <SearchableSelect label="Soil Type" options={SOIL_TYPES} value={soilType} onSelect={setSoilType} icon="🌱" />
        <SearchableSelect label="Water Source" options={WATER_SOURCES} value={waterSource} onSelect={setWaterSource} icon="💧" />
        <SearchableSelect label="Current Crop" options={CROPS} value={currentCrop} onSelect={setCurrentCrop} icon="🌾" />
        <InputField label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional notes..." multiline style={styles.multiline} />

        <View style={styles.buttons}>
          <Button title={farmId ? 'Update Farm' : 'Save Farm'} onPress={handleSave} loading={loading} size="lg" />
          <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  input: {
    backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  buttons: { marginTop: spacing.md, gap: spacing.sm },
});
