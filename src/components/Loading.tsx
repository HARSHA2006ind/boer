import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

interface Props { fullScreen?: boolean; message?: string }

export default function Loading({ fullScreen, message }: Props) {
  const content = (
    <View style={styles.content}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }
  return <View style={styles.standalone}>{content}</View>;
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  content: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  standalone: { padding: 32, alignItems: 'center' },
  text: { color: colors.textSecondary, marginTop: 12, textAlign: 'center', fontSize: 14 },
});
