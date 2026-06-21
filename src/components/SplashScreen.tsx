import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated as RNA } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  onReady?: () => void;
}

export default function SplashScreen({ onReady }: Props) {
  const logoOpacity = useRef(new RNA.Value(0)).current;
  const subtitleOpacity = useRef(new RNA.Value(0)).current;
  const scale = useRef(new RNA.Value(0.92)).current;

  useEffect(() => {
    RNA.parallel([
      RNA.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      RNA.spring(scale, { toValue: 1, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: true }),
    ]).start();

    const subTimer = setTimeout(() => {
      RNA.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 400);

    const readyTimer = setTimeout(() => {
      onReady?.();
    }, 1200);

    return () => { clearTimeout(subTimer); clearTimeout(readyTimer); };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A4F3E', '#6B705C', '#4A4F3E']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>
        <RNA.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale }] }]}>
          <Text style={styles.logoText}>BOER</Text>
          <View style={styles.logoUnderline} />
        </RNA.View>
        <RNA.View style={{ opacity: subtitleOpacity }}>
          <Text style={styles.subtitle}>Smart Farming Platform</Text>
        </RNA.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 12 },
  logoText: { fontSize: 52, fontWeight: '800', color: '#FFFFFF', letterSpacing: -2 },
  logoUnderline: { width: 40, height: 3, borderRadius: 2, backgroundColor: '#CB997E', marginTop: 6 },
  subtitle: { fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
});
