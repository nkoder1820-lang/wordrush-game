import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../theme';

type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  Result: { score: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <View style={styles.content}>
        <Text style={styles.emoji}>⚡</Text>
        <Text style={styles.title}>30 Sec Sprint</Text>
        <Text style={styles.subtitle}>Beat others in 30 seconds</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>
          Unscramble words, fix spelling, fill vowels, and classify grammar — all in 30 seconds!
        </Text>
      </View>
      <TouchableOpacity
        style={styles.startButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.startButtonText}>START</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>WordRush</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.hero,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginVertical: theme.spacing.lg,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl + 20,
    borderRadius: theme.borderRadius.xl,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 3,
  },
  footer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    opacity: 0.5,
  },
});
