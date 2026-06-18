import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

const { width } = Dimensions.get('window');

function SunRays() {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={wStyles.sunWrap}>
      <Animated.View style={[wStyles.sunRays, { transform: [{ rotate }] }]}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <View key={i} style={[wStyles.ray, { transform: [{ rotate: `${deg}deg` }] }]} />
        ))}
      </Animated.View>
      <View style={wStyles.sunCore} />
    </View>
  );
}

function CloudySky() {
  const cloud1 = useRef(new Animated.Value(0)).current;
  const cloud2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(cloud1, { toValue: 1, duration: 6000, useNativeDriver: true }),
          Animated.timing(cloud1, { toValue: 0, duration: 6000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(cloud2, { toValue: 1, duration: 8000, useNativeDriver: true }),
          Animated.timing(cloud2, { toValue: 0, duration: 8000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const t1 = cloud1.interpolate({ inputRange: [0, 1], outputRange: [-20, width] });
  const t2 = cloud2.interpolate({ inputRange: [0, 1], outputRange: [-40, width + 20] });

  return (
    <View style={wStyles.cloudWrap}>
      <Animated.View style={[wStyles.cloud, { transform: [{ translateX: t1 }], top: '20%' }]}>
        <Ionicons name="cloud" size={40} color="rgba(255,255,255,0.5)" />
      </Animated.View>
      <Animated.View style={[wStyles.cloud, { transform: [{ translateX: t2 }], top: '50%' }]}>
        <Ionicons name="cloud" size={32} color="rgba(255,255,255,0.35)" />
      </Animated.View>
    </View>
  );
}

function RainDrops() {
  const drops = Array.from({ length: 8 }, () => ({
    anim: useRef(new Animated.Value(0)).current,
    delay: Math.random() * 2000,
    left: Math.random() * 100,
  }));

  useEffect(() => {
    drops.forEach(d => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(d.delay),
          Animated.timing(d.anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(d.anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={wStyles.rainWrap}>
      {drops.map((d, i) => {
        const y = d.anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 80] });
        const opacity = d.anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 1, 0] });
        return (
          <Animated.View key={i} style={[wStyles.drop, { left: `${d.left}%`, transform: [{ translateY: y }], opacity }]} />
        );
      })}
    </View>
  );
}

function ThunderFlash() {
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(3000 + Math.random() * 4000),
        Animated.timing(flash, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 0, duration: 100, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 1, duration: 50, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 0, duration: 200, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const bgColor = flash.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)'],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />
  );
}

function WindParticles() {
  const particles = Array.from({ length: 5 }, () => ({
    anim: useRef(new Animated.Value(0)).current,
    delay: Math.random() * 3000,
    top: Math.random() * 80 + 10,
  }));

  useEffect(() => {
    particles.forEach(p => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(p.anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={wStyles.windWrap}>
      {particles.map((p, i) => {
        const x = p.anim.interpolate({ inputRange: [0, 1], outputRange: [-10, width + 10] });
        const opacity = p.anim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.8, 0.8, 0] });
        return (
          <Animated.View key={i} style={[wStyles.particle, { top: `${p.top}%`, transform: [{ translateX: x }], opacity }]} />
        );
      })}
    </View>
  );
}

interface Props {
  condition: string;
  size?: number;
}

export default function AnimatedWeather({ condition, size = 36 }: Props) {
  const cond = condition.toLowerCase();

  if (cond.includes('sun') || cond.includes('clear')) {
    return (
      <View style={wStyles.container}>
        <SunRays />
      </View>
    );
  }
  if (cond.includes('cloud') || cond.includes('overcast')) {
    return (
      <View style={wStyles.container}>
        <CloudySky />
      </View>
    );
  }
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
    return (
      <View style={wStyles.container}>
        <CloudySky />
        <RainDrops />
      </View>
    );
  }
  if (cond.includes('thunder') || cond.includes('storm') || cond.includes('lightning')) {
    return (
      <View style={wStyles.container}>
        <CloudySky />
        <RainDrops />
        <ThunderFlash />
      </View>
    );
  }
  if (cond.includes('wind')) {
    return (
      <View style={wStyles.container}>
        <WindParticles />
      </View>
    );
  }
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
    return (
      <View style={[wStyles.container, { backgroundColor: 'rgba(200,200,200,0.15)' }]}>
        <CloudySky />
      </View>
    );
  }

  return (
    <View style={wStyles.container}>
      <SunRays />
    </View>
  );
}

const wStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  sunWrap: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  sunRays: { position: 'absolute', width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  ray: { position: 'absolute', width: 3, height: 20, backgroundColor: 'rgba(255,200,50,0.5)', borderRadius: 2, top: -10 },
  sunCore: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FCD34D' },
  cloudWrap: { position: 'absolute', width: '100%', height: '100%' },
  cloud: { position: 'absolute' },
  rainWrap: { position: 'absolute', width: '100%', height: '100%' },
  drop: { position: 'absolute', width: 2, height: 12, backgroundColor: 'rgba(180,220,255,0.6)', borderRadius: 1, top: 0 },
  windWrap: { position: 'absolute', width: '100%', height: '100%' },
  particle: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
});
