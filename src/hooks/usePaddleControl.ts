import { Gesture } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import { PADDLE_WIDTH } from '../physics/constants';

interface UsePaddleControlProps {
  paddleX: SharedValue<number>;
  screenWidth: number;
  enabled: boolean;
}

export function usePaddleControl({
  paddleX,
  screenWidth,
  enabled,
}: UsePaddleControlProps) {
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((event) => {
      'worklet';
      // Map touch position to paddle center
      let newX = event.absoluteX - PADDLE_WIDTH / 2;

      // Clamp to screen bounds
      newX = Math.max(0, Math.min(newX, screenWidth - PADDLE_WIDTH));

      paddleX.value = newX;
    });

  return { panGesture };
}
