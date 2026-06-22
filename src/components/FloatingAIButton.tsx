import { memo, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, shadows } from '../theme';

interface Props {
  onPress: () => void;
}

function FloatingAIButton({ onPress }: Props) {
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(1);
  const bottom = Platform.OS === 'ios' ? insets.bottom + 80 : insets.bottom + 76;

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[styles.container, { bottom }, animStyle]}>
      <TouchableOpacity onPress={onPress} style={styles.button} activeOpacity={0.85}>
        <Ionicons name="sparkles" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
});

export default memo(FloatingAIButton);
