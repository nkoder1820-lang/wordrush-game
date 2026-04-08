import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { RootStackParamList } from '../types';
import { questions, isTextInput, getLetterHint } from '../data/questions';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function GameScreen({ navigation, route }: Props) {
  const duration = route.params.duration;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const inputRef = useRef<TextInput>(null);

  const currentQuestion = questions[questionIndex % questions.length];

  const navigateToResult = useCallback((finalScore: number) => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    navigation.replace('Result', { score: finalScore });
  }, [navigation]);

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => navigateToResult(scoreRef.current), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [navigateToResult]);

  const handleAnswer = useCallback((answer: string) => {
    if (gameOverRef.current || feedback !== null) return;

    const correct =
      answer.trim().toUpperCase() === currentQuestion.answer.toUpperCase();

    if (correct) {
      const newScore = scoreRef.current + 10;
      scoreRef.current = newScore;
      setScore(newScore);
    }

    setFeedback(correct ? 'correct' : 'wrong');
    setUserInput('');
    Keyboard.dismiss();

    feedbackTimerRef.current = setTimeout(() => {
      if (gameOverRef.current) return;
      setFeedback(null);
      setHintText(null);
      setHintUsed(false);
      setQuestionIndex((prev) => prev + 1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 300);
  }, [feedback, currentQuestion]);

  const handleSubmit = useCallback(() => {
    if (userInput.trim().length > 0) {
      handleAnswer(userInput);
    }
  }, [userInput, handleAnswer]);

  const handleHint = useCallback(() => {
    if (hintUsed || feedback !== null) return;
    setHintUsed(true);

    if (currentQuestion.type === 'riddle' && currentQuestion.hint) {
      setHintText(`💡 ${currentQuestion.hint}`);
    } else {
      setHintText(`💡 ${getLetterHint(currentQuestion.answer)}`);
    }
  }, [hintUsed, feedback, currentQuestion]);

  const getQuestionLabel = () => {
    switch (currentQuestion.type) {
      case 'unscramble': return 'Unscramble the word:';
      case 'wrong_letter': return 'Fix the spelling:';
      case 'missing_vowel': return 'Fill in the vowels:';
      case 'classifier': return 'What part of speech?';
      case 'grammar': return 'Is this sentence correct?';
      case 'riddle': return '🧩 Riddle:';
      default: return '';
    }
  };

  const timerColor =
    timeLeft <= 5
      ? theme.colors.error
      : timeLeft <= 10
      ? theme.colors.accent
      : theme.colors.text;

  const showHintButton = isTextInput(currentQuestion.type) && !hintUsed && feedback === null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>⏱ TIME</Text>
          <Text style={[styles.timerValue, { color: timerColor }]}>{timeLeft}s</Text>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationBadgeText}>{duration}s Sprint</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>🏆 SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Question Area */}
        <View style={styles.questionArea}>
          <Text style={styles.questionLabel}>{getQuestionLabel()}</Text>
          <Text style={[styles.questionText, currentQuestion.type === 'riddle' && styles.riddleText]}>
            {currentQuestion.question}
          </Text>

          {/* Inline Hint */}
          {hintText && (
            <Text style={styles.hintText}>{hintText}</Text>
          )}
        </View>

        {/* Answer Area */}
        <View style={styles.answerArea}>
          {isTextInput(currentQuestion.type) ? (
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Type your answer..."
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="characters"
                autoCorrect={false}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
                editable={feedback === null}
              />
              <View style={styles.buttonRow}>
                {showHintButton && (
                  <TouchableOpacity
                    style={styles.hintButton}
                    onPress={handleHint}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.hintButtonText}>💡 HINT</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    showHintButton && styles.submitButtonWithHint,
                    userInput.trim().length === 0 && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={0.7}
                  disabled={userInput.trim().length === 0 || feedback !== null}
                >
                  <Text style={styles.submitButtonText}>SUBMIT</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionButton,
                    currentQuestion.options!.length === 2
                      ? styles.optionButtonWide
                      : styles.optionButtonHalf,
                  ]}
                  onPress={() => handleAnswer(option)}
                  activeOpacity={0.7}
                  disabled={feedback !== null}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Feedback */}
      {feedback !== null && (
        <View
          style={[
            styles.feedbackContainer,
            feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}
        >
          <Text style={styles.feedbackText}>
            {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  timerContainer: {
    alignItems: 'flex-start',
  },
  timerLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
  },
  durationBadge: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  durationBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  questionArea: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  questionLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  questionText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 48,
  },
  riddleText: {
    fontSize: theme.fontSize.xl,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    lineHeight: 36,
    color: theme.colors.highlight,
  },
  hintText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.accent,
    fontWeight: '600',
    marginTop: theme.spacing.md,
    textAlign: 'center',
    letterSpacing: 2,
  },
  answerArea: {
    paddingBottom: theme.spacing.lg,
  },
  inputContainer: {
    gap: theme.spacing.md,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    textAlign: 'center',
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  hintButton: {
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accent,
    flex: 1,
  },
  hintButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 1,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flex: 1,
  },
  submitButtonWithHint: {
    flex: 2,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.surfaceLight,
  },
  submitButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  optionButtonHalf: {
    width: '47%',
  },
  optionButtonWide: {
    width: '47%',
  },
  optionText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 100,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  feedbackWrong: {
    backgroundColor: 'rgba(239, 83, 80, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  feedbackText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
});
