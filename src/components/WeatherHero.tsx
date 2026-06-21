import { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, shadows } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Forecast {
  day: string;
  temp: number;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

interface Props {
  temperature: number;
  condition: string;
  location: string;
  farmName?: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  forecast?: Forecast[];
}

function getFeelsLike(temp: number, humidity: number): string {
  if (humidity > 70 && temp > 30) return `${temp + 2}°C`;
  if (humidity > 70 && temp < 20) return `${temp - 3}°C`;
  return `${temp}°C`;
}

function getWeatherAdvice(temp: number, rainChance: number, condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('thunder')) return 'Delay irrigation. Prepare drainage.';
  if (temp > 38) return 'Heat stress risk. Keep livestock shaded & hydrated.';
  if (temp > 35) return 'High temperature. Irrigate early morning or evening.';
  if (rainChance > 60) return 'Rain likely. Hold off on fertilizer application.';
  if (temp < 15) return 'Cold spell. Protect sensitive seedlings.';
  return 'Good conditions for farming activities today.';
}

function WeatherHero({ temperature, condition, location, farmName, humidity, windSpeed, rainChance, forecast = [] }: Props) {
  const weatherType = useMemo(() => {
    const c = condition.toLowerCase();
    if (c.includes('sunny') || c.includes('clear')) return 'sunny';
    if (c.includes('partly cloudy') || c.includes('cloudy')) return 'cloudy';
    if (c.includes('overcast')) return 'overcast';
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'rainy';
    if (c.includes('thunder') || c.includes('storm')) return 'thunderstorm';
    if (c.includes('fog') || c.includes('mist')) return 'fog';
    return 'sunny';
  }, [condition]);

  const gradients: Record<string, readonly [string, string]> = {
    sunny: ['#2F5D50', '#1E4238'] as const,
    cloudy: ['#4A6274', '#2D3E4E'] as const,
    overcast: ['#3D4A53', '#252F36'] as const,
    rainy: ['#2D4A6F', '#1A2E47'] as const,
    thunderstorm: ['#1E2433', '#0F131C'] as const,
    fog: ['#4A4E52', '#2D3033'] as const,
  };

  const weatherGradient = gradients[weatherType] || gradients.sunny;
  const iconName = weatherType === 'sunny' ? 'sunny' : weatherType === 'cloudy' ? 'partly-sunny' : weatherType === 'rainy' ? 'rainy' : weatherType === 'thunderstorm' ? 'thunderstorm' : weatherType === 'fog' ? 'cloudy' : 'sunny';
  const feelsLike = getFeelsLike(temperature, humidity);
  const advice = getWeatherAdvice(temperature, rainChance, condition);
  const forecastDays = forecast.slice(0, 5);

  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.wrapper}>
      <LinearGradient colors={weatherGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.content}>
          {/* Top row */}
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              {farmName ? <Text style={styles.farmName}>{farmName}</Text> : null}
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.locationText}>{location || 'Current Region'}</Text>
              </View>
            </View>
            <View style={styles.tempBigWrap}>
              <Text style={styles.tempBig}>{temperature}°</Text>
              <Text style={styles.conditionLabel}>{condition}</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={15} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{rainChance}%</Text>
              <Text style={styles.statLabel}>Rain</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="thermometer-outline" size={15} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{humidity}%</Text>
              <Text style={styles.statLabel}>Humidity</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={15} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{windSpeed}</Text>
              <Text style={styles.statLabel}>Wind</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="thermometer-outline" size={15} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{feelsLike}</Text>
              <Text style={styles.statLabel}>Feels Like</Text>
            </View>
          </View>

          {/* Advice bar */}
          <View style={styles.adviceBar}>
            <Ionicons name="bulb-outline" size={14} color="#FFD700" />
            <Text style={styles.adviceText}>{advice}</Text>
          </View>

          {/* Forecast */}
          {forecastDays.length > 0 && (
            <View style={styles.forecastRow}>
              {forecastDays.map((d, i) => (
                <View key={i} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>{d.day.substring(0, 3)}</Text>
                  {d.icon.length > 2 ? <Text style={styles.forecastEmoji}>{d.icon}</Text> : <Ionicons name={d.icon as any} size={16} color="rgba(255,255,255,0.7)" />}
                  <Text style={styles.forecastTemp}>{d.temp}°</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md, ...shadows.lg },
  card: { borderRadius: radius.xl, overflow: 'hidden' },
  content: { padding: spacing.lg, gap: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  farmName: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3, marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  tempBigWrap: { alignItems: 'flex-end' },
  tempBig: { fontSize: 48, fontWeight: '200', color: '#FFFFFF', letterSpacing: -2, lineHeight: 52 },
  conditionLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginTop: -4 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.sm,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 1 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  statLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
  adviceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  adviceText: { fontSize: 12, fontWeight: '600', color: '#FFD700', flex: 1 },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  forecastItem: { alignItems: 'center', gap: 3 },
  forecastDay: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  forecastEmoji: { fontSize: 16 },
  forecastTemp: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});

export default memo(WeatherHero);
