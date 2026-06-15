import { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme';

interface Props { navigation: any }

interface Message { role: 'user' | 'ai'; text: string }

const SUGGESTED_PROMPTS = [
  'What crops grow best in loamy soil?',
  'When should I irrigate my rice field?',
  'How to control pest in cotton?',
  'Best fertilizers for wheat?',
  'Weather forecast for this week?',
];

export default function AIChatScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! I\'m your AI farming assistant. Ask me anything about crops, weather, irrigation, or pest management.' },
  ]);
  const [input, setInput] = useState('');
  const flatRef = useRef<FlatList>(null);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    const aiMsg: Message = { role: 'ai', text: getAIResponse(text.trim()) };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <LinearGradient colors={['#1E1B4B', '#312E81', '#4338CA']} style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <Text style={styles.headerSub}>Ask anything about your farm</Text>
      </LinearGradient>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.chatContent}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {item.role === 'ai' && <Text style={styles.aiIcon}>🤖</Text>}
            <Text style={[styles.bubbleText, item.role === 'user' ? styles.userText : styles.aiText]}>{item.text}</Text>
          </View>
        )}
        ListHeaderComponent={
          messages.length === 1 ? (
            <View style={styles.suggestions}>
              <Text style={styles.suggestTitle}>Try asking:</Text>
              <View style={styles.chipRow}>
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <TouchableOpacity key={i} style={styles.chip} onPress={() => send(p)}>
                    <Text style={styles.chipText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input} onChangeText={setInput}
          placeholder="Ask about your farm..."
          placeholderTextColor={colors.textLight}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => send(input)}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function getAIResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('rice') || lower.includes('paddy')) return '🌾 Rice (Paddy) thrives in clay loam soil with plenty of water. Recommended varieties: Samba Masuri, BPT 5204. Sow after sufficient rainfall.';
  if (lower.includes('wheat')) return '🌾 Wheat grows best in well-drained loamy soil. Sow between October-December. Use NPK 60:30:30 for good yield.';
  if (lower.includes('cotton') || lower.includes('pest')) return '🛡️ For cotton pest control, use neem oil spray for organic farming. For chemical control, consult your local agriculture officer. Monitor regularly for bollworms.';
  if (lower.includes('irrigation') || lower.includes('water')) return '💧 Check soil moisture before irrigating. Most crops need 2-3 cm of water per week. Drip irrigation saves 30-50% water compared to flood irrigation.';
  if (lower.includes('weather') || lower.includes('rain')) return '⛅ Based on current data, expect partly cloudy conditions this week with a 30% chance of light showers. Good time for planting.';
  if (lower.includes('fertilizer')) return '🧪 Use a balanced fertilizer like NPK 10-26-26 for most crops. Apply at sowing time. Organic compost at 10-15 tons/hectare improves soil health.';
  if (lower.includes('hello') || lower.includes('hi')) return '👋 Hello! I\'m your AI farming assistant. How can I help you today? Ask me about crops, pests, weather, or irrigation!';
  return '🤔 That\'s a great question! I recommend consulting your local agricultural extension officer for specific advice. In general, maintain good soil health with organic compost, monitor for pests weekly, and follow recommended irrigation schedules for your crop type.';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs },
  chatContent: { padding: spacing.md, paddingBottom: spacing.lg },
  bubble: { flexDirection: 'row', maxWidth: '80%', marginBottom: spacing.md, padding: spacing.md, borderRadius: radius.lg },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  aiIcon: { fontSize: 20, marginRight: spacing.sm },
  bubbleText: { fontSize: 14, lineHeight: 20, flex: 1 },
  userText: { color: '#FFFFFF' },
  aiText: { color: colors.text },
  suggestions: { marginBottom: spacing.md },
  suggestTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: '#EEF2FF', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: '#C7D2FE' },
  chipText: { fontSize: 13, color: '#4338CA' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.background, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 15, color: colors.text, marginRight: spacing.sm },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#FFFFFF', fontSize: 18 },
});
