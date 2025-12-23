import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../../physics/constants';

const GRID_LINES_HORIZONTAL = 20;
const GRID_LINES_VERTICAL = 12;
const PERSPECTIVE_VANISH_Y = GAME_HEIGHT * 0.5; // Horizon line at center

export function RetroGrid() {
  // Animate grid scrolling for that classic 80s effect
  const scrollOffset = useSharedValue(0);

  React.useEffect(() => {
    scrollOffset.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // Don't reverse
    );
  }, [scrollOffset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollOffset.value * 40 }],
  }));

  // Generate horizontal grid lines with perspective
  const horizontalLines = [];
  for (let i = 0; i < GRID_LINES_HORIZONTAL; i++) {
    const progress = i / GRID_LINES_HORIZONTAL;
    // Exponential spacing for perspective effect
    const y = PERSPECTIVE_VANISH_Y + Math.pow(progress, 1.5) * (GAME_HEIGHT - PERSPECTIVE_VANISH_Y);
    const opacity = 0.1 + progress * 0.2;
    const lineHeight = 1 + progress * 1;

    horizontalLines.push(
      <View
        key={`h-${i}`}
        style={[
          styles.horizontalLine,
          {
            top: y,
            opacity,
            height: lineHeight,
          },
        ]}
      />
    );
  }

  // Generate vertical grid lines with perspective
  const verticalLines = [];
  const centerX = GAME_WIDTH / 2;
  for (let i = -GRID_LINES_VERTICAL / 2; i <= GRID_LINES_VERTICAL / 2; i++) {
    const spreadFactor = Math.abs(i) / (GRID_LINES_VERTICAL / 2);
    const opacity = 0.15 - spreadFactor * 0.05;

    verticalLines.push(
      <View
        key={`v-${i}`}
        style={[
          styles.verticalLine,
          {
            left: centerX + i * (GAME_WIDTH / GRID_LINES_VERTICAL),
            opacity,
            transform: [
              { perspective: 500 },
              { rotateX: '60deg' },
            ],
          },
        ]}
      />
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Gradient overlay for horizon effect */}
      <View style={styles.horizonGradient} />

      {/* Animated grid lines */}
      <Animated.View style={[styles.gridContainer, animatedStyle]}>
        {horizontalLines}
      </Animated.View>

      {/* Vertical lines (static) */}
      <View style={styles.verticalContainer}>
        {verticalLines}
      </View>

      {/* Glow line at horizon */}
      <View style={styles.horizonLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  verticalContainer: {
    position: 'absolute',
    top: PERSPECTIVE_VANISH_Y,
    left: 0,
    right: 0,
    bottom: 0,
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORS.aiPaddle,
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.aiPaddle,
    opacity: 0.15,
  },
  horizonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PERSPECTIVE_VANISH_Y,
    backgroundColor: 'transparent',
  },
  horizonLine: {
    position: 'absolute',
    top: PERSPECTIVE_VANISH_Y,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.aiPaddle,
    opacity: 0.4,
    shadowColor: COLORS.aiPaddle,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
