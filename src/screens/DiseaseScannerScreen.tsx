import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { getAIProvider, DiseaseResult } from '../ai/aiProvider';
import Card from '../components/Card';

interface Props { navigation: any }

export default function DiseaseScannerScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);

  async function pickImage(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', `${fromCamera ? 'Camera' : 'Gallery'} permission is required.`);
      return;
    }

    const result_ = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: true });

    if (!result_.canceled && result_.assets[0]) {
      setImage(result_.assets[0].uri);
      setResult(null);
      analyzeImage(result_.assets[0]);
    }
  }

  async function analyzeImage(asset: any) {
    setAnalyzing(true);
    try {
      const provider = getAIProvider();
      const diseaseResult = await provider.detectDisease(asset.base64 || '', asset.mimeType || 'image/jpeg');
      setResult(diseaseResult);
    } catch {
      Alert.alert('Error', 'Analysis failed. Please try again with a clearer image.');
    }
    setAnalyzing(false);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔍 Disease Scanner</Text>
          <View style={styles.backBtn} />
        </View>
        <Text style={styles.headerSub}>Upload a crop image for AI disease & pest detection</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        {!image ? (
          <View style={styles.uploadArea}>
            <View style={styles.uploadIconWrap}>
              <Ionicons name="leaf-outline" size={48} color={colors.primaryDark} />
            </View>
            <Text style={styles.uploadTitle}>Scan Your Crop</Text>
            <Text style={styles.uploadSub}>Take a photo or upload from gallery to detect diseases, pests, and nutrient deficiencies</Text>
            <View style={styles.uploadButtons}>
              <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(true)}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.uploadBtnText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.uploadBtn, styles.uploadBtnSecondary]} onPress={() => pickImage(false)}>
                <Ionicons name="images" size={20} color={colors.primaryDark} />
                <Text style={[styles.uploadBtnText, { color: colors.primaryDark }]}>Upload Image</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>📸 Tips for best results:</Text>
              <Text style={styles.tipText}>• Capture clear, well-lit images</Text>
              <Text style={styles.tipText}>• Focus on affected area (leaf, stem, fruit)</Text>
              <Text style={styles.tipText}>• Include healthy parts for comparison</Text>
              <Text style={styles.tipText}>• Avoid blurry or distant shots</Text>
            </View>
          </View>
        ) : (
          <>
            <Image source={{ uri: image }} style={styles.preview} resizeMode="cover" />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.retakeBtn} onPress={() => pickImage(true)}>
                <Ionicons name="camera" size={16} color={colors.textSecondary} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.retakeBtn} onPress={() => { setImage(null); setResult(null); }}>
                <Ionicons name="close" size={16} color={colors.textSecondary} />
                <Text style={styles.retakeText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {analyzing && (
              <View style={styles.analyzingCard}>
                <ActivityIndicator size="large" color={colors.primaryDark} />
                <Text style={styles.analyzingText}>AI is analyzing your crop image...</Text>
                <Text style={styles.analyzingSub}>Detecting diseases, pests, and nutrient status</Text>
              </View>
            )}

            {result && (
              <>
                <Card title="🔬 Analysis Result">
                  <View style={styles.resultHeader}>
                    <Text style={styles.diseaseName}>{result.disease}</Text>
                    <View style={styles.confidenceBadge}>
                      <Text style={styles.confidenceText}>{result.confidence}</Text>
                    </View>
                  </View>
                </Card>

                <Card title="📋 Symptoms">
                  <Text style={styles.resultText}>{result.symptoms}</Text>
                </Card>

                <Card title="🛠️ Recommended Action">
                  <Text style={styles.resultText}>{result.action}</Text>
                </Card>

                <Card title="🛡️ Prevention Tips">
                  <Text style={styles.resultText}>{result.prevention}</Text>
                </Card>

                {result.confidence && parseInt(result.confidence) < 80 && (
                  <Card>
                    <Text style={styles.disclaimer}>
                      ⚠️ *Consult an agricultural expert for accurate diagnosis.*
                    </Text>
                  </Card>
                )}
              </>
            )}
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
  uploadArea: { alignItems: 'center', paddingTop: spacing.xl },
  uploadIconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F0F5E8', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  uploadTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  uploadSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  uploadButtons: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, backgroundColor: colors.primaryDark, paddingHorizontal: spacing.md + 4, paddingVertical: spacing.sm + 4, borderRadius: radius.pill, ...shadows.sm },
  uploadBtnSecondary: { backgroundColor: '#F0F5E8', borderWidth: 1, borderColor: colors.primaryDark },
  uploadBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  tipsCard: { backgroundColor: '#F5F8EE', borderRadius: radius.lg, padding: spacing.md, width: '100%', borderWidth: 1, borderColor: '#DCE8C8' },
  tipsTitle: { fontSize: 13, fontWeight: '800', color: colors.primaryDark, marginBottom: spacing.xs + 2 },
  tipText: { fontSize: 12, color: colors.textSecondary, lineHeight: 20, paddingLeft: spacing.xs },
  preview: { width: '100%', height: 240, borderRadius: radius.lg, marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  retakeText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  analyzingCard: { alignItems: 'center', paddingVertical: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.md, ...shadows.sm },
  analyzingText: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  analyzingSub: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diseaseName: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1 },
  confidenceBadge: { backgroundColor: '#F0F5E8', borderRadius: radius.pill, paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 1 },
  confidenceText: { fontSize: 13, fontWeight: '800', color: colors.primaryDark },
  resultText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  disclaimer: { fontSize: 12, color: colors.warning, textAlign: 'center', fontStyle: 'italic', lineHeight: 18 },
});
