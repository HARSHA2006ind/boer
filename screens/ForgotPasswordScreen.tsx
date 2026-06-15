import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../theme';
import { resetPassword } from '../services/authService';
import Button from '../components/Button';

interface Props { navigation: any }

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) { Alert.alert('Error', 'Enter your email address'); return; }
    setLoading(true);
    try { await resetPassword(email.trim().toLowerCase()); Alert.alert('Success', 'Password reset link sent to your email.', [{ text: 'OK', onPress: () => navigation.goBack() }]); }
    catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B3A1B', '#2E7D32', '#4A6B12']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={styles.overlay}>
        <View style={styles.glassCard}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="farmer@example.com" placeholderTextColor="rgba(255,255,255,0.4)" keyboardType="email-address" autoCapitalize="none" />
          </View>
          <Button title="Send Reset Link" onPress={handleReset} loading={loading} variant="primary" size="lg" style={styles.btn} />
          <Button title="Back to Login" onPress={() => navigation.goBack()} variant="ghost" style={styles.backBtn} textStyle={{ color: 'rgba(255,255,255,0.7)' }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: spacing.xl },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xl },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xs, marginLeft: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2, fontSize: 15, color: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  btn: { marginTop: spacing.sm },
  backBtn: { marginTop: spacing.sm },
});
