import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';
import { useConnectivityContext } from '../contexts/ConnectivityContext';
import { getTableCounts, clearCache } from '../database/database';

interface Props { navigation: any }

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isOnline, status, pendingSyncCount, lastSyncTime, triggerSync } = useConnectivityContext();
  const [storageInfo, setStorageInfo] = useState<Record<string, number>>({});

  const loadStorageInfo = useCallback(async () => {
    const info = await getTableCounts();
    setStorageInfo(info);
  }, []);

  useEffect(() => { loadStorageInfo(); }, [loadStorageInfo]);

  const statusLabel = status === 'online' ? '🟢 Online' : status === 'syncing' ? '🟡 Syncing...' : '🔴 Offline';
  const lastSyncLabel = lastSyncTime
    ? `Today ${lastSyncTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    : 'Never';

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will clear all cached data (weather, market, alerts). Local farm data will be kept.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          await clearCache();
          await loadStorageInfo();
          Alert.alert('Done', 'Cache cleared successfully.');
        }
      },
    ]);
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export feature will be available in the next update.');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {/* Connectivity Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connectivity</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{statusLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pending Sync</Text>
            <Text style={styles.value}>{pendingSyncCount} items</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Last Sync</Text>
            <Text style={styles.value}>{lastSyncLabel}</Text>
          </View>
          <TouchableOpacity style={styles.syncBtn} onPress={triggerSync} disabled={!isOnline}>
            <Ionicons name="sync-outline" size={16} color={isOnline ? '#FFFFFF' : '#9CA3AF'} />
            <Text style={[styles.syncBtnText, !isOnline && { color: '#9CA3AF' }]}>
              {isOnline ? 'Sync Now' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Storage Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Storage Usage</Text>
          {Object.entries(storageInfo).map(([table, count]) => (
            <View key={table} style={styles.row}>
              <Text style={styles.label}>{table.replace(/_/g, ' ')}</Text>
              <Text style={styles.value}>{count} records</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={styles.actionText}>Clear Cache</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <Text style={styles.actionText}>Export Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  label: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  value: { fontSize: 14, color: colors.text, fontWeight: '600' },
  syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.sm, marginTop: spacing.md },
  syncBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  actionText: { fontSize: 15, color: colors.text, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
