import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { getTierColor, getBossName, getLevelTier } from '../config/levelConfig';
import { COLORS } from '../physics/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_GAP = 10;
const COLUMNS = 5;
const CELL_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

export function LevelSelectScreen() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const startLevel = useGameStore((s) => s.startLevel);
  const highestLevelUnlocked = useGameStore((s) => s.highestLevelUnlocked);
  const levelStars = useGameStore((s) => s.levelStars);
  const difficulty = useGameStore((s) => s.difficulty);

  // Group levels by tier
  const tiers = useMemo(() => [
    { name: 'BEGINNER', levels: Array.from({ length: 10 }, (_, i) => i + 1), color: '#39ff14' },
    { name: 'ROOKIE', levels: Array.from({ length: 15 }, (_, i) => i + 11), color: '#00ffff' },
    { name: 'CHALLENGER', levels: Array.from({ length: 25 }, (_, i) => i + 26), color: '#ff6b35' },
    { name: 'EXPERT', levels: Array.from({ length: 25 }, (_, i) => i + 51), color: '#ff00ff' },
    { name: 'MASTER', levels: Array.from({ length: 25 }, (_, i) => i + 76), color: '#9d00ff' },
  ], []);

  const handleLevelPress = (level: number) => {
    if (level <= highestLevelUnlocked) {
      startLevel(level);
    }
  };

  const renderStars = (level: number) => {
    const stars = levelStars[level] || 0;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              star <= stars ? styles.starFilled : styles.starEmpty,
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  const renderLevelCell = (level: number, tierColor: string) => {
    const isUnlocked = level <= highestLevelUnlocked;
    const isBoss = getBossName(level) !== null;
    const hasStars = (levelStars[level] || 0) > 0;

    return (
      <TouchableOpacity
        key={level}
        style={[
          styles.levelCell,
          isUnlocked ? styles.levelUnlocked : styles.levelLocked,
          isBoss && isUnlocked && styles.levelBoss,
          { borderColor: isUnlocked ? tierColor : 'rgba(255,255,255,0.1)' },
        ]}
        onPress={() => handleLevelPress(level)}
        disabled={!isUnlocked}
        activeOpacity={0.7}
      >
        {isUnlocked ? (
          <>
            <Text
              style={[
                styles.levelNumber,
                { color: isBoss ? '#ffd700' : tierColor },
              ]}
            >
              {level}
            </Text>
            {hasStars && renderStars(level)}
            {isBoss && <Text style={styles.bossIcon}>👑</Text>}
          </>
        ) : (
          <Text style={styles.lockIcon}>🔒</Text>
        )}
      </TouchableOpacity>
    );
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
        <Text style={styles.title}>SELECT LEVEL</Text>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{difficulty.toUpperCase()}</Text>
        </View>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(highestLevelUnlocked / 100) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {highestLevelUnlocked - 1}/100 COMPLETED
        </Text>
      </View>

      {/* Level grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tiers.map((tier, tierIndex) => (
          <Animated.View
            key={tier.name}
            entering={FadeInDown.delay(tierIndex * 100).duration(300)}
            style={styles.tierSection}
          >
            <View style={styles.tierHeader}>
              <View
                style={[styles.tierLine, { backgroundColor: tier.color }]}
              />
              <Text style={[styles.tierName, { color: tier.color }]}>
                {tier.name}
              </Text>
              <View
                style={[styles.tierLine, { backgroundColor: tier.color }]}
              />
            </View>

            <View style={styles.levelGrid}>
              {tier.levels.map((level) => renderLevelCell(level, tier.color))}
            </View>
          </Animated.View>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingBottom: 15,
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
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.playerPaddle,
    letterSpacing: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.playerPaddle,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: GRID_PADDING,
  },
  tierSection: {
    marginBottom: 25,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginHorizontal: 15,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  levelCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUnlocked: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  levelLocked: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  levelBoss: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 2,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  lockIcon: {
    fontSize: 16,
    opacity: 0.3,
  },
  bossIcon: {
    fontSize: 10,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  star: {
    fontSize: 8,
    marginHorizontal: 1,
  },
  starFilled: {
    color: '#ffd700',
  },
  starEmpty: {
    color: 'rgba(255,255,255,0.2)',
  },
  bottomPadding: {
    height: 40,
  },
});
