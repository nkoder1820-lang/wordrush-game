import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../theme';

type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  Result: { score: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

interface LeaderboardEntry {
  name: string;
  score: number;
  isPlayer: boolean;
}

const BOT_ENTRIES: { name: string; score: number }[] = [
  { name: 'WordKing', score: 140 },
  { name: 'RiyaPro', score: 120 },
  { name: 'Aman_21', score: 100 },
  { name: 'FastThinker', score: 80 },
  { name: 'LexMaster', score: 50 },
];

export default function ResultScreen({ route, navigation }: Props) {
  const playerScore = route.params.score;

  const { leaderboard, playerRank } = useMemo(() => {
    const entries: LeaderboardEntry[] = [
      ...BOT_ENTRIES.map((b) => ({ ...b, isPlayer: false })),
      { name: 'You', score: playerScore, isPlayer: true },
    ];
    entries.sort((a, b) => b.score - a.score);
    const rank = entries.findIndex((e) => e.isPlayer) + 1;
    return { leaderboard: entries, playerRank: rank };
  }, [playerScore]);

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPerformanceMessage = () => {
    if (playerRank === 1) return "🔥 You're #1! Unstoppable!";
    if (playerRank <= 3) return '💪 Great job! Top 3!';
    if (playerScore >= 50) return '👍 Nice effort! Keep practicing!';
    return '🎯 Keep going! You can do better!';
  };

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <View
      style={[
        styles.leaderboardRow,
        item.isPlayer && styles.leaderboardRowHighlight,
      ]}
    >
      <Text
        style={[
          styles.rankText,
          item.isPlayer && styles.highlightText,
        ]}
      >
        {getRankEmoji(index + 1)}
      </Text>
      <Text
        style={[
          styles.nameText,
          item.isPlayer && styles.highlightText,
        ]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <Text
        style={[
          styles.scoreText,
          item.isPlayer && styles.highlightText,
        ]}
      >
        {item.score}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Score Display */}
      <View style={styles.scoreSection}>
        <Text style={styles.resultsTitle}>Results</Text>
        <Text style={styles.scoreValue}>{playerScore}</Text>
        <Text style={styles.scoreLabel}>points</Text>
        <Text style={styles.rankBadge}>Rank #{playerRank}</Text>
        <Text style={styles.performanceMsg}>{getPerformanceMessage()}</Text>
      </View>

      {/* Leaderboard */}
      <View style={styles.leaderboardSection}>
        <Text style={styles.leaderboardTitle}>🏆 Leaderboard</Text>
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Play Again */}
      <TouchableOpacity
        style={styles.playAgainButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.playAgainText}>PLAY AGAIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  resultsTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '800',
    color: theme.colors.primary,
    lineHeight: 80,
  },
  scoreLabel: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  rankBadge: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.accent,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  performanceMsg: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  leaderboardSection: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  leaderboardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  leaderboardRowHighlight: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  rankText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    width: 45,
  },
  nameText: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  scoreText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  highlightText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  playAgainButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  playAgainText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 2,
  },
});
