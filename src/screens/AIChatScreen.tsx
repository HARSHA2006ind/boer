import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, shadows } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { getAIProvider } from '../ai/aiProvider';
import { Farm } from '../types';
import { useWeather } from '../hooks/useWeather';
import { saveChatMessage, saveChatSession, getChatSessions, getChatMessages, searchChatSessions, deleteChatSession } from '../services/aiStorage';

interface Props { navigation: any }
interface Message { role: 'user' | 'ai'; text: string; image?: string; timestamp: number; sessionId?: string }

const SUGGESTED_PROMPTS = [
  'When should I irrigate?',
  'Why are my leaves turning yellow?',
  'Best fertilizer for cotton?',
  'Cotton market price today?',
];

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = 0; setDisplayed('');
    const interval = setInterval(() => {
      if (indexRef.current < text.length) { setDisplayed(text.slice(0, indexRef.current + 1)); indexRef.current++; }
      else clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [text]);
  return <Text style={styles.bubbleText}>{displayed}</Text>;
}

function generateSessionId() { return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

export default function AIChatScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hello! I'm Boer AI. Ask me anything about your farm — irrigation, pests, weather, or market prices.", timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const defaultFarm = farms[0];
  const weatherLocation = defaultFarm ? [defaultFarm.village, defaultFarm.district, defaultFarm.state].filter(Boolean).join(', ') : undefined;
  const { weather } = useWeather(weatherLocation, defaultFarm?.name);

  useEffect(() => { fetchFarms(); }, []);

  async function fetchFarms() {
    if (!user) return;
    try { const { data } = await supabase.from('farms').select('*').eq('user_id', user.id); if (data) setFarms(data); } catch {}
  }

  function buildContext() {
    if (farms.length === 0) return undefined;
    const ctx: any = { farms: farms.map(f => ({ name: f.name, location: [f.village, f.district, f.state].filter(Boolean).join(', '), soilType: f.soil_type, waterSource: f.water_source, currentCrop: f.current_crop })) };
    ctx.weather = { temperature: weather.temperature || 28, humidity: weather.humidity || 65, rainChance: weather.rainChance || 0, windSpeed: weather.windSpeed || 12, condition: weather.condition || 'Sunny' };
    return JSON.stringify(ctx);
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text: text.trim(), timestamp: Date.now(), sessionId };
    const updatedMessages = [...messagesRef.current, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    if (user) {
      const title = text.trim().slice(0, 60);
      await saveChatSession(user.id, sessionId, title);
      await saveChatMessage(user.id, sessionId, 'user', text.trim());
    }

    try {
      const provider = getAIProvider();
      const context = buildContext();
      const reply = await provider.chat(updatedMessages.map(m => ({ role: m.role, text: m.text })), context);
      const aiMsg: Message = { role: 'ai', text: reply, timestamp: Date.now(), sessionId };
      setMessages(prev => [...prev, aiMsg]);
      if (user) {
        await saveChatMessage(user.id, sessionId, 'ai', reply);
        await saveChatSession(user.id, sessionId, text.trim().slice(0, 60));
      }
    } catch {
      const errMsg: Message = { role: 'ai', text: 'Sorry, I encountered an error. Please try again.', timestamp: Date.now(), sessionId };
      setMessages(prev => [...prev, errMsg]);
    }
    setLoading(false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }

  async function loadSessionMessages(sid: string) {
    setShowHistory(false);
    if (user) {
      const msgs = await getChatMessages(sid);
      if (msgs.length > 0) {
        setMessages(msgs.map((m: any) => ({ role: m.role, text: m.text, image: m.image, timestamp: m.timestamp, sessionId: m.session_id })));
        setSessionId(sid);
        return;
      }
    }
    newChat();
  }

  function newChat() {
    setSessionId(generateSessionId());
    setMessages([{ role: 'ai', text: "Hello! I'm Boer AI. Ask me anything about your farm.", timestamp: Date.now() }]);
    setShowHistory(false);
  }

  async function openHistory() {
    if (!user) return;
    const s = await getChatSessions(user.id);
    setSessions(s);
    setSearchQuery('');
    setShowHistory(true);
  }

  async function searchSessions(q: string) {
    setSearchQuery(q);
    if (!user) return;
    if (!q.trim()) { const s = await getChatSessions(user.id); setSessions(s); return; }
    const s = await searchChatSessions(user.id, q);
    setSessions(s);
  }

  async function deleteSession(sid: string) {
    Alert.alert('Delete Chat', 'Delete this chat session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteChatSession(sid);
        if (sessionId === sid) newChat();
        openHistory();
      }},
    ]);
  }

  async function handleCamera() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Camera permission is required.'); return; }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true });
      if (!result.canceled && result.assets[0]) handleImage(result.assets[0]);
    } catch (e: any) { Alert.alert('Error', e.message || 'Camera failed'); }
  }

  async function handleGallery() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Gallery permission is required.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: true });
      if (!result.canceled && result.assets[0]) handleImage(result.assets[0]);
    } catch (e: any) { Alert.alert('Error', e.message || 'Gallery failed'); }
  }

  async function handleImage(asset: any) {
    const imgMsg: Message = { role: 'user', text: 'Analyzing this image...', image: asset.uri, timestamp: Date.now(), sessionId };
    setMessages(prev => [...prev, imgMsg]);
    setLoading(true);
    try {
      const provider = getAIProvider();
      const r = await provider.analyzeImage(asset.base64 || '', asset.mimeType || 'image/jpeg', 'Analyze for diseases and pests');
      let result;
      try { result = typeof r === 'string' ? JSON.parse(r) : r; } catch { result = { disease: 'Analysis complete', confidence: '—', symptoms: 'See details', action: r, prevention: 'Consult local expert' }; }
      const reply = `**Crop Analysis**\n\n**Disease:** ${result.disease}\n**Confidence:** ${result.confidence}\n\n**Symptoms:** ${result.symptoms}\n\n**Action:** ${result.action}\n\n**Prevention:** ${result.prevention}`;
      setMessages(prev => [...prev, { role: 'ai', text: reply, timestamp: Date.now(), sessionId }]);
    } catch { setMessages(prev => [...prev, { role: 'ai', text: 'Image analysis failed. Try a clearer image.', timestamp: Date.now(), sessionId }]); }
    setLoading(false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }

  const tabBarHeight = 68;
  const bottomPadding = Math.max(insets.bottom, 8) + tabBarHeight;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Boer AI</Text>
            <Text style={styles.headerSub}>{loading ? 'Thinking...' : 'Online'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={newChat} style={styles.headerBtn}>
              <Ionicons name="add-circle-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openHistory} style={styles.headerBtn}>
              <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList ref={flatRef} data={messages} keyExtractor={(_, i) => String(i)}
        contentContainerStyle={[styles.chatContent, { paddingBottom: bottomPadding + spacing.md }]} style={styles.list}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubbleWrap, item.role === 'user' && styles.userBubbleWrap]}>
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              {item.role === 'ai' && (
                <View style={styles.aiIcon}><Ionicons name="sparkles" size={14} color={colors.primary} /></View>
              )}
              <View style={styles.bubbleContent}>
                {item.role === 'ai' && !loading && messages.indexOf(item) === messages.length - 1 ?
                  <TypewriterText text={item.text} /> :
                  <Text style={[styles.bubbleText, item.role === 'user' && styles.userText]}>{item.text}</Text>
                }
                {item.image && <Image source={{ uri: item.image }} style={styles.chatImage} resizeMode="cover" />}
              </View>
            </View>
          </View>
        )}
        ListHeaderComponent={messages.length === 1 ? (
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeIconWrap}>
                <Ionicons name="sparkles" size={32} color={colors.primary} />
              </View>
              <Text style={styles.welcomeTitle}>How can I help you today?</Text>
              <View style={styles.promptGrid}>
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <TouchableOpacity key={i} style={styles.promptChip} onPress={() => send(p)}>
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.promptText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : null}
      />

      {loading && (
        <View style={styles.typingBar}>
          <View style={styles.typingDots}><Text style={styles.typingText}>Thinking</Text><Text style={styles.dot}>.</Text><Text style={styles.dot}>.</Text><Text style={styles.dot}>.</Text></View>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.inputBar, { paddingBottom: bottomPadding }]}>
          <TouchableOpacity style={styles.mediaBtn} onPress={handleCamera}>
            <Ionicons name="camera-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={handleGallery}>
            <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Ask anything about your farm..."
            placeholderTextColor={colors.textLight} onSubmitEditing={() => send(input)} returnKeyType="send" multiline />
          <TouchableOpacity style={[styles.sendBtn, loading && styles.sendBtnDisabled]} onPress={() => send(input)} disabled={loading}>
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + spacing.sm }]}>
            <Text style={styles.modalTitle}>Chat History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.modalClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput style={styles.searchInput} value={searchQuery} onChangeText={searchSessions}
              placeholder="Search chats..." placeholderTextColor={colors.textLight} />
          </View>
          <FlatList data={sessions} keyExtractor={(_, i) => String(i)} contentContainerStyle={{ padding: spacing.md }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.sessionItem} onPress={() => loadSessionMessages(item.session_id)}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.sessionDate}>{new Date(item.updated_at).toLocaleDateString()} · {item.message_count || 0} msgs</Text>
                </View>
                <TouchableOpacity onPress={() => deleteSession(item.session_id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.textLight} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No chat history</Text>}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  headerActions: { flexDirection: 'row', gap: spacing.xs },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1 },
  chatContent: { padding: spacing.md, paddingTop: spacing.lg },
  welcomeSection: { marginBottom: spacing.md },
  welcomeCard: { alignItems: 'center', paddingVertical: spacing.xl },
  welcomeIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  promptChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  promptText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  bubbleWrap: { marginBottom: spacing.sm, flexDirection: 'row' },
  userBubbleWrap: { justifyContent: 'flex-end' },
  bubble: { flexDirection: 'row', maxWidth: '85%', borderRadius: radius.xl, padding: spacing.md },
  userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
  aiBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: radius.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  aiIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  bubbleContent: { flex: 1 },
  bubbleText: { fontSize: 14, lineHeight: 21, color: colors.text, fontWeight: '500' },
  userText: { color: '#FFFFFF' },
  chatImage: { width: '100%', height: 160, borderRadius: radius.md, marginTop: spacing.sm },
  typingBar: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 1, paddingLeft: spacing.md },
  typingText: { fontSize: 13, color: colors.textLight, fontWeight: '500' },
  dot: { fontSize: 18, color: colors.textLight, fontWeight: '700' },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  mediaBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, backgroundColor: colors.secondary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 15, color: colors.text, maxHeight: 80 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: colors.textLight },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary, margin: spacing.md, borderRadius: radius.md, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: spacing.sm + 4, fontSize: 15, color: colors.text },
  sessionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },
  sessionDate: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  deleteBtn: { padding: spacing.sm },
  emptyText: { textAlign: 'center', color: colors.textLight, fontSize: 14, marginTop: spacing.xl },
});
