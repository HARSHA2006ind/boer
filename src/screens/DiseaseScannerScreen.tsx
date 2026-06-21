import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Animated, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { getAIProvider, DiseaseResult } from '../ai/aiProvider';
import { saveDiseaseScan, getDiseaseScans } from '../services/aiStorage';

interface Props { navigation: any }

export default function DiseaseScannerScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState('');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { if (user) loadScans(); }, [user]);

  async function loadScans() {
    if (!user) return;
    const s = await getDiseaseScans(user.id);
    setScans(s);
  }

  function animateIn() {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }

  async function pickImage(fromCamera: boolean) {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', `Please grant ${fromCamera ? 'camera' : 'gallery'} access.`);
        return;
      }

      const result = await (fromCamera
        ? ImagePicker.launchCameraAsync({ quality: 0.8, base64: true })
        : ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: true }));

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImage(asset.uri);
        setBase64(asset.base64 || '');
        setMimeType(asset.mimeType || 'image/jpeg');
        setResult(null);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to open camera/gallery');
    }
  }

  async function analyze() {
    if (!image || !base64) { Alert.alert('No Image', 'Please capture or select an image first.'); return; }
    setLoading(true);
    setResult(null);

    try {
      const provider = getAIProvider();
      const res = await provider.detectDisease(base64, mimeType);
      setResult(res);
      animateIn();

      if (user) {
        await saveDiseaseScan(user.id, image, res.disease, res.confidence, res.symptoms, res.action, res.prevention);
        await loadScans();
      }
    } catch (e: any) {
      Alert.alert('Analysis Failed', e.message || 'Please try again with a clearer image.');
    }
    setLoading(false);
  }

  function resetAll() {
    setImage(null);
    setBase64('');
    setResult(null);
  }

  const severityColor = (disease: string) => {
    if (!disease || disease.includes('Healthy')) return '#2D6A4F';
    if (disease.includes('Blight') || disease.includes('Wilt')) return '#DC2626';
    if (disease.includes('Mildew') || disease.includes('Rust')) return '#EA580C';
    return '#CA8A04';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disease Scanner</Text>
        <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={styles.backBtn}>
          <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showHistory ? (
        <FlatList data={scans} keyExtractor={(_, i) => String(i)} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.historyCard} onPress={() => {
              setResult({ disease: item.disease_name, confidence: item.confidence, symptoms: item.symptoms, action: item.treatment, prevention: item.prevention });
              setImage(item.image_uri);
              setShowHistory(false);
              animateIn();
            }}>
              {item.image_uri && <Image source={{ uri: item.image_uri }} style={styles.historyImage} />}
              <View style={styles.historyInfo}>
                <Text style={styles.historyDisease}>{item.disease_name}</Text>
                <Text style={styles.historyConfidence}>{item.confidence}</Text>
                <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No scans yet. Scan a crop to get started.</Text>}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}>
          <View style={styles.uploadSection}>
            {image ? (
              <View style={styles.imagePreviewWrap}>
                <Image source={{ uri: image }} style={styles.preview} resizeMode="cover" />
                <TouchableOpacity style={styles.changeBtn} onPress={resetAll}>
                  <Ionicons name="close-circle" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.uploadIconWrap}>
                  <Ionicons name="camera-outline" size={40} color={colors.primary} />
                </View>
                <Text style={styles.uploadTitle}>Snap a photo of your crop</Text>
                <Text style={styles.uploadSub}>Take a clear photo of affected leaves, stems, or fruits</Text>
                <View style={styles.uploadButtons}>
                  <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(true)}>
                    <Ionicons name="camera" size={18} color="#FFF" /><Text style={styles.uploadBtnText}> Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.uploadBtn, styles.galleryBtn]} onPress={() => pickImage(false)}>
                    <Ionicons name="images" size={18} color={colors.primary} /><Text style={[styles.uploadBtnText, { color: colors.primary }]}> Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {image && !result && (
            <TouchableOpacity style={styles.analyzeBtn} onPress={analyze} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <><Ionicons name="search" size={18} color="#FFF" /><Text style={styles.analyzeBtnText}> Analyze Image</Text></>
              )}
            </TouchableOpacity>
          )}

          {loading && (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Analyzing image with AI...</Text>
              <Text style={styles.loadingSub}>Identifying diseases, pests, and symptoms</Text>
            </View>
          )}

          {result && (
            <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
              <View style={[styles.severityBar, { backgroundColor: severityColor(result.disease) }]}>
                <Text style={styles.severityText}>
                  {result.disease.includes('Healthy') ? 'HEALTHY' : result.confidence}
                </Text>
              </View>

              <Text style={styles.diseaseName}>{result.disease}</Text>

              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Ionicons name="pulse-outline" size={18} color={colors.error} />
                  <Text style={styles.detailTitle}>Symptoms Detected</Text>
                </View>
                <Text style={styles.detailText}>{result.symptoms}</Text>
              </View>

              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Ionicons name="medkit-outline" size={18} color={colors.success} />
                  <Text style={styles.detailTitle}>Treatment</Text>
                </View>
                <Text style={styles.detailText}>{result.action}</Text>
              </View>

              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Ionicons name="shield-outline" size={18} color={colors.info} />
                  <Text style={styles.detailTitle}>Prevention</Text>
                </View>
                <Text style={styles.detailText}>{result.prevention}</Text>
              </View>

              <View style={styles.disclaimer}>
                <Ionicons name="information-circle-outline" size={14} color={colors.warning} />
                <Text style={styles.disclaimerText}>AI-generated analysis. Verify with agricultural experts.</Text>
              </View>

              <TouchableOpacity style={styles.scanAgainBtn} onPress={resetAll}>
                <Ionicons name="camera-outline" size={18} color={colors.primary} />
                <Text style={styles.scanAgainText}> Scan Another</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F2' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { padding: spacing.md },
  uploadSection: { marginBottom: spacing.md },
  imagePreviewWrap: { position: 'relative', borderRadius: radius.xl, overflow: 'hidden', ...shadows.md },
  preview: { width: '100%', height: 280, borderRadius: radius.xl },
  changeBtn: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  uploadPlaceholder: { alignItems: 'center', paddingVertical: spacing.xxxl, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', ...shadows.sm },
  uploadIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
  uploadTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  uploadSub: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', textAlign: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xl },
  uploadButtons: { flexDirection: 'row', gap: spacing.md },
  uploadBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.pill, alignItems: 'center' },
  galleryBtn: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  uploadBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  analyzeBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, ...shadows.md },
  analyzeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  loadingCard: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.xl, marginBottom: spacing.md },
  loadingText: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  loadingSub: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginTop: spacing.xs },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadows.lg },
  severityBar: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg },
  severityText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  diseaseName: { fontSize: 20, fontWeight: '800', color: colors.text, padding: spacing.lg, paddingBottom: spacing.sm },
  detailSection: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  detailTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  detailText: { fontSize: 14, lineHeight: 21, color: colors.textSecondary, fontWeight: '500' },
  disclaimer: { flexDirection: 'row', gap: spacing.sm, backgroundColor: '#FFF8E1', padding: spacing.md, marginHorizontal: spacing.lg, borderRadius: radius.md, marginTop: spacing.md, alignItems: 'flex-start' },
  disclaimerText: { fontSize: 11, color: '#7B6F2E', fontWeight: '500', flex: 1 },
  scanAgainBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.md, margin: spacing.lg, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary },
  scanAgainText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  historyCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  historyImage: { width: 60, height: 60, borderRadius: radius.md, marginRight: spacing.md },
  historyInfo: { flex: 1, justifyContent: 'center' },
  historyDisease: { fontSize: 15, fontWeight: '700', color: colors.text },
  historyConfidence: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  historyDate: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: colors.textLight, fontSize: 14, marginTop: spacing.xxl },
});
