import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSound } from '../hooks/useSound';
import { useHaptics } from '../hooks/useHaptics';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
} from 'react-native-reanimated';
import { GameBoard } from '../components/GameBoard';
import { useGameStore } from '../store/gameStore';
import { getBossName, getTierColor } from '../config/levelConfig';
import { COLORS } from '../physics/constants';

export function GameScreen() {
  const status = useGameStore((s) => s.status);
  const winner = useGameStore((s) => s.winner);
  const { playSound } = useSound();
  const { trigger: triggerHaptic } = useHaptics();

  // Play game over sounds
  useEffect(() => {
    if (status === 'gameOver') {
      if (winner === 'player') {
        playSound('gameWin');
        playSound('levelUp');
        triggerHaptic('success');
      } else {
        playSound('gameLose');
        triggerHaptic('error');
      }
    }
  }, [status, winner, playSound, triggerHaptic]);
  const playerScore = useGameStore((s) => s.playerScore);
  const aiScore = useGameStore((s) => s.aiScore);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const levelConfig = useGameStore((s) => s.levelConfig);
  const levelStars = useGameStore((s) => s.levelStars);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const navigateTo = useGameStore((s) => s.navigateTo);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const startLevel = useGameStore((s) => s.startLevel);

  const bossName = getBossName(currentLevel);
  const tierColor = getTierColor(currentLevel);
  const earnedStars = levelStars[currentLevel] || 0;
  const targetScore = levelConfig?.targetScore || 5;

  const handlePause = useCallback(() => {
    pauseGame();
  }, [pauseGame]);

  const handleResume = useCallback(() => {
    resumeGame();
  }, [resumeGame]);

  const handleRetry = useCallback(() => {
    startLevel(currentLevel);
  }, [startLevel, currentLevel]);

  const handleNextLevel = useCallback(() => {
    nextLevel();
  }, [nextLevel]);

  const handleQuit = useCallback(() => {
    navigateTo('menu');
  }, [navigateTo]);

  const handleLevelSelect = useCallback(() => {
    navigateTo('levelSelect');
  }, [navigateTo]);

  // Calculate stars earned this game
  const calculateNewStars = (): number => {
    if (winner !== 'player') return 0;
    if (aiScore === 0) return 3; // Perfect
    if (playerScore - aiScore >= Math.floor(targetScore / 2)) return 2;
    return 1;
  };

  const newStars = calculateNewStars();

  return (
    <View style={styles.container}>
      <GameBoard onResetGame={handleQuit} />

      {/* Level indicator */}
      {status === 'playing' && (
        <View style={styles.levelIndicator}>
          <Text style={[styles.levelText, { color: tierColor }]}>
            {bossName ? `BOSS: ${bossName}` : `LEVEL ${currentLevel}`}
          </Text>
          <Text style={styles.targetText}>FIRST TO {targetScore}</Text>
        </View>
      )}

      {/* Pause Button */}
      {status === 'playing' && (
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={handlePause}
          activeOpacity={0.7}
        >
          <View style={styles.pauseIcon}>
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </View>
        </TouchableOpacity>
      )}

      {/* Pause Overlay */}
      {status === 'paused' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <Animated.Text entering={SlideInUp.springify()} style={styles.pauseTitle}>
            PAUSED
          </Animated.Text>

          <Text style={styles.levelPausedText}>LEVEL {currentLevel}</Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleResume}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>RESTART</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleQuit}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>QUIT</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Game Over Overlay */}
      {status === 'gameOver' && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <Animated.Text
            entering={SlideInUp.springify()}
            style={[
              styles.gameOverTitle,
              winner === 'player' ? styles.winTitle : styles.loseTitle,
            ]}
          >
            {winner === 'player' ? 'VICTORY!' : 'DEFEATED'}
          </Animated.Text>

          <Text style={[styles.levelCompleteText, { color: tierColor }]}>
            LEVEL {currentLevel}
          </Text>

          {/* Score display */}
          <View style={styles.scoreContainer}>
            <Text style={[styles.finalScoreNumber, styles.playerFinalScore]}>
              {playerScore}
            </Text>
            <Text style={styles.scoreDash}>-</Text>
            <Text style={[styles.finalScoreNumber, styles.aiFinalScore]}>
              {aiScore}
            </Text>
          </View>

          {/* Stars earned (only on win) */}
          {winner === 'player' && (
            <View style={styles.starsContainer}>
              {[1, 2, 3].map((star) => (
                <Text
                  key={star}
                  style={[
                    styles.star,
                    star <= newStars ? styles.starEarned : styles.starEmpty,
                  ]}
                >
                  ★
                </Text>
              ))}
            </View>
          )}

          <View style={styles.buttonGroup}>
            {winner === 'player' && currentLevel < 100 ? (
              <TouchableOpacity
                style={styles.button}
                onPress={handleNextLevel}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>NEXT LEVEL</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={handleRetry}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {winner === 'player' ? 'PLAY AGAIN' : 'TRY AGAIN'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleLevelSelect}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>LEVEL SELECT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.tertiaryButton]}
              onPress={handleQuit}
              activeOpacity={0.8}
            >
              <Text style={styles.tertiaryButtonText}>MAIN MENU</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  levelIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'flex-end',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  targetText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginTop: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pauseTitle: {
    fontSize: 44,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 8,
    marginBottom: 10,
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  levelPausedText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 40,
  },
  gameOverTitle: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 10,
  },
  winTitle: {
    color: COLORS.playerPaddle,
    textShadowColor: COLORS.playerPaddle,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  loseTitle: {
    color: COLORS.aiPaddle,
    textShadowColor: COLORS.aiPaddle,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  levelCompleteText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  finalScoreNumber: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  playerFinalScore: {
    color: COLORS.playerPaddle,
    textShadowColor: COLORS.playerPaddle,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  aiFinalScore: {
    color: COLORS.aiPaddle,
    textShadowColor: COLORS.aiPaddle,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  scoreDash: {
    fontSize: 40,
    fontWeight: '200',
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 8,
  },
  star: {
    fontSize: 32,
  },
  starEarned: {
    color: '#ffd700',
    textShadowColor: '#ffd700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  starEmpty: {
    color: 'rgba(255,255,255,0.2)',
  },
  buttonGroup: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.playerPaddle,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 4,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: COLORS.playerPaddle,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
    letterSpacing: 3,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowOpacity: 0,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
  },
  tertiaryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
  },
  pauseButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
  },
});
