import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: any;
}

export default function SafeScreen({ children, style }: Props) {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 36 : 0);
  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: insets.bottom + 70 }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
