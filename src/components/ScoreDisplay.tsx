import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../physics/constants';

export function ScoreDisplay() {
  const playerScore = useGameStore((state) => state.playerScore);
  const aiScore = useGameStore((state) => state.aiScore);

  const playerScale = useSharedValue(1);
  const playerOpacity = useSharedValue(0.6);
  const aiScale = useSharedValue(1);
  const aiOpacity = useSharedValue(0.6);

  const prevPlayerScore = useRef(playerScore);
  const prevAiScore = useRef(aiScore);

  // Animate player score on change
  useEffect(() => {
    if (playerScore !== prevPlayerScore.current) {
      prevPlayerScore.current = playerScore;

      playerScale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );

      playerOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.6, { duration: 400 })
      );
    }
  }, [playerScore, playerScale, playerOpacity]);

  // Animate AI score on change
  useEffect(() => {
    if (aiScore !== prevAiScore.current) {
      prevAiScore.current = aiScore;

      aiScale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );

      aiOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.6, { duration: 400 })
      );
    }
  }, [aiScore, aiScale, aiOpacity]);

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playerScale.value }],
    opacity: playerOpacity.value,
  }));

  const aiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: aiScale.value }],
    opacity: aiOpacity.value,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Text style={[styles.aiScore, aiAnimatedStyle]}>
        {aiScore}
      </Animated.Text>
      <View style={styles.divider} />
      <Animated.Text style={[styles.playerScore, playerAnimatedStyle]}>
        {playerScore}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 30,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  aiScore: {
    fontSize: 72,
    fontWeight: '300',
    color: COLORS.aiPaddle,
    fontVariant: ['tabular-nums'],
    textShadowColor: COLORS.aiPaddle,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  playerScore: {
    fontSize: 72,
    fontWeight: '300',
    color: COLORS.playerPaddle,
    fontVariant: ['tabular-nums'],
    textShadowColor: COLORS.playerPaddle,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
