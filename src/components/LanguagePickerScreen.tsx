import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext';

const PRIMARY_LANGS = LANGUAGES.filter(l => ['ta', 'en', 'hi', 'te', 'kn', 'ml'].includes(l.code));

export default function LanguagePickerScreen() {
  const { setLanguage, dismissPicker } = useLanguage();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
        <Text style={styles.title}>Choose Language</Text>
        <Text style={styles.subtitle}>Select your preferred language</Text>

        <View style={styles.list}>
          {PRIMARY_LANGS.map((lang, i) => (
            <Animated.View key={lang.code} entering={FadeIn.duration(300).delay(100 + i * 60)}>
              <TouchableOpacity
                style={styles.langOption}
                onPress={() => setLanguage(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.langNative}>{lang.native}</Text>
                <Text style={styles.langName}>{lang.name}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={dismissPicker}>
          <Text style={styles.skipText}>Continue in English</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, width: '100%', maxWidth: 360, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3, marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginBottom: 24 },
  list: { width: '100%', gap: 8 },
  langOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#F5F3EF', borderRadius: 12 },
  langNative: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  langName: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  skipBtn: { marginTop: 20, paddingVertical: 8 },
  skipText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
});
