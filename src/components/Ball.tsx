import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { BALL_RADIUS, COLORS } from '../physics/constants';

interface BallProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
}

const TRAIL_COUNT = 5;
const TRAIL_DELAY = 2; // frames

export function Ball({ x, y }: BallProps) {
  // Store previous positions for trail effect
  const trailPositions = Array.from({ length: TRAIL_COUNT }, () => ({
    x: useSharedValue(0),
    y: useSharedValue(0),
  }));

  // Update trail positions with delay
  const frameCount = useSharedValue(0);

  useDerivedValue(() => {
    frameCount.value += 1;

    // Shift trail positions every few frames
    if (frameCount.value % TRAIL_DELAY === 0) {
      for (let i = TRAIL_COUNT - 1; i > 0; i--) {
        trailPositions[i].x.value = trailPositions[i - 1].x.value;
        trailPositions[i].y.value = trailPositions[i - 1].y.value;
      }
      trailPositions[0].x.value = x.value;
      trailPositions[0].y.value = y.value;
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value - BALL_RADIUS },
      { translateY: y.value - BALL_RADIUS },
    ],
  }));

  // Trail elements
  const trailElements = trailPositions.map((pos, index) => {
    const opacity = (TRAIL_COUNT - index) / (TRAIL_COUNT * 2.5);
    const scale = 1 - index * 0.12;

    const trailStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: pos.x.value - BALL_RADIUS * scale },
        { translateY: pos.y.value - BALL_RADIUS * scale },
        { scale },
      ],
      opacity,
    }));

    return (
      <Animated.View
        key={`trail-${index}`}
        style={[styles.trailBall, trailStyle]}
      />
    );
  });

  return (
    <>
      {/* Trail */}
      {trailElements}

      {/* Main ball with glow */}
      <Animated.View style={[styles.ballContainer, animatedStyle]}>
        {/* Outer glow */}
        <View style={styles.outerGlow} />
        {/* Inner glow */}
        <View style={styles.innerGlow} />
        {/* Core */}
        <View style={styles.core} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  ballContainer: {
    position: 'absolute',
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: BALL_RADIUS * 3,
    height: BALL_RADIUS * 3,
    borderRadius: BALL_RADIUS * 1.5,
    backgroundColor: COLORS.ball,
    opacity: 0.15,
  },
  innerGlow: {
    position: 'absolute',
    width: BALL_RADIUS * 2.2,
    height: BALL_RADIUS * 2.2,
    borderRadius: BALL_RADIUS * 1.1,
    backgroundColor: COLORS.ball,
    opacity: 0.3,
  },
  core: {
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    backgroundColor: COLORS.ball,
    shadowColor: COLORS.ball,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  trailBall: {
    position: 'absolute',
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    backgroundColor: COLORS.ball,
  },
});
