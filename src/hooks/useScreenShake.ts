import { useSharedValue, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { useCallback } from 'react';

export function useScreenShake() {
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);

  const triggerShake = useCallback((intensity: number = 5) => {
    'worklet';
    const duration = 50;

    shakeX.value = withSequence(
      withTiming(intensity, { duration, easing: Easing.linear }),
      withTiming(-intensity, { duration, easing: Easing.linear }),
      withTiming(intensity * 0.5, { duration, easing: Easing.linear }),
      withTiming(0, { duration, easing: Easing.linear })
    );

    shakeY.value = withSequence(
      withTiming(-intensity * 0.5, { duration, easing: Easing.linear }),
      withTiming(intensity * 0.5, { duration, easing: Easing.linear }),
      withTiming(0, { duration, easing: Easing.linear })
    );
  }, [shakeX, shakeY]);

  return {
    shakeX,
    shakeY,
    triggerShake,
  };
}
