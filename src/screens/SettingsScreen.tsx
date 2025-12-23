import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { useGameStore } from '../store/gameStore';
import { useHaptics } from '../hooks/useHaptics';
import { useSound } from '../hooks/useSound';
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

export function SettingsScreen() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const vibrationEnabled = useGameStore((s) => s.vibrationEnabled);
  const setVibrationEnabled = useGameStore((s) => s.setVibrationEnabled);

  const { selectionFeedback } = useHaptics();
  const { playSound } = useSound();

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    selectionFeedback();
    playSound('menuSelect');
  };

  const handleVibrationToggle = (enabled: boolean) => {
    setVibrationEnabled(enabled);
    if (enabled) {
      selectionFeedback();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateTo('menu')}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <View style={styles.content}>
        {/* Difficulty Section */}
        <Animated.View entering={FadeInUp.delay(100).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>DIFFICULTY</Text>
          <View style={styles.difficultyButtons}>
            {DIFFICULTIES.map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  difficulty === diff && styles.difficultyButtonActive,
                  difficulty === diff && { borderColor: DIFFICULTY_COLORS[diff] },
                ]}
                onPress={() => handleDifficultyChange(diff)}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    difficulty === diff && { color: DIFFICULTY_COLORS[diff] },
                  ]}
                >
                  {DIFFICULTY_LABELS[diff]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.difficultyDescription}>
            {difficulty === 'easy' && 'Larger paddle, slower ball, easier AI'}
            {difficulty === 'medium' && 'Balanced gameplay for most players'}
            {difficulty === 'hard' && 'Smaller paddle, faster ball, smarter AI'}
          </Text>
        </Animated.View>

        {/* Sound Effects Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>SOUND EFFECTS</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>
                {sfxVolume === 0 ? 'OFF' : `${Math.round(sfxVolume * 100)}%`}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={sfxVolume}
                onValueChange={setSfxVolume}
                minimumTrackTintColor={COLORS.playerPaddle}
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbTintColor={COLORS.playerPaddle}
              />
            </View>
          </View>
        </Animated.View>

        {/* Music Section */}
        <Animated.View entering={FadeInUp.delay(300).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>MUSIC</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>
                {musicVolume === 0 ? 'OFF' : `${Math.round(musicVolume * 100)}%`}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={musicVolume}
                onValueChange={setMusicVolume}
                minimumTrackTintColor={COLORS.playerPaddle}
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbTintColor={COLORS.playerPaddle}
              />
            </View>
          </View>
          <Text style={styles.comingSoon}>Music coming soon!</Text>
        </Animated.View>

        {/* Vibration Section */}
        <Animated.View entering={FadeInUp.delay(400).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>HAPTIC FEEDBACK</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Vibration</Text>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleVibrationToggle}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: COLORS.playerPaddle }}
              thumbColor="#fff"
            />
          </View>
        </Animated.View>

        {/* Credits */}
        <Animated.View entering={FadeInUp.delay(500).duration(300)} style={styles.credits}>
          <Text style={styles.creditsText}>PADDLE BATTLE</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 3,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 15,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
  },
  difficultyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  difficultyDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 12,
  },
  sliderContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.playerPaddle,
    width: 50,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  comingSoon: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  credits: {
    marginTop: 'auto',
    paddingBottom: 40,
    alignItems: 'center',
  },
  creditsText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 3,
  },
  versionText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    marginTop: 4,
  },
});
