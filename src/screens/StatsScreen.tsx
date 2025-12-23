import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { loadStats, loadHighScores, type PlayerStats, type HighScoreEntry } from '../store/storage';
import { COLORS } from '../physics/constants';

export function StatsScreen() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const [loadedStats, loadedScores] = await Promise.all([
        loadStats(),
        loadHighScores(),
      ]);
      setStats(loadedStats);
      setHighScores(loadedScores);
    };
    load();
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getWinRate = (): string => {
    if (!stats || stats.totalGamesPlayed === 0) return '0%';
    const rate = (stats.totalWins / stats.totalGamesPlayed) * 100;
    return `${rate.toFixed(1)}%`;
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    );
  }

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
        <Text style={styles.title}>STATISTICS</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main stats grid */}
        <Animated.View entering={FadeInUp.delay(100).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          <View style={styles.statsGrid}>
            <StatBox
              label="GAMES PLAYED"
              value={stats.totalGamesPlayed.toString()}
              color={COLORS.playerPaddle}
            />
            <StatBox
              label="WIN RATE"
              value={getWinRate()}
              color="#39ff14"
            />
            <StatBox
              label="LEVELS COMPLETED"
              value={stats.levelsCompleted.toString()}
              color="#ff6b35"
            />
            <StatBox
              label="PERFECT GAMES"
              value={stats.perfectLevels.toString()}
              color="#ffd700"
            />
          </View>
        </Animated.View>

        {/* Win/Loss stats */}
        <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>RECORD</Text>
          <View style={styles.statsGrid}>
            <StatBox
              label="WINS"
              value={stats.totalWins.toString()}
              color="#39ff14"
            />
            <StatBox
              label="LOSSES"
              value={stats.totalLosses.toString()}
              color={COLORS.aiPaddle}
            />
            <StatBox
              label="BEST STREAK"
              value={stats.bestWinStreak.toString()}
              color={COLORS.playerPaddle}
            />
            <StatBox
              label="CURRENT STREAK"
              value={stats.currentWinStreak.toString()}
              color="#ff6b35"
            />
          </View>
        </Animated.View>

        {/* Points stats */}
        <Animated.View entering={FadeInUp.delay(300).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>POINTS</Text>
          <View style={styles.statsRow}>
            <View style={styles.pointsStat}>
              <Text style={[styles.pointsValue, { color: COLORS.playerPaddle }]}>
                {stats.totalPointsScored}
              </Text>
              <Text style={styles.pointsLabel}>SCORED</Text>
            </View>
            <Text style={styles.pointsDivider}>-</Text>
            <View style={styles.pointsStat}>
              <Text style={[styles.pointsValue, { color: COLORS.aiPaddle }]}>
                {stats.totalPointsAgainst}
              </Text>
              <Text style={styles.pointsLabel}>AGAINST</Text>
            </View>
          </View>
        </Animated.View>

        {/* High scores */}
        {highScores.length > 0 && (
          <Animated.View entering={FadeInUp.delay(400).duration(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>HIGH SCORES</Text>
            <View style={styles.highScoresList}>
              {highScores.slice(0, 5).map((score, index) => (
                <View key={index} style={styles.highScoreRow}>
                  <Text style={styles.highScoreRank}>#{index + 1}</Text>
                  <Text style={styles.highScoreName}>{score.name}</Text>
                  <Text style={styles.highScoreLevel}>LVL {score.level}</Text>
                  <Text style={styles.highScoreValue}>{score.score}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  color: string;
}

function StatBox({ label, value, color }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 100,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pointsStat: {
    alignItems: 'center',
    flex: 1,
  },
  pointsValue: {
    fontSize: 40,
    fontWeight: '200',
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginTop: 4,
  },
  pointsDivider: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
  },
  highScoresList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  highScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  highScoreRank: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    width: 40,
  },
  highScoreName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  highScoreLevel: {
    fontSize: 12,
    color: COLORS.playerPaddle,
    marginRight: 15,
  },
  highScoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd700',
  },
  bottomPadding: {
    height: 40,
  },
});
