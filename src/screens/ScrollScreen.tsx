import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Dimensions,
  Keyboard,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { RootStackParamList } from '../types';
import { questions, isTextInput, getLetterHint, Question } from '../data/questions';

type Props = NativeStackScreenProps<RootStackParamList, 'Scroll'>;

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HEADER_HEIGHT = 70;
const PROGRESS_HEIGHT = 4;
const CARD_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - PROGRESS_HEIGHT;

const POOL_SIZE = 1000;
const questionPool: number[] = Array.from({ length: POOL_SIZE }, (_, i) => i % questions.length);

const LEVEL_THRESHOLD = 10;

// ───── Main Screen ─────

export default function ScrollScreen({ navigation }: Props) {
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelProgress, setLevelProgress] = useState(0);
  const [answeredSet, setAnsweredSet] = useState<Set<number>>(new Set());

  // Overlays
  const [comboText, setComboText] = useState<string | null>(null);
  const [egoText, setEgoText] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const comboOpacity = useRef(new Animated.Value(0)).current;
  const comboScale = useRef(new Animated.Value(0.5)).current;
  const egoOpacity = useRef(new Animated.Value(0)).current;
  const levelUpOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef<FlatList>(null);
  const streakRef = useRef(0);
  const answerTimeRef = useRef<number>(Date.now());

  // ── Overlay helpers ──

  const showComboOverlay = useCallback((text: string) => {
    setComboText(text);
    comboOpacity.setValue(1);
    comboScale.setValue(0.5);
    Animated.parallel([
      Animated.spring(comboScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(comboOpacity, { toValue: 0, duration: 800, delay: 400, useNativeDriver: true }),
    ]).start(() => setComboText(null));
  }, [comboOpacity, comboScale]);

  const showEgoOverlay = useCallback((text: string) => {
    setEgoText(text);
    egoOpacity.setValue(1);
    Animated.timing(egoOpacity, { toValue: 0, duration: 1000, delay: 200, useNativeDriver: true }).start(() =>
      setEgoText(null),
    );
  }, [egoOpacity]);

  const showLevelUpOverlay = useCallback(() => {
    setShowLevelUp(true);
    levelUpOpacity.setValue(1);
    Animated.timing(levelUpOpacity, { toValue: 0, duration: 1200, delay: 300, useNativeDriver: true }).start(() =>
      setShowLevelUp(false),
    );
  }, [levelUpOpacity]);

  const animateProgress = useCallback(
    (toValue: number) => {
      Animated.timing(progressAnim, { toValue, duration: 200, useNativeDriver: false }).start();
    },
    [progressAnim],
  );

  const scrollToNext = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, []);

  // ── Answer handler ──

  const handleAnswer = useCallback(
    (index: number, answer: string, question: Question, usedHint: boolean) => {
      if (answeredSet.has(index)) return;

      const correct = answer.trim().toUpperCase() === question.answer.toUpperCase();
      const elapsed = Date.now() - answerTimeRef.current;

      setAnsweredSet((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });

      setSolved((prev) => prev + 1);

      if (correct) {
        const newStreak = usedHint ? 0 : streakRef.current + 1;
        streakRef.current = newStreak;
        setStreak(newStreak);

        // Progress bar
        const newProgress = (levelProgress + 1) % LEVEL_THRESHOLD;
        setLevelProgress(newProgress);
        animateProgress(newProgress / LEVEL_THRESHOLD);

        if (newProgress === 0 && solved > 0) {
          animateProgress(0);
          showLevelUpOverlay();
        }

        // Combo feedback (skip if hint was used)
        if (!usedHint) {
          if (elapsed < 1500) {
            showComboOverlay('FAST ⚡');
          } else if (newStreak === 5) {
            showComboOverlay('+50 BONUS 🎯');
          } else if (newStreak === 3) {
            showComboOverlay('ON FIRE 🔥');
          } else if (newStreak > 0 && newStreak % 10 === 0) {
            showComboOverlay(`${newStreak} STREAK! 💫`);
          }
        }

        // Ego boost (skip if hint was used)
        if (!usedHint) {
          const failRate = question.fail_rate;
          if (failRate >= 70) {
            showEgoOverlay(`${failRate}% users failed this`);
          } else if (failRate >= 50) {
            showEgoOverlay(`Only ${100 - failRate}% solved this`);
          }
        }
      } else {
        streakRef.current = 0;
        setStreak(0);

        // Ego boost for wrong
        showEgoOverlay('Tough one 😏');
      }

      Keyboard.dismiss();

      const delay = correct ? 350 : 500;
      setTimeout(() => scrollToNext(index), delay);
    },
    [answeredSet, levelProgress, solved, animateProgress, showLevelUpOverlay, showComboOverlay, showEgoOverlay, scrollToNext],
  );

  // ── Viewability tracking for speed measurement ──

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      answerTimeRef.current = Date.now();
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  // ── Render ──

  const renderCard = useCallback(
    ({ item, index }: { item: number; index: number }) => {
      const question = questions[item];
      const answered = answeredSet.has(index);
      return <ScrollCard question={question} index={index} answered={answered} onAnswer={handleAnswer} />;
    },
    [answeredSet, handleAnswer],
  );

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scroll Mode</Text>
        <View style={styles.headerStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statIcon}>✓</Text>
            <Text style={styles.statValue}>{solved}</Text>
          </View>
          <View style={[styles.statBadge, streak >= 3 && styles.statBadgeHot]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statValue, streak >= 3 && styles.statValueHot]}>{streak}</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
      </View>

      {/* Scrollable Cards */}
      <FlatList
        ref={flatListRef}
        data={questionPool}
        renderItem={renderCard}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={CARD_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT,
          offset: CARD_HEIGHT * index,
          index,
        })}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      />

      {/* Combo Overlay */}
      {comboText && (
        <Animated.View
          style={[styles.comboOverlay, { opacity: comboOpacity, transform: [{ scale: comboScale }] }]}
          pointerEvents="none"
        >
          <Text style={styles.comboText}>{comboText}</Text>
        </Animated.View>
      )}

      {/* Ego Boost Overlay */}
      {egoText && (
        <Animated.View style={[styles.egoOverlay, { opacity: egoOpacity }]} pointerEvents="none">
          <Text style={styles.egoText}>{egoText}</Text>
        </Animated.View>
      )}

      {/* Level Up Overlay */}
      {showLevelUp && (
        <Animated.View style={[styles.levelUpOverlay, { opacity: levelUpOpacity }]} pointerEvents="none">
          <Text style={styles.levelUpText}>⬆ LEVEL UP ⬆</Text>
        </Animated.View>
      )}
    </View>
  );
}

// ───── Individual Card Component ─────

interface ScrollCardProps {
  question: Question;
  index: number;
  answered: boolean;
  onAnswer: (index: number, answer: string, question: Question, usedHint: boolean) => void;
}

function ScrollCard({ question, index, answered, onAnswer }: ScrollCardProps) {
  const [userInput, setUserInput] = useState('');
  const [localFeedback, setLocalFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showRiddleInput, setShowRiddleInput] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const riddleInputFade = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const isRiddle = question.type === 'riddle';

  // Riddle: delayed input reveal for curiosity + tension
  useEffect(() => {
    if (isRiddle && !answered) {
      const timer = setTimeout(() => {
        setShowRiddleInput(true);
        Animated.timing(riddleInputFade, { toValue: 1, duration: 250, useNativeDriver: true }).start(() => {
          inputRef.current?.focus();
        });
      }, 400);
      return () => clearTimeout(timer);
    } else if (!isRiddle && isTextInput(question.type) && !answered) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isRiddle, question.type, answered, riddleInputFade]);

  const flashFeedback = () => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: false }).start();
  };

  const handleSubmitText = () => {
    if (userInput.trim().length > 0 && !answered) {
      const correct = userInput.trim().toUpperCase() === question.answer.toUpperCase();
      setLocalFeedback(correct ? 'correct' : 'wrong');
      flashFeedback();
      onAnswer(index, userInput, question, hintUsed);
      setUserInput('');
    }
  };

  const handleOptionPress = (option: string) => {
    if (answered) return;
    const correct = option.toUpperCase() === question.answer.toUpperCase();
    setLocalFeedback(correct ? 'correct' : 'wrong');
    flashFeedback();
    onAnswer(index, option, question, false);
  };

  const handleHint = () => {
    if (hintUsed || answered) return;
    setHintUsed(true);

    if (question.type === 'riddle' && question.hint) {
      setHintText(`💡 ${question.hint}`);
    } else {
      setHintText(`💡 ${getLetterHint(question.answer)}`);
    }
  };

  const getQuestionLabel = () => {
    switch (question.type) {
      case 'unscramble': return 'Unscramble the word:';
      case 'wrong_letter': return 'Fix the spelling:';
      case 'missing_vowel': return 'Fill in the vowels:';
      case 'classifier': return 'What part of speech?';
      case 'grammar': return 'Is this sentence correct?';
      case 'riddle': return '🧩 Riddle:';
      default: return '';
    }
  };

  const flashBgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      'rgba(0, 0, 0, 0)',
      localFeedback === 'correct' ? 'rgba(76, 175, 80, 0.25)' : 'rgba(239, 83, 80, 0.25)',
    ],
  });

  const showHintButton = isTextInput(question.type) && !hintUsed && !answered;

  // ── Render text input (shared between riddle and other text types) ──
  const renderTextInput = (animated?: boolean) => {
    const content = (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, isRiddle && styles.riddleInput]}
            value={userInput}
            onChangeText={setUserInput}
            placeholder={isRiddle ? 'Your answer...' : 'Type your answer...'}
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
            onSubmitEditing={handleSubmitText}
            returnKeyType="done"
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
              onPress={handleSubmitText}
              activeOpacity={0.7}
              disabled={userInput.trim().length === 0}
            >
              <Text style={styles.submitButtonText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );

    if (animated) {
      return <Animated.View style={{ opacity: riddleInputFade }}>{content}</Animated.View>;
    }
    return content;
  };

  return (
    <Animated.View style={[styles.card, { backgroundColor: flashBgColor }]}>
      {/* Question */}
      <View style={styles.questionArea}>
        <Text style={styles.questionLabel}>{getQuestionLabel()}</Text>
        <Text style={[styles.questionText, isRiddle && styles.riddleText]}>{question.question}</Text>

        {/* Inline Hint */}
        {hintText && (
          <Text style={styles.hintText}>{hintText}</Text>
        )}
      </View>

      {/* Answer Area */}
      {!answered ? (
        <View style={styles.answerArea}>
          {isRiddle ? (
            showRiddleInput ? renderTextInput(true) : <View style={styles.riddlePlaceholder} />
          ) : isTextInput(question.type) ? (
            renderTextInput()
          ) : (
            <View style={styles.optionsContainer}>
              {question.options?.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionButton,
                    (question.options?.length ?? 0) === 2 ? styles.optionButtonWide : styles.optionButtonHalf,
                  ]}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.feedbackArea}>
          <Text
            style={[
              styles.feedbackEmoji,
              { color: localFeedback === 'correct' ? theme.colors.success : theme.colors.error },
            ]}
          >
            {localFeedback === 'correct' ? '✓' : '✗'}
          </Text>
          <Text
            style={[
              styles.feedbackLabel,
              { color: localFeedback === 'correct' ? theme.colors.success : theme.colors.error },
            ]}
          >
            {localFeedback === 'correct' ? 'Correct!' : 'Wrong'}
          </Text>
          {localFeedback === 'wrong' && <Text style={styles.correctAnswerText}>{question.answer}</Text>}
        </View>
      )}
    </Animated.View>
  );
}

// ───── Styles ─────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  headerBack: {
    paddingRight: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  headerBackText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerStats: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  statBadgeHot: {
    backgroundColor: 'rgba(239, 83, 80, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  statIcon: {
    fontSize: theme.fontSize.sm,
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statValueHot: {
    color: theme.colors.error,
  },
  progressBarContainer: {
    height: PROGRESS_HEIGHT,
    backgroundColor: theme.colors.surfaceLight,
  },
  progressBarFill: {
    height: PROGRESS_HEIGHT,
    backgroundColor: theme.colors.primary,
  },
  card: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  questionArea: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
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
    paddingHorizontal: theme.spacing.sm,
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
  riddleInput: {
    borderColor: theme.colors.accent,
    borderWidth: 1.5,
  },
  riddlePlaceholder: {
    height: 110,
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
  feedbackArea: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  feedbackEmoji: {
    fontSize: 48,
    fontWeight: '800',
  },
  feedbackLabel: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  },
  correctAnswerText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.accent,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  // Combo overlay
  comboOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  comboText: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.accent,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  // Ego boost overlay
  egoOverlay: {
    position: 'absolute',
    bottom: '15%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  egoText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  // Level up overlay
  levelUpOverlay: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.primary,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 3,
  },
});
