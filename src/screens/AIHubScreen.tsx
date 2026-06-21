import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing, radius } from '../theme';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - spacing.md * 2 - spacing.md) / 2;

interface Props { navigation: any }

const AI_FEATURES = [
  {
    key: 'AIChat',
    icon: 'chatbubbles-outline',
    title: 'Chat with AI',
    desc: 'Ask farming questions',
    gradient: ['#2F5D50', '#4A7A6B'] as [string, string],
  },
  {
    key: 'DiseaseScanner',
    icon: 'camera-outline',
    title: 'Disease Scanner',
    desc: 'Snap & identify diseases',
    gradient: ['#708238', '#8FA85A'] as [string, string],
  },
  {
    key: 'CropRecommendation',
    icon: 'leaf-outline',
    title: 'Crop Recommendation',
    desc: 'Best crops for your farm',
    gradient: ['#8B7355', '#A68F6F'] as [string, string],
  },
  {
    key: 'IrrigationAdvisor',
    icon: 'water-outline',
    title: 'Irrigation Advisor',
    desc: 'Smart water scheduling',
    gradient: ['#1E6B9F', '#4A90C4'] as [string, string],
  },
  {
    key: 'FertilizerAdvisor',
    icon: 'flask-outline',
    title: 'Fertilizer Advisor',
    desc: 'NPK recommendations',
    gradient: ['#9B59B6', '#AF7AC5'] as [string, string],
  },
  {
    key: 'SchemesAssistant',
    icon: 'shield-checkmark-outline',
    title: 'Schemes Assistant',
    desc: 'Find govt schemes',
    gradient: ['#D4872F', '#E8A84C'] as [string, string],
  },
  {
    key: 'SmartAlerts',
    icon: 'notifications-outline',
    title: 'Smart Alerts',
    desc: 'AI-powered farm alerts',
    gradient: ['#C0392B', '#E06050'] as [string, string],
  },
  {
    key: 'MarketAdvisor',
    icon: 'trending-up-outline',
    title: 'Market Advisor',
    desc: 'Sell at the best price',
    gradient: ['#2D8A4E', '#50B070'] as [string, string],
  },
];

export default function AIHubScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Hub</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Your intelligent farming assistant</Text>

        <View style={styles.grid}>
          {AI_FEATURES.map((feature, i) => (
            <Animated.View key={feature.key} entering={FadeInDown.duration(400).delay(100 + i * 60)}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate(feature.key)}
                style={styles.card}
              >
                <LinearGradient
                  colors={feature.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={feature.icon as any} size={26} color="#FFFFFF" />
                  </View>
                  <Text style={styles.cardTitle}>{feature.title}</Text>
                  <Text style={styles.cardDesc}>{feature.desc}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F2' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8E7E0', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  scroll: { paddingBottom: spacing.xl },
  subtitle: { fontSize: 13, color: '#8B7355', fontWeight: '500', paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, gap: spacing.md },
  card: { width: CARD_SIZE, height: CARD_SIZE * 0.9, borderRadius: radius.xl, overflow: 'hidden' },
  cardGradient: { flex: 1, borderRadius: radius.xl, padding: spacing.lg, justifyContent: 'space-between' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  cardDesc: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginTop: 2 },
});
