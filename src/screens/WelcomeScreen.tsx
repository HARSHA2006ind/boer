import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';
import Button from '../components/Button';

interface Props { navigation: any }

export default function WelcomeScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D9488', '#14B8A6', '#0D9488']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={styles.patternOverlay}>
        {['🌾','🌱','🌿','🌻','🌽','☀️'].map((e, i) => (
          <Text key={i} style={[styles.emoji, { top: 5 + i * 15, left: 10 + i * 12, opacity: 0.12, fontSize: 28 + i * 4 }]}>{e}</Text>
        ))}
      </View>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🌾</Text>
          </View>
          <Text style={styles.logoText}>Boer</Text>
          <Text style={styles.tagline}>Your AI Powered{'\n'}Smart Farming Companion</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Take control of your farm with AI-driven insights</Text>
          <Button title="Get Started" variant="glass" size="lg" onPress={() => navigation.replace('Login')} style={styles.btn} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  patternOverlay: { ...StyleSheet.absoluteFillObject },
  emoji: { position: 'absolute' },
  content: { flex: 1, justifyContent: 'space-between', padding: spacing.xl, paddingBottom: spacing.xxl },
  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: spacing.lg,
  },
  logoIcon: { fontSize: 48 },
  logoText: { fontSize: 42, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24, marginTop: spacing.sm },
  footer: { alignItems: 'center' },
  footerText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: spacing.lg },
  btn: { width: '100%', borderRadius: radius.pill },
});
