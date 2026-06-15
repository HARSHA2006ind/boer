import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadows } from '../theme';
import { useWeather, WeatherData } from '../hooks/useWeather';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  temperature?: number;
  condition?: string;
  location?: string;
  compact?: boolean;
  data?: WeatherData;
  onRefresh?: () => void;
}

export default function WeatherWidget({ location = 'Sangareddy', compact, data: propData, onRefresh }: Props) {
  const { weather, loading } = useWeather(location);
  const { t } = useLanguage();
  const w = propData || weather;

  const gradientColors = getWeatherGradient(w.conditionIcon);

  if (compact) {
    return (
      <TouchableOpacity onPress={onRefresh} activeOpacity={0.8}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.compactContainer}>
          <View style={styles.compactRow}>
            <Text style={styles.compactIcon}>{w.conditionIcon}</Text>
            <View style={styles.compactInfo}>
              <Text style={styles.compactTemp}>{w.temperature}°</Text>
              <Text style={styles.compactCondition}>{w.condition}</Text>
            </View>
            <View style={styles.compactRight}>
              <Text style={styles.compactDetail}>💧 {w.humidity}%</Text>
              <Text style={styles.compactDetail}>💨 {w.windSpeed} km/h</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      {loading && <ActivityIndicator color="rgba(255,255,255,0.6)" style={styles.loader} />}
      <View style={styles.mainRow}>
        <View style={styles.left}>
          <Text style={styles.icon}>{w.conditionIcon}</Text>
          <Text style={styles.temp}>{w.temperature}°</Text>
          <Text style={styles.condition}>{w.condition}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.location}>{w.location}</Text>
          <View style={styles.detailGrid}>
            <DetailItem icon="💧" label={t('weather.humidity')} value={`${w.humidity}%`} />
            <DetailItem icon="💨" label={t('weather.wind')} value={`${w.windSpeed} km/h`} />
            <DetailItem icon="🌧️" label={t('weather.rain')} value={`${w.rainChance}%`} />
            <DetailItem icon="🌡️" label={t('weather.feelsLike')} value={`${w.feelsLike}°`} />
          </View>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.sunInfo}>🌅 {t('weather.sunrise')} {w.sunrise}</Text>
        <Text style={styles.sunInfo}>🌇 {t('weather.sunset')} {w.sunset}</Text>
        <Text style={styles.sunInfo}>🌱 {t('weather.soilHealth')}: {w.soilHealth}</Text>
      </View>
      {w.forecast && !compact && (
        <View style={styles.forecastRow}>
          {w.forecast.map((d, i) => (
            <View key={i} style={styles.forecastDay}>
              <Text style={styles.forecastDayLabel}>{d.day}</Text>
              <Text style={styles.forecastIcon}>{d.icon}</Text>
              <Text style={styles.forecastTemp}>{d.temp}°</Text>
            </View>
          ))}
        </View>
      )}
    </LinearGradient>
  );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function getWeatherGradient(icon: string): [string, string, string] {
  if (icon === '☀️' || icon === '🌤️') return ['#F59E0B', '#F97316', '#EF4444'];
  if (icon === '⛅') return ['#60A5FA', '#3B82F6', '#2563EB'];
  if (icon === '☁️' || icon === '🌫️') return ['#64748B', '#475569', '#334155'];
  if (icon === '🌧️' || icon === '⛈️') return ['#475569', '#334155', '#1E293B'];
  if (icon === '❄️') return ['#93C5FD', '#60A5FA', '#3B82F6'];
  if (icon === '💨') return ['#94A3B8', '#64748B', '#475569'];
  return ['#3B82F6', '#60A5FA', '#93C5FD'];
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.lg,
  },
  loader: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  mainRow: { flexDirection: 'row', justifyContent: 'space-between' },
  left: { alignItems: 'flex-start' },
  icon: { fontSize: 40, marginBottom: spacing.xs },
  temp: { fontSize: 44, fontWeight: '200', color: '#FFFFFF', lineHeight: 48 },
  condition: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginTop: -4 },
  right: { alignItems: 'flex-end', justifyContent: 'flex-start', flex: 1, marginLeft: spacing.md },
  location: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: spacing.sm },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
  detailItem: { alignItems: 'center', minWidth: 48 },
  detailIcon: { fontSize: 16, marginBottom: 2 },
  detailValue: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  sunInfo: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  forecastDay: { alignItems: 'center', flex: 1 },
  forecastDayLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  forecastIcon: { fontSize: 20, marginVertical: spacing.xs },
  forecastTemp: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  compactContainer: { borderRadius: radius.lg, padding: spacing.sm + 2, ...shadows.md },
  compactRow: { flexDirection: 'row', alignItems: 'center' },
  compactIcon: { fontSize: 28, marginRight: spacing.sm },
  compactInfo: { flex: 1 },
  compactTemp: { fontSize: 22, fontWeight: '600', color: '#FFFFFF' },
  compactCondition: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  compactRight: { alignItems: 'flex-end' },
  compactDetail: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
});
