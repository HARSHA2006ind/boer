import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { signOut } from '../services/authService';
import { colors, spacing, radius } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';

interface Props { navigation: any }

export default function ProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), 'Are you sure?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { setLoading(true); try { await signOut(); } catch (err: any) { Alert.alert('Error', err.message); } finally { setLoading(false); } } },
    ]);
  };

  const m = user?.user_metadata || {};
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={['#4A6B12', '#6B8E23']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(m.full_name || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{m.full_name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <Card title={t('profile.account')}>
        <DetailRow label={t('profile.fullName')} value={m.full_name} />
        <DetailRow label={t('profile.mobile')} value={m.mobile_number} />
        <DetailRow label={t('profile.email')} value={user?.email} />
        <DetailRow label={t('profile.language')} value={m.preferred_language} />
        <DetailRow label={t('farm.country')} value={m.country} />
        <DetailRow label={t('farm.state')} value={m.state} />
        <DetailRow label={t('farm.district')} value={m.district} />
        <DetailRow label={t('farm.village')} value={m.village} />
        <DetailRow label={t('profile.memberSince')} value={createdAt} />
      </Card>

      <View style={styles.actions}>
        <Button title={`✏️ ${t('profile.edit')}`} onPress={() => navigation.navigate('ProfileEdit')} />
        <Button title={`🚪 ${t('profile.logout')}`} variant="outline" onPress={handleLogout} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerHeart}>❤️</Text>
        <Text style={styles.footerText}>{t('profile.developedFor')}</Text>
        <Text style={styles.footerAuthor}>{t('profile.by')} Harsha Vardhan</Text>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', padding: spacing.xl, paddingTop: spacing.xxl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
  name: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  actions: { padding: spacing.md, gap: spacing.sm },
  footer: { alignItems: 'center', paddingVertical: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, marginHorizontal: spacing.md },
  footerHeart: { fontSize: 20, marginBottom: spacing.sm },
  footerText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  footerAuthor: { fontSize: 13, color: colors.textLight, marginTop: 2 },
});
