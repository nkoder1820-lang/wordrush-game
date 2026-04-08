import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.content}>
        <Text style={styles.title}>WordRush</Text>
        <Text style={styles.subtitle}>Test your English skills</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.modeButton, styles.sprintButton]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SprintSetup')}
        >
          <Text style={styles.modeEmoji}>⚡</Text>
          <Text style={styles.modeTitle}>Sprint Mode</Text>
          <Text style={styles.modeDesc}>Race against the clock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, styles.scrollButton]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Scroll')}
        >
          <Text style={styles.modeEmoji}>📱</Text>
          <Text style={styles.modeTitle}>Scroll Mode</Text>
          <Text style={styles.modeDesc}>Endless practice feed</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>WordRush v2.0</Text>
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
  title: {
    fontSize: theme.fontSize.hero,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: 2,
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
    marginTop: theme.spacing.lg,
  },
  buttonsContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  modeButton: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sprintButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  scrollButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  modeEmoji: {
    fontSize: 36,
    marginBottom: theme.spacing.sm,
  },
  modeTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 1,
  },
  modeDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    opacity: 0.5,
  },
});
