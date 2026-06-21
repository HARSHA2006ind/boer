import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useConnectivityContext } from '../contexts/ConnectivityContext';
import { signOut } from '../services/authService';
import { colors, spacing, radius, shadows } from '../theme';

interface Props { navigation: any }

const SETTINGS = [
  { icon: 'person-outline', label: 'Edit Profile', color: '#3B82F6', screen: 'ProfileEdit' },
  { icon: 'settings-outline', label: 'Settings', color: '#6B7280', screen: 'Settings' },
  { icon: 'notifications-outline', label: 'Notifications', color: '#F59E0B' },
  { icon: 'language-outline', label: 'Language', color: colors.primary, screen: 'Settings' },
  { icon: 'lock-closed-outline', label: 'Privacy', color: '#6B7280' },
  { icon: 'document-text-outline', label: 'Terms & Conditions', color: '#8B5CF6' },
  { icon: 'help-circle-outline', label: 'Support', color: '#3BA55D' },
  { icon: 'chatbubble-outline', label: 'Feedback', color: '#EC4899' },
];

export default function ProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const { status, pendingSyncCount, lastSyncTime } = useConnectivityContext();
  const m = user?.user_metadata || {};

  const statusDot = status === 'online' ? '🟢' : status === 'syncing' ? '🟡' : '🔴';
  const statusLabel = status === 'online' ? 'Online' : status === 'syncing' ? 'Syncing...' : 'Offline';
  const lastSyncLabel = lastSyncTime
    ? `Today ${lastSyncTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    : 'Never';

  const handlePress = (item: typeof SETTINGS[0]) => {
    if (item.screen) { navigation.navigate(item.screen); return; }
    Alert.alert('Coming Soon', `${item.label} will be available in the next update.`);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { setLoading(true); try { await signOut(); } catch {} finally { setLoading(false); } } },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person-circle" size={84} color={colors.primary} />
          </View>
          <Text style={styles.name}>{m.full_name || 'Farmer'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        {/* Sync Status */}
        <View style={styles.syncCard}>
          <View style={styles.syncRow}>
            <Text style={styles.syncLabel}>{statusDot} {statusLabel}</Text>
            <Text style={styles.syncValue}>{pendingSyncCount > 0 ? `${pendingSyncCount} pending` : 'All synced'}</Text>
          </View>
          <View style={styles.syncRow}>
            <Text style={styles.syncLabel}>Last Sync</Text>
            <Text style={styles.syncValue}>{lastSyncLabel}</Text>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsCard}>
          {SETTINGS.map((item, i) => (
            <TouchableOpacity key={i} style={[styles.row, i < SETTINGS.length - 1 && styles.rowBorder]}
               onPress={() => handlePress(item)}>
              <View style={[styles.rowIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loading}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>{loading ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Boer v1.0 · Made for Farmers</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  profileCard: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.md },
  avatarWrap: { marginBottom: spacing.md },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  email: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  syncCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg, ...shadows.sm },
  syncRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  syncLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  syncValue: { fontSize: 13, color: colors.text, fontWeight: '600' },
  settingsCard: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.xl, ...shadows.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md + 2, paddingHorizontal: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: spacing.xl },
  logoutText: { fontSize: 15, color: colors.danger, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 11, color: colors.textLight, marginBottom: spacing.md },
});
