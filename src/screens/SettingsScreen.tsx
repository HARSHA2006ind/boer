import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme, ColorMode } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import { useConnectivityContext } from '../contexts/ConnectivityContext';
import { getTableCounts, clearCache } from '../database/database';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext';

const APPEARANCE_OPTIONS: { mode: ColorMode; icon: string; label: string }[] = [
  { mode: 'system', icon: 'settings-outline', label: 'settings.appearance.system' },
  { mode: 'light', icon: 'sunny-outline', label: 'settings.appearance.light' },
  { mode: 'dark', icon: 'moon-outline', label: 'settings.appearance.dark' },
];

const PRIMARY_LANGUAGES = LANGUAGES.filter(l => ['en', 'ta', 'hi', 'te', 'kn', 'ml'].includes(l.code));

interface Props { navigation: any }

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, colorMode, setColorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { isOnline, status, pendingSyncCount, lastSyncTime, triggerSync } = useConnectivityContext();
  const [storageInfo, setStorageInfo] = useState<Record<string, number>>({});

  const loadStorageInfo = useCallback(async () => {
    const info = await getTableCounts();
    setStorageInfo(info);
  }, []);

  useEffect(() => { loadStorageInfo(); }, [loadStorageInfo]);

  const statusLabel = status === 'online' ? t('nav.home') === 'முகப்பு' ? '🟢 இணைப்பு உள்ளது' : '🟢 Online' : status === 'syncing' ? '🟡 Syncing...' : '🔴 ' + t('settings.offline');
  const lastSyncLabel = lastSyncTime
    ? t('settings.lastSync') + ' ' + lastSyncTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : t('settings.never');

  const handleClearCache = () => {
    Alert.alert(t('settings.clearCache'), 'This will clear all cached data. Local farm data will be kept.', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.clearCache'), style: 'destructive', onPress: async () => {
          await clearCache();
          await loadStorageInfo();
          Alert.alert('Done', 'Cache cleared successfully.');
        }
      },
    ]);
  };

  const handleExportData = () => {
    Alert.alert(t('settings.exportData'), 'Data export feature will be available in the next update.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.secondary }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {/* Appearance */}
        <Animated.View entering={FadeIn.duration(300)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.appearance')}</Text>
          <View style={styles.appearanceRow}>
            {APPEARANCE_OPTIONS.map(opt => {
              const active = colorMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[
                    styles.appearanceOption,
                    { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryLight : colors.secondary },
                  ]}
                  onPress={() => setColorMode(opt.mode)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={opt.icon as any} size={22} color={active ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.appearanceLabel, { color: active ? colors.primary : colors.textSecondary }]}>
                    {t(opt.label)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Language */}
        <Animated.View entering={FadeIn.duration(300).delay(50)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.language')}</Text>
          {PRIMARY_LANGUAGES.map(lang => {
            const active = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langRow, { borderBottomColor: colors.border }]}
                onPress={() => setLanguage(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.langLeft}>
                  <Text style={styles.langNative}>{lang.native}</Text>
                  <Text style={[styles.langName, { color: colors.textSecondary }]}>{lang.name}</Text>
                </View>
                <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}>
                  {active && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Connectivity */}
        <Animated.View entering={FadeIn.duration(300).delay(100)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.connectivity')}</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.connectivity')}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{statusLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.pendingSync').replace('{count}', String(pendingSyncCount))}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{pendingSyncCount} items</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Last Sync</Text>
            <Text style={[styles.value, { color: colors.text }]}>{lastSyncLabel}</Text>
          </View>
          <TouchableOpacity style={[styles.syncBtn, { backgroundColor: colors.primary }]} onPress={triggerSync} disabled={!isOnline}>
            <Ionicons name="sync-outline" size={16} color="#FFFFFF" />
            <Text style={styles.syncBtnText}>{isOnline ? t('settings.syncNow') : t('settings.offline')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Storage */}
        <Animated.View entering={FadeIn.duration(300).delay(150)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.storage')}</Text>
          {Object.entries(storageInfo).map(([table, count]) => (
            <View key={table} style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{table.replace(/_/g, ' ')}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{count} records</Text>
            </View>
          ))}
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeIn.duration(300).delay(200)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.text }]}>{t('settings.clearCache')}</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>{t('settings.exportData')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  content: { padding: spacing.md },
  card: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: spacing.md },
  appearanceRow: { flexDirection: 'row', gap: spacing.sm },
  appearanceOption: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1.5, gap: spacing.xs },
  appearanceLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1 },
  langLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  langNative: { fontSize: 16, fontWeight: '600' },
  langName: { fontSize: 12, fontWeight: '500' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioFill: { width: 12, height: 12, borderRadius: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 0 },
  label: { fontSize: 14, fontWeight: '500' },
  value: { fontSize: 14, fontWeight: '600' },
  syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.pill, paddingVertical: spacing.sm, marginTop: spacing.md },
  syncBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  actionText: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, marginVertical: spacing.xs },
});
