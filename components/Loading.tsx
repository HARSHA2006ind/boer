import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';
import ImageBackground from '../theme/ImageBackground';

interface Props { fullScreen?: boolean; message?: string; variant?: 'farm' | 'splash' | 'weather' | 'ai' }

export default function Loading({ fullScreen, message, variant = 'farm' }: Props) {
  const content = (
    <View style={styles.content}>
      <ActivityIndicator size="large" color={variant === 'ai' ? '#818CF8' : colors.primaryLight} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
  if (fullScreen) {
    return (
      <ImageBackground variant={variant}>
        {content}
      </ImageBackground>
    );
  }
  return <View style={styles.standalone}>{content}</View>;
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  standalone: { padding: 32, alignItems: 'center' },
  text: { ...typography.body, color: '#FFFFFF', marginTop: 12, textAlign: 'center' },
});
