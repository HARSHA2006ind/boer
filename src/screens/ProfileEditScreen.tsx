import { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, LANGUAGES as I18N_LANGUAGES } from '../i18n/LanguageContext';
import { supabase } from '../services/supabase';
import { colors, radius, spacing } from '../theme';
import Button from '../components/Button';
import SearchableSelect from '../components/SearchableSelect';
import { COUNTRIES } from '../data/countries';
import { STATES_BY_COUNTRY } from '../data/states';
import { DISTRICTS_BY_STATE, VILLAGES_BY_DISTRICT } from '../data/districts';
import { LANGUAGES } from '../data/languages';

const LANGUAGE_MAP: Record<string, string> = {
  'English': 'en', 'Tamil': 'ta', 'Hindi': 'hi', 'Telugu': 'te',
  'Kannada': 'kn', 'Malayalam': 'ml', 'Bengali': 'bn', 'Marathi': 'mr',
  'Gujarati': 'gu', 'Punjabi': 'pa', 'Odia': 'or', 'Assamese': 'as', 'Urdu': 'ur',
};

function findLangName(code: string): string {
  const found = LANGUAGES.find(l => l.code === code);
  return found?.name || 'English';
}

interface Props { navigation: any }

export default function ProfileEditScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { language: i18nLang, setLanguage: setI18nLang, t } = useLanguage();
  const m = user?.user_metadata || {};
  const [fullName, setFullName] = useState(m.full_name || '');
  const [mobileNumber, setMobileNumber] = useState(m.mobile_number || '');
  const [language, setLanguage] = useState(findLangName(i18nLang));
  const [country, setCountry] = useState(m.country || 'IN');
  const [state, setState] = useState(m.state || '');
  const [district, setDistrict] = useState(m.district || '');
  const [village, setVillage] = useState(m.village || '');
  const [loading, setLoading] = useState(false);

  const statesList = useMemo(() => STATES_BY_COUNTRY[country] || STATES_BY_COUNTRY.default || [], [country]);
  const districtsList = useMemo(() => DISTRICTS_BY_STATE[state] || DISTRICTS_BY_STATE.default || [], [state]);
  const villagesList = useMemo(() => VILLAGES_BY_DISTRICT[district] || VILLAGES_BY_DISTRICT.default || [], [district]);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    const code = LANGUAGE_MAP[value.split(' (')[0]];
    if (code) setI18nLang(code as any);
  };

  const handleSave = async () => {
    if (!fullName.trim()) { Alert.alert('Validation', `${t('profile.fullName')} ${t('common.required')}`); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim(), mobile_number: mobileNumber.trim(), preferred_language: language, country, state, district, village },
      });
      if (error) throw error;
      Alert.alert('Success', 'Profile updated');
      navigation.goBack();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('profile.edit')}</Text>
        <Text style={styles.subtitle}>Update your personal information</Text>

        <InputField label={`${t('profile.fullName')} *`} value={fullName} onChangeText={setFullName} placeholder="Your Name" />
        <InputField label={t('profile.mobile')} value={mobileNumber} onChangeText={setMobileNumber} placeholder="+91 98765 43210" keyboardType="phone-pad" />
        <SearchableSelect label={t('profile.language')} options={LANGUAGES.map(l => ({ label: l.name, value: l.name }))} value={language} onSelect={handleLanguageChange} icon="🗣️" />
        <SearchableSelect label={t('farm.country')} options={COUNTRIES.map(c => ({ label: `${c.name} (${c.dialCode})`, value: c.code }))} value={country} onSelect={setCountry} icon="🌍" />
        <SearchableSelect label={t('farm.state')} options={statesList} value={state} onSelect={(v) => { setState(v); setDistrict(''); setVillage(''); }} icon="🗺️" />
        <SearchableSelect label={t('farm.district')} options={districtsList} value={district} onSelect={(v) => { setDistrict(v); setVillage(''); }} icon="🏛️" />
        <SearchableSelect label={t('farm.village')} options={villagesList} value={village} onSelect={setVillage} icon="🏘️" />

        <View style={styles.buttons}>
          <Button title={t('common.save')} onPress={handleSave} loading={loading} size="lg" />
          <Button title={t('common.cancel')} variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField(props: any) {
  return (
    <View style={fieldStyles.group}>
      {props.label && <Text style={fieldStyles.label}>{props.label}</Text>}
      <TextInput style={fieldStyles.input} placeholderTextColor={colors.textLight} {...props} />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: { marginBottom: spacing.sm + 4 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginLeft: 4 },
  input: { backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md - 2, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg, marginTop: spacing.xs },
  buttons: { marginTop: spacing.md, gap: spacing.sm },
});
