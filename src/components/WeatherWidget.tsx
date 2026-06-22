import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedWeather from './AnimatedWeather';
import { colors, spacing, radius, shadows } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  location: string;
  farmName?: string;
  showForecast?: boolean;
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  rainChance?: number;
}

const defaultForecast = [
  { day: 'Mon', icon: '☀️', temp: '32°' },
  { day: 'Tue', icon: '⛅', temp: '30°' },
  { day: 'Wed', icon: '🌧️', temp: '28°' },
  { day: 'Thu', icon: '☀️', temp: '31°' },
  { day: 'Fri', icon: '☀️', temp: '33°' },
];

export default function WeatherWidget({
  location, farmName, showForecast, temperature = 30, condition = 'Sunny', humidity = 65, windSpeed = 12, rainChance = 10,
}: Props) {
  const { t } = useLanguage();
  const isNight = condition.toLowerCase().includes('night') || condition.toLowerCase().includes('clear');

  const gradientColors = (() => {
    const c = condition.toLowerCase();
    if (c.includes('sun') || c.includes('clear')) return ['#F59E0B', '#FDE68A'] as const;
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return ['#3B82F6', '#93C5FD'] as const;
    if (c.includes('thunder') || c.includes('storm')) return ['#1E3A5F', '#64748B'] as const;
    if (c.includes('cloud') || c.includes('overcast')) return ['#64748B', '#94A3B8'] as const;
    if (c.includes('wind')) return ['#60A5FA', '#BFDBFE'] as const;
    if (c.includes('night')) return ['#1E293B', '#475569'] as const;
    return ['#F59E0B', '#FDE68A'] as const;
  })();

  const textColor = (_c?: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('thunder') || cond.includes('night') || cond.includes('storm')) return '#FFFFFF';
    return colors.text;
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.mainRow}>
          <View style={styles.animWrap}>
            <AnimatedWeather condition={condition} />
          </View>
          <View style={styles.tempWrap}>
            <Text style={[styles.temp, { color: textColor() }]}>{temperature}°</Text>
            <Text style={[styles.cond, { color: textColor() }]}>{condition}</Text>
            <Text style={[styles.loc, { color: textColor() }]}>{location}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="water-outline" size={14} color={textColor()} />
            <Text style={[styles.statVal, { color: textColor() }]}>{rainChance}%</Text>
            <Text style={[styles.statLab, { color: textColor() }]}>Rain</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="speedometer-outline" size={14} color={textColor()} />
            <Text style={[styles.statVal, { color: textColor() }]}>{humidity}%</Text>
            <Text style={[styles.statLab, { color: textColor() }]}>Humidity</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="navigate-outline" size={14} color={textColor()} />
            <Text style={[styles.statVal, { color: textColor() }]}>{windSpeed} km/h</Text>
            <Text style={[styles.statLab, { color: textColor() }]}>Wind</Text>
          </View>
        </View>

        {showForecast && (
          <View style={styles.forecastRow}>
            {defaultForecast.map((d, i) => (
              <View key={i} style={styles.forecastDay}>
                <Text style={[styles.fDay, { color: textColor() }]}>{d.day}</Text>
                <Text style={styles.fIcon}>{d.icon}</Text>
                <Text style={[styles.fTemp, { color: textColor() }]}>{d.temp}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  card: { borderRadius: radius.xl, padding: spacing.lg, ...shadows.md },
  mainRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  animWrap: { width: 72, height: 72, marginRight: spacing.md },
  tempWrap: { flex: 1 },
  temp: { fontSize: 42, fontWeight: '200', letterSpacing: -1 },
  cond: { fontSize: 16, fontWeight: '600', marginTop: -4 },
  loc: { fontSize: 12, fontWeight: '500', opacity: 0.8, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  statVal: { fontSize: 12, fontWeight: '700' },
  statLab: { fontSize: 10, fontWeight: '500', opacity: 0.7 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: spacing.md },
  forecastDay: { alignItems: 'center', gap: 2 },
  fDay: { fontSize: 11, fontWeight: '600' },
  fIcon: { fontSize: 16 },
  fTemp: { fontSize: 12, fontWeight: '700' },
});
