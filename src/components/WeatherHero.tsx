import { memo, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing, interpolate, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import { spacing, radius, shadows } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const CARD_HEIGHT = CARD_WIDTH * 0.85;

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
  humidity: number;
  windSpeed: number;
  rainChance: number;
  sunrise: string;
  sunset: string;
  isDay: boolean;
  forecast?: Forecast[];
}

function WeatherHero({
  temperature,
  condition,
  location,
  humidity,
  windSpeed,
  rainChance,
  sunrise,
  sunset,
  isDay,
  forecast = [],
}: Props) {
  const { t } = useLanguage();

  const weatherType = useMemo(() => {
    const c = condition.toLowerCase();
    if (c.includes('sunny') || c.includes('clear')) return 'sunny';
    if (c.includes('partly cloudy')) return 'partlyCloudy';
    if (c.includes('cloudy') || c.includes('overcast')) return 'cloudy';
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'rainy';
    if (c.includes('thunder') || c.includes('storm')) return 'thunderstorm';
    if (c.includes('fog') || c.includes('mist')) return 'fog';
    if (c.includes('wind')) return 'windy';
    if (c.includes('snow') || c.includes('sleet')) return 'snowy';
    return isDay ? 'sunny' : 'clear';
  }, [condition, isDay]);

  const gradients: Record<string, readonly [string, string, ...string[]]> = {
    sunny: ['#2D8A4E', '#1E6F50', '#154D3A'] as const,
    partlyCloudy: ['#3B82F6', '#60A5FA', '#93C5FD'] as const,
    cloudy: ['#E2E8F0', '#CBD5E1', '#94A3B8'] as const,
    rainy: ['#93C5FD', '#60A5FA', '#3B82F6'] as const,
    thunderstorm: ['#475569', '#334155', '#1E293B'] as const,
    fog: ['#E5E7EB', '#D1D5DB', '#9CA3AF'] as const,
    windy: ['#F0F9FF', '#E0F2FE', '#BAE6FD'] as const,
    snowy: ['#F0F9FF', '#E0F2FE', '#DBEAFE'] as const,
    clear: ['#1E3A5F', '#1E293B', '#0F172A'] as const,
  };

  const weatherGradient = gradients[weatherType] || gradients.sunny;

  const conditionLabel = t(`weather.${weatherType}`) || condition;

  const hasForecast = forecast.length > 0;

  return (
    <LinearGradient colors={weatherGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <WeatherAnimation type={weatherType} isDay={isDay} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.locationBadge}>
            <Ionicons name="location-sharp" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText}>{location || t('home.currentRegion')}</Text>
          </View>
          <Ionicons name={isDay ? 'sunny' : 'moon'} size={18} color="rgba(255,255,255,0.8)" />
        </View>
        <View style={styles.tempRow}>
          <Text style={styles.temp}>{temperature}°</Text>
          <Text style={styles.condition}>{conditionLabel}</Text>
        </View>
        <View style={styles.statsRow}>
          <StatItem icon="water-outline" value={`${rainChance}%`} label={t('weather.rain')} />
          <StatItem icon="moisture-outline" value={`${humidity}%`} label={t('weather.humidity')} />
          <StatItem icon="wind-outline" value={`${windSpeed}`} label={t('weather.wind')} />
        </View>
        {hasForecast && (
          <View style={styles.forecastRow}>
            {forecast.slice(0, 5).map((day, i) => {
              const dayKey = day.day?.toLowerCase().substring(0, 3) || `day${i}`;
              const dayLabel = t(`weather.${dayKey === 'mon' ? 'monday' : dayKey === 'tue' ? 'tuesday' : dayKey === 'wed' ? 'wednesday' : dayKey === 'thu' ? 'thursday' : dayKey === 'fri' ? 'friday' : dayKey === 'sat' ? 'saturday' : dayKey === 'sun' ? 'sunday' : 'monday'}`) || day.day;
              return (
                <View key={i} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>{dayLabel}</Text>
                  <Text style={styles.forecastIcon}>{day.icon}</Text>
                  <Text style={styles.forecastTemp}>{day.temp}°</Text>
                </View>
              );
            })}
          </View>
        )}
        <View style={styles.sunRow}>
          <View style={styles.sunItem}>
            <Ionicons name="sunny-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.sunText}>{sunrise}</Text>
          </View>
          <View style={styles.sunItem}>
            <Ionicons name="moon-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.sunText}>{sunset}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

function StatItem({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon as any} size={14} color="rgba(255,255,255,0.8)" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const rayCount = 8;
const cloudParticleCount = 2;
const rainDropCount = 10;
const windParticleCount = 5;

function WeatherAnimation({ type, isDay }: { type: string; isDay: boolean }) {
  if (type === 'sunny' || type === 'clear') {
    return <SunRays />;
  }
  if (type === 'cloudy' || type === 'partlyCloudy') {
    return <CloudAnimation />;
  }
  if (type === 'rainy') {
    return <RainAnimation />;
  }
  if (type === 'thunderstorm') {
    return <ThunderAnimation />;
  }
  if (type === 'windy') {
    return <WindAnimation />;
  }
  if (type === 'fog') {
    return <FogAnimation />;
  }
  return null;
}

function SunRays() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: rayCount }).map((_, i) => {
        const rotation = useSharedValue(0);
        useEffect(() => {
          rotation.value = withRepeat(
            withTiming(360, { duration: 8000, easing: Easing.linear }),
            -1,
            false
          );
        }, []);
        const angle = (360 / rayCount) * i;
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [
            { rotate: `${interpolate(rotation.value, [0, 360], [angle, angle + 360])}deg` },
            { translateY: -60 },
          ],
        }));
        return (
          <Animated.View key={i} style={[styles.ray, animatedStyle]}>
            <View style={styles.rayLine} />
          </Animated.View>
        );
      })}
    </View>
  );
}

function CloudAnimation() {
  const positions = useMemo(() => 
    Array.from({ length: cloudParticleCount }).map(() => ({
      startX: -(40 + Math.random() * 60),
      endX: CARD_WIDTH + 40,
      y: 20 + Math.random() * 60,
      duration: 12000 + Math.random() * 8000,
    })), []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {positions.map((p, i) => {
        const translateX = useSharedValue(p.startX);
        useEffect(() => {
          translateX.value = withRepeat(
            withTiming(p.endX, { duration: p.duration, easing: Easing.linear }),
            -1,
            false
          );
        }, []);
        const animStyle = useAnimatedStyle(() => ({
          transform: [{ translateX: translateX.value }],
        }));
        return (
          <Animated.View key={i} style={[styles.cloud, { top: p.y }, animStyle]}>
            <View style={styles.cloudBubble} />
            <View style={[styles.cloudBubble, { width: 24, height: 24, left: 14, top: -6 }]} />
            <View style={[styles.cloudBubble, { width: 20, height: 20, left: 28, top: -3 }]} />
          </Animated.View>
        );
      })}
    </View>
  );
}

function RainAnimation() {
  const drops = useMemo(() => 
    Array.from({ length: rainDropCount }).map(() => ({
      startX: Math.random() * CARD_WIDTH,
      startY: -10 - Math.random() * 40,
      duration: 600 + Math.random() * 400,
      delay: Math.random() * 1000,
    })), []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {drops.map((d, i) => {
        const translateY = useSharedValue(d.startY);
        useEffect(() => {
          translateY.value = withDelay(
            d.delay,
            withRepeat(
              withTiming(CARD_HEIGHT + 10, { duration: d.duration, easing: Easing.linear }),
              -1,
              false
            )
          );
        }, []);
        const animStyle = useAnimatedStyle(() => ({
          transform: [{ translateY: translateY.value }],
        }));
        return (
          <Animated.View key={i} style={[styles.rainDrop, { left: d.startX }, animStyle]} />
        );
      })}
    </View>
  );
}

function ThunderAnimation() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const flash = () => {
      opacity.value = withSequence(
        withTiming(0.8, { duration: 80 }),
        withTiming(0, { duration: 120 }),
        withDelay(2000 + Math.random() * 5000, withTiming(0.6, { duration: 60 })),
        withTiming(0, { duration: 100 })
      );
      scale.value = withSequence(
        withTiming(1.05, { duration: 80 }),
        withTiming(1, { duration: 120 })
      );
    };
    flash();
    const interval = setInterval(flash, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.thunderFlash, flashStyle]} />
      {Array.from({ length: rainDropCount }).map((_, i) => {
        const translateY = useSharedValue(-10 - Math.random() * 40);
        useEffect(() => {
          translateY.value = withRepeat(
            withTiming(CARD_HEIGHT + 10, { duration: 400 + Math.random() * 300, easing: Easing.linear }),
            -1,
            false
          );
        }, []);
        const animStyle = useAnimatedStyle(() => ({
          transform: [{ translateY: translateY.value }],
        }));
        return (
          <Animated.View key={i} style={[styles.rainDrop, { left: Math.random() * CARD_WIDTH }, animStyle]} />
        );
      })}
    </View>
  );
}

function WindAnimation() {
  const particles = useMemo(() => 
    Array.from({ length: windParticleCount }).map(() => ({
      startX: -20,
      endX: CARD_WIDTH + 20,
      y: 30 + Math.random() * 80,
      duration: 3000 + Math.random() * 2000,
      delay: Math.random() * 2000,
    })), []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const translateX = useSharedValue(p.startX);
        useEffect(() => {
          translateX.value = withDelay(
            p.delay,
            withRepeat(
              withTiming(p.endX, { duration: p.duration, easing: Easing.linear }),
              -1,
              false
            )
          );
        }, []);
        const animStyle = useAnimatedStyle(() => ({
          opacity: interpolate(translateX.value, [p.startX, p.endX * 0.3, p.endX * 0.7, p.endX], [0, 0.6, 0.6, 0]),
          transform: [{ translateX: translateX.value }],
        }));
        return (
          <Animated.View key={i} style={[styles.windParticle, { top: p.y }, animStyle]} />
        );
      })}
    </View>
  );
}

function FogAnimation() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 3 }).map((_, i) => {
        const translateX = useSharedValue(-CARD_WIDTH * 0.3);
        useEffect(() => {
          translateX.value = withRepeat(
            withTiming(CARD_WIDTH * 0.7, { duration: 10000 + i * 3000, easing: Easing.linear }),
            -1,
            false
          );
        }, []);
        const animStyle = useAnimatedStyle(() => ({
          opacity: 0.15 - i * 0.03,
          transform: [{ translateX: translateX.value }],
        }));
        return (
          <Animated.View key={i} style={[styles.fogLayer, { top: 20 + i * 25 }, animStyle]} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  tempRow: {
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  temp: {
    fontSize: 56,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 62,
  },
  condition: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.3,
    marginTop: -4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  forecastItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  forecastDay: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  forecastIcon: {
    fontSize: 16,
  },
  forecastTemp: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sunRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sunItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sunText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  ray: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 2,
    height: 60,
    alignItems: 'center',
  },
  rayLine: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255,255,200,0.25)',
    borderRadius: 1,
  },
  cloud: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cloudBubble: {
    width: 30,
    height: 22,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  rainDrop: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: 'rgba(180,210,255,0.5)',
    borderRadius: 1,
  },
  thunderFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    opacity: 0,
  },
  windParticle: {
    position: 'absolute',
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  fogLayer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
});

export default memo(WeatherHero);
