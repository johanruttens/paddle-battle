import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../physics/constants';
import type { Difficulty } from '../config/levelConfig';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
};
const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#39ff14',
  medium: '#00ffff',
  hard: '#ff00ff',
};

export function MainMenuScreen() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const startGame = useGameStore((s) => s.startGame);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const highestLevelUnlocked = useGameStore((s) => s.highestLevelUnlocked);
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const loadSavedData = useGameStore((s) => s.loadSavedData);
  const isLoading = useGameStore((s) => s.isLoading);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  // Title glow animation
  const titleGlow = useSharedValue(0.5);

  useEffect(() => {
    titleGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [titleGlow]);

  const titleGlowStyle = useAnimatedStyle(() => ({
    textShadowRadius: 20 + titleGlow.value * 15,
    opacity: 0.8 + titleGlow.value * 0.2,
  }));

  const handleContinue = () => {
    startGame();
  };

  const handleLevelSelect = () => {
    navigateTo('levelSelect');
  };

  const handleStats = () => {
    navigateTo('stats');
  };

  const handleSettings = () => {
    navigateTo('settings');
  };

  const cycleDifficulty = () => {
    const currentIndex = DIFFICULTIES.indexOf(difficulty);
    const nextIndex = (currentIndex + 1) % DIFFICULTIES.length;
    setDifficulty(DIFFICULTIES[nextIndex]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.titleContainer}>
        <View style={styles.decorativeLine} />
        <Animated.Text style={[styles.title, titleGlowStyle]}>PADDLE</Animated.Text>
        <Animated.Text style={[styles.titleBattle, titleGlowStyle]}>BATTLE</Animated.Text>
        <View style={styles.decorativeLine} />
      </Animated.View>

      {/* Menu buttons */}
      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.menuContainer}>
        {/* Continue / Play button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {highestLevelUnlocked > 1 ? 'CONTINUE' : 'PLAY'}
          </Text>
          {highestLevelUnlocked > 1 && (
            <Text style={styles.levelIndicator}>LEVEL {currentLevel}</Text>
          )}
        </TouchableOpacity>

        {/* Level Select */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleLevelSelect}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>LEVEL SELECT</Text>
          <Text style={styles.progressIndicator}>
            {highestLevelUnlocked - 1}/100
          </Text>
        </TouchableOpacity>

        {/* Difficulty toggle */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={cycleDifficulty}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>DIFFICULTY</Text>
          <Text
            style={[
              styles.difficultyValue,
              { color: DIFFICULTY_COLORS[difficulty] },
            ]}
          >
            {DIFFICULTY_LABELS[difficulty]}
          </Text>
        </TouchableOpacity>

        {/* Stats */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleStats}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>STATISTICS</Text>
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSettings}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>SETTINGS</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>FIRST TO WIN · 100 LEVELS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  decorativeLine: {
    width: 200,
    height: 2,
    backgroundColor: COLORS.playerPaddle,
    marginVertical: 20,
    opacity: 0.5,
    shadowColor: COLORS.playerPaddle,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 52,
    fontWeight: '200',
    color: COLORS.playerPaddle,
    letterSpacing: 12,
    textShadowColor: COLORS.playerPaddle,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleBattle: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.aiPaddle,
    letterSpacing: 8,
    marginTop: -5,
    textShadowColor: COLORS.aiPaddle,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  menuContainer: {
    width: '100%',
    gap: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.playerPaddle,
    paddingVertical: 20,
    borderRadius: 4,
    alignItems: 'center',
    shadowColor: COLORS.playerPaddle,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.background,
    letterSpacing: 4,
  },
  levelIndicator: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.background,
    opacity: 0.7,
    marginTop: 4,
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  progressIndicator: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.playerPaddle,
    letterSpacing: 1,
  },
  difficultyValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 2,
  },
});
