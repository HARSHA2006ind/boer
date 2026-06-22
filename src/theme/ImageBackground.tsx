import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './index';

interface Props {
  variant?: 'farm' | 'splash' | 'weather' | 'ai';
  height?: number;
  children?: React.ReactNode;
}

const GRADIENTS: Record<string, [string, string, string]> = {
  farm: ['#0D9488', '#14B8A6', '#5EEAD4'],
  splash: ['#0D9488', '#14B8A6', '#2DD4BF'],
  weather: ['#3B82F6', '#60A5FA', '#93C5FD'],
  ai: ['#1E1B4B', '#312E81', '#4338CA'],
};

const EMOJIS: Record<string, string[]> = {
  farm: ['🌾', '🌱', '🌿', '🌻', '🌽'],
  splash: ['🌾', '🌿', '🌱', '☀️', '🌤'],
  weather: ['☀️', '⛅', '🌧', '🌤', '⛈'],
  ai: ['🤖', '🧠', '💡', '✨', '🔮'],
};

export default function ImageBackground({ variant = 'farm', height, children }: Props) {
  const emojis = EMOJIS[variant] || EMOJIS.farm;
  const gradient = GRADIENTS[variant] || GRADIENTS.farm;
  return (
    <View style={[styles.container, height ? { height } : undefined]}>
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={styles.patternOverlay}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Text key={i} style={[styles.emoji, {
            top: Math.random() * 85 + 5,
            left: Math.random() * 85 + 5,
            opacity: 0.15 + Math.random() * 0.15,
            fontSize: 18 + Math.random() * 20,
            transform: [{ rotate: `${Math.random() * 360}deg` }],
          }]}>
            {emojis[i % emojis.length]}
          </Text>
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  patternOverlay: { ...StyleSheet.absoluteFillObject },
  emoji: { position: 'absolute' },
});
