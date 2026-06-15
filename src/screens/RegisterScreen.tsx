import { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../services/supabase';
import { colors, radius, spacing } from '../theme';
import Button from '../components/Button';
import SearchableSelect from '../components/SearchableSelect';
import { COUNTRIES } from '../data/countries';
import { STATES_BY_COUNTRY } from '../data/states';
import { DISTRICTS_BY_STATE, VILLAGES_BY_DISTRICT } from '../data/districts';
import { LANGUAGES } from '../data/languages';

interface Props { navigation: any }

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [language, setLanguage] = useState('English');
  const [country, setCountry] = useState('IN');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [loading, setLoading] = useState(false);

  const statesList = useMemo(() => STATES_BY_COUNTRY[country] || STATES_BY_COUNTRY.default || [], [country]);
  const districtsList = useMemo(() => DISTRICTS_BY_STATE[state] || DISTRICTS_BY_STATE.default || [], [state]);
  const villagesList = useMemo(() => VILLAGES_BY_DISTRICT[district] || VILLAGES_BY_DISTRICT.default || [], [district]);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Validation', 'Email, password, and full name are required');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: { data: { full_name: fullName.trim(), mobile_number: mobileNumber.trim(), preferred_language: language, country, state, district, village } },
      });
      if (error) throw error;
      if (data?.user) {
        Alert.alert('Success', 'Registration successful! Check your email for confirmation.', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
      }
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to start managing your farm</Text>

        <InputField label="Full Name *" value={fullName} onChangeText={setFullName} placeholder="Harsha Reddy" />
        <InputField label="Email *" value={email} onChangeText={setEmail} placeholder="farmer@example.com" keyboardType="email-address" autoCapitalize="none" />
        <InputField label="Password *" value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureTextEntry />
        <InputField label="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} placeholder="+91 98765 43210" keyboardType="phone-pad" />
        <SearchableSelect label="Preferred Language" options={LANGUAGES.map(l => ({ label: l.name, value: l.name }))} value={language} onSelect={setLanguage} icon="🗣️" />
        <SearchableSelect label="Country" options={COUNTRIES.map(c => ({ label: `${c.name} (${c.dialCode})`, value: c.code }))} value={country} onSelect={setCountry} icon="🌍" />
        <SearchableSelect label="State" options={statesList} value={state} onSelect={(v) => { setState(v); setDistrict(''); setVillage(''); }} icon="🗺️" />
        <SearchableSelect label="District" options={districtsList} value={district} onSelect={(v) => { setDistrict(v); setVillage(''); }} icon="🏛️" />
        <SearchableSelect label="Village" options={villagesList} value={village} onSelect={setVillage} icon="🏘️" />

        <View style={styles.buttons}>
          <Button title="Sign Up" onPress={handleRegister} loading={loading} size="lg" />
          <Button title="Already have an account? Login" variant="ghost" onPress={() => navigation.navigate('Login')} />
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
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg, marginTop: spacing.xs },
  buttons: { marginTop: spacing.md, gap: spacing.sm },
});
