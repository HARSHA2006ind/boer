import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadows } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  onPress: () => void;
}

export default function AICard({ onPress }: Props) {
  const { t } = useLanguage();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <LinearGradient colors={['#1E1B4B', '#312E81', '#4338CA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient} />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🤖</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('home.aiAssistant')}</Text>
          <Text style={styles.subtitle}>{t('ai.subtitle')}</Text>
        </View>
        <View style={styles.arrowWrap}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md, ...shadows.lg },
  gradient: { ...StyleSheet.absoluteFillObject },
  content: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  iconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  icon: { fontSize: 24 },
  textBlock: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  arrowWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  arrow: { fontSize: 16, color: '#FFFFFF' },
});
