import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_BORDER_RADIUS } from '../physics/constants';

interface PaddleProps {
  x: SharedValue<number>;
  y: number;
  color: string;
}

export function Paddle({ x, y, color }: PaddleProps) {
  // Track velocity for glow intensity
  const prevX = useSharedValue(0);
  const velocity = useSharedValue(0);

  useDerivedValue(() => {
    velocity.value = Math.abs(x.value - prevX.value);
    prevX.value = x.value;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  // Glow intensity based on movement
  const glowStyle = useAnimatedStyle(() => {
    const glowIntensity = interpolate(
      Math.min(velocity.value, 15),
      [0, 15],
      [0.3, 0.8]
    );
    return {
      opacity: glowIntensity,
    };
  });

  return (
    <Animated.View style={[styles.container, { top: y }, animatedStyle]}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.outerGlow,
          { backgroundColor: color },
          glowStyle,
        ]}
      />
      {/* Inner glow */}
      <View style={[styles.innerGlow, { backgroundColor: color }]} />
      {/* Core paddle */}
      <View
        style={[
          styles.core,
          {
            backgroundColor: color,
            shadowColor: color,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: PADDLE_WIDTH + 20,
    height: PADDLE_HEIGHT + 16,
    borderRadius: PADDLE_BORDER_RADIUS + 8,
    opacity: 0.3,
  },
  innerGlow: {
    position: 'absolute',
    width: PADDLE_WIDTH + 8,
    height: PADDLE_HEIGHT + 6,
    borderRadius: PADDLE_BORDER_RADIUS + 3,
    opacity: 0.5,
  },
  core: {
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    borderRadius: PADDLE_BORDER_RADIUS,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
});
