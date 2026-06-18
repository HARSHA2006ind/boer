import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';

const { width } = Dimensions.get('window');

const PAGES = [
  {
    icon: 'sparkles',
    title: 'Welcome to Boer',
    subtitle: 'Your AI-powered smart farming assistant. Get real-time insights about your crops, weather, and market prices.',
    gradient: ['#1F6B52', '#154D3A'] as const,
  },
  {
    icon: 'leaf',
    title: 'Smart Farm Management',
    subtitle: 'Track crop health, get AI disease detection, irrigation advice, and personalized fertilizer recommendations.',
    gradient: ['#3B82F6', '#1D4ED8'] as const,
  },
  {
    icon: 'trending-up',
    title: 'Market & Finance',
    subtitle: 'Real-time mandi prices, AI-powered selling recommendations, and simple financial tracking for your farm.',
    gradient: ['#F59E0B', '#D97706'] as const,
  },
];

interface Props {
  navigation: any;
  onComplete: () => void;
}

export default function OnboardingScreen({ navigation, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < PAGES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleSkip = () => onComplete();

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) setCurrentIndex(viewableItems[0].index);
  }).current;

  const renderPage = ({ item }: { item: typeof PAGES[0] }) => (
    <View style={[styles.page, { width }]}>
      <LinearGradient colors={item.gradient} style={styles.pageGradient}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name={item.icon as any} size={48} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View key={i} style={[styles.dot, currentIndex === i && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={currentIndex === PAGES.length - 1 ? onComplete : handleNext}>
          <Text style={styles.nextText}>{currentIndex === PAGES.length - 1 ? 'Get Started' : 'Next'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  page: { flex: 1 },
  pageGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  iconContainer: { marginBottom: spacing.xxl },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', letterSpacing: -0.5, marginBottom: spacing.md },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24, maxWidth: 320, fontWeight: '500' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, alignItems: 'flex-end' },
  skipText: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 24 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingVertical: spacing.md },
  nextText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
