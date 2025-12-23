import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, runOnUI } from 'react-native-reanimated';
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { ScoreDisplay } from './ScoreDisplay';
import { RetroGrid } from './effects/RetroGrid';
import { Scanlines } from './effects/Scanlines';
import { useGameLoop, GameEventCallbacks } from '../hooks/useGameLoop';
import { usePaddleControl } from '../hooks/usePaddleControl';
import { useScreenShake } from '../hooks/useScreenShake';
import { useSound } from '../hooks/useSound';
import { useHaptics } from '../hooks/useHaptics';
import { useGameStore } from '../store/gameStore';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../physics/constants';

interface GameBoardProps {
  onResetGame: () => void;
}

export function GameBoard({ onResetGame }: GameBoardProps) {
  const status = useGameStore((state) => state.status);
  const isPlaying = status === 'playing';

  const { shakeX, shakeY, triggerShake } = useScreenShake();
  const { playSound } = useSound();
  const { trigger: triggerHaptic } = useHaptics();

  // Event callbacks for game loop
  const eventCallbacks: GameEventCallbacks = useMemo(() => ({
    onPaddleHit: (isPlayer: boolean) => {
      playSound('paddleHit');
      triggerHaptic(isPlayer ? 'medium' : 'light');
      // Trigger screen shake (needs to run on UI thread)
      runOnUI(() => {
        'worklet';
        triggerShake(isPlayer ? 8 : 4);
      })();
    },
    onWallBounce: () => {
      playSound('wallBounce');
      triggerHaptic('light');
    },
    onPlayerScore: () => {
      playSound('playerScore');
      triggerHaptic('success');
      runOnUI(() => {
        'worklet';
        triggerShake(12);
      })();
    },
    onAIScore: () => {
      playSound('aiScore');
      triggerHaptic('error');
      runOnUI(() => {
        'worklet';
        triggerShake(15);
      })();
    },
  }), [playSound, triggerHaptic, triggerShake]);

  const {
    ballX,
    ballY,
    playerPaddleX,
    aiPaddleX,
    playerPaddleY,
    aiPaddleY,
    resetGameState,
  } = useGameLoop(eventCallbacks);

  const { panGesture } = usePaddleControl({
    paddleX: playerPaddleX,
    screenWidth: GAME_WIDTH,
    enabled: isPlaying,
  });

  // Expose reset function
  React.useEffect(() => {
    if (status === 'idle') {
      resetGameState();
    }
  }, [status, resetGameState]);

  // Play game start sound when game starts
  React.useEffect(() => {
    if (status === 'playing') {
      playSound('gameStart');
    }
  }, [status, playSound]);

  // Screen shake animation style
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { translateY: shakeY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.outerContainer}>
        <Animated.View style={[styles.container, shakeStyle]}>
          {/* Retro grid background */}
          <RetroGrid />

          {/* Center line */}
          <View style={styles.centerLine} />

          {/* Score display */}
          <ScoreDisplay />

          {/* AI Paddle (top) */}
          <Paddle x={aiPaddleX} y={aiPaddleY} color={COLORS.aiPaddle} />

          {/* Player Paddle (bottom) */}
          <Paddle x={playerPaddleX} y={playerPaddleY} color={COLORS.playerPaddle} />

          {/* Ball */}
          <Ball x={ballX} y={ballY} />

          {/* Scanline overlay */}
          <Scanlines />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.centerLine,
  },
});
