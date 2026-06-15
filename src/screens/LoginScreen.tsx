import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../theme';
import { signIn } from '../services/authService';
import Button from '../components/Button';

interface Props { navigation: any }

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    try { await signIn(email.trim().toLowerCase(), password); }
    catch (err: any) { Alert.alert('Login Failed', err.message); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B3A1B', '#2E7D32', '#4A6B12']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.glassCard}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your farm account</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="farmer@example.com" placeholderTextColor="rgba(255,255,255,0.4)" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="rgba(255,255,255,0.4)" secureTextEntry />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
            <Button title="Sign In" onPress={handleLogin} loading={loading} variant="primary" size="lg" style={styles.btn} />
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}><Text style={styles.socialIcon}>🔵</Text></TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}><Text style={styles.socialIcon}>⚪</Text></TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}><Text style={styles.socialIcon}>🍎</Text></TouchableOpacity>
            </View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.replace('Register')}><Text style={styles.footerLink}>Sign Up</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: spacing.xl,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xl },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xs, marginLeft: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  forgot: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: spacing.sm, marginBottom: spacing.md },
  btn: { marginTop: spacing.sm },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerText: { marginHorizontal: spacing.md, color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  socialBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  socialIcon: { fontSize: 22 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  footerLink: { fontSize: 13, fontWeight: '600', color: '#D4A843' },
});
