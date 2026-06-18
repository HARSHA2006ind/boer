import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { getAIProvider, CropRecommendation, CropRecommendationInput } from '../ai/aiProvider';
import Card from '../components/Card';

interface Props { navigation: any }

const SOIL_TYPES = ['Clay Loam', 'Sandy Loam', 'Loamy', 'Black Cotton', 'Red Soil', 'Laterite', 'Alluvial'];
const WATER_SOURCES = ['Rainfed', 'Borewell', 'Well', 'Canal', 'Drip Irrigation', 'None'];
const SEASONS = ['Kharif (June-Oct)', 'Rabi (Nov-Mar)', 'Zaid (Summer)', 'All Season'];

export default function CropRecommendationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [soilType, setSoilType] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);

  async function getRecommendations() {
    if (!soilType || !waterSource || !season) {
      Alert.alert('Missing Info', 'Please select soil type, water source, and season.');
      return;
    }
    setLoading(true);
    try {
      const provider = getAIProvider();
      const input: CropRecommendationInput = {
        soilType,
        location: 'Telangana',
        waterSource,
        season,
        landArea: 1,
      };
      const result = await provider.recommendCrops(input);
      setRecommendations(result);
    } catch {
      Alert.alert('Error', 'Failed to get recommendations. Please try again.');
    }
    setLoading(false);
  }

  function getDifficultyColor(d: string): string {
    if (d.toLowerCase().includes('easy')) return colors.success;
    if (d.toLowerCase().includes('medium')) return colors.warning;
    return colors.error;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🌾 Crop Recommendation</Text>
          <View style={styles.backBtn} />
        </View>
        <Text style={styles.headerSub}>AI-powered crop suggestions based on your farm conditions</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        <Card title="1. Select Soil Type">
          <View style={styles.optionGrid}>
            {SOIL_TYPES.map(s => (
              <TouchableOpacity key={s} style={[styles.optionChip, soilType === s && styles.optionChipActive]} onPress={() => setSoilType(s)}>
                <Text style={[styles.optionText, soilType === s && styles.optionTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card title="2. Select Water Source">
          <View style={styles.optionGrid}>
            {WATER_SOURCES.map(w => (
              <TouchableOpacity key={w} style={[styles.optionChip, waterSource === w && styles.optionChipActive]} onPress={() => setWaterSource(w)}>
                <Text style={[styles.optionText, waterSource === w && styles.optionTextActive]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card title="3. Select Season">
          <View style={styles.optionGrid}>
            {SEASONS.map(s => (
              <TouchableOpacity key={s} style={[styles.optionChip, season === s && styles.optionChipActive]} onPress={() => setSeason(s)}>
                <Text style={[styles.optionText, season === s && styles.optionTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <TouchableOpacity style={styles.recommendBtn} onPress={getRecommendations} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.recommendBtnText}>🌱 Get Crop Recommendations</Text>
          )}
        </TouchableOpacity>

        {recommendations.length > 0 && (
          <>
            <Text style={styles.resultTitle}>🏆 Top 3 Recommended Crops</Text>
            {recommendations.map((crop, i) => (
              <Card key={i}>
                <View style={styles.cropCard}>
                  <View style={styles.cropHeader}>
                    <Text style={styles.cropRank}>#{i + 1}</Text>
                    <Text style={styles.cropName}>{crop.name}</Text>
                  </View>
                  <View style={styles.cropDetails}>
                    <View style={styles.cropDetailRow}>
                      <Text style={styles.cropLabel}>💧 Water</Text>
                      <Text style={styles.cropValue}>{crop.waterRequirement}</Text>
                    </View>
                    <View style={styles.cropDetailRow}>
                      <Text style={styles.cropLabel}>💰 Profit</Text>
                      <Text style={[styles.cropValue, { color: colors.success }]}>{crop.profitPotential}</Text>
                    </View>
                    <View style={styles.cropDetailRow}>
                      <Text style={styles.cropLabel}>📊 Difficulty</Text>
                      <Text style={[styles.cropValue, { color: getDifficultyColor(crop.difficulty) }]}>{crop.difficulty}</Text>
                    </View>
                    <View style={styles.cropDetailRow}>
                      <Text style={styles.cropLabel}>⏱️ Duration</Text>
                      <Text style={styles.cropValue}>{crop.harvestDuration}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, ...shadows.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', flex: 1 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: spacing.xs + 2 },
  content: { padding: spacing.md },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  optionChip: { paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: '#F5F8EE', borderWidth: 1, borderColor: '#DCE8C8' },
  optionChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  optionText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  optionTextActive: { color: '#FFFFFF' },
  recommendBtn: { backgroundColor: colors.primaryDark, paddingVertical: spacing.md, borderRadius: radius.pill, alignItems: 'center', marginBottom: spacing.lg, ...shadows.md },
  recommendBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  resultTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  cropCard: {},
  cropHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  cropRank: { fontSize: 20, fontWeight: '900', color: colors.primaryDark, width: 32 },
  cropName: { fontSize: 20, fontWeight: '800', color: colors.text, flex: 1 },
  cropDetails: { gap: spacing.sm },
  cropDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cropLabel: { fontSize: 14, color: colors.textSecondary },
  cropValue: { fontSize: 14, fontWeight: '700', color: colors.text },
});
