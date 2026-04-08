export type QuestionType = 'unscramble' | 'wrong_letter' | 'missing_vowel' | 'classifier' | 'grammar' | 'riddle';

export interface Question {
  type: QuestionType;
  question: string;
  answer: string;
  options?: string[];
  fail_rate: number;
  hint?: string;
}

/** Generate a letter-reveal hint: shows first letter + 50% of remaining letters */
export function getLetterHint(answer: string): string {
  const letters = answer.toUpperCase().split('');
  if (letters.length <= 2) return letters[0] + ' _';
  // Always reveal first letter, then ~50% of the rest randomly
  const indices = new Set<number>([0]);
  const remaining = letters.length - 1;
  const toReveal = Math.max(1, Math.ceil(remaining * 0.5));
  while (indices.size < toReveal + 1) {
    indices.add(1 + Math.floor(Math.random() * remaining));
  }
  return letters.map((ch, i) => (indices.has(i) ? ch : '_')).join(' ');
}

export const questions: Question[] = [
  // ─── Block 1 ───
  {
    type: 'unscramble',
    question: 'R O E M T H',
    answer: 'MOTHER',
    fail_rate: 42,
  },
  {
    type: 'wrong_letter',
    question: 'ENVIROMENT',
    answer: 'ENVIRONMENT',
    fail_rate: 68,
  },
  {
    type: 'missing_vowel',
    question: 'M_NG__M_NT',
    answer: 'MANAGEMENT',
    fail_rate: 71,
  },
  {
    type: 'riddle',
    question: 'I speak without a mouth and hear without ears. What am I?',
    answer: 'ECHO',
    fail_rate: 85,
    hint: 'It repeats what you say',
  },

  // ─── Block 2 ───
  {
    type: 'classifier',
    question: 'Quickly',
    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    answer: 'Adverb',
    fail_rate: 55,
  },
  {
    type: 'grammar',
    question: 'She did not knew the answer',
    options: ['Correct', 'Incorrect'],
    answer: 'Incorrect',
    fail_rate: 38,
  },
  {
    type: 'unscramble',
    question: 'P L A E P',
    answer: 'APPLE',
    fail_rate: 30,
  },
  {
    type: 'riddle',
    question: 'The more you take, the more you leave behind. What am I?',
    answer: 'FOOTSTEPS',
    fail_rate: 90,
    hint: 'Think about walking',
  },

  // ─── Block 3 ───
  {
    type: 'wrong_letter',
    question: 'DEFINATELY',
    answer: 'DEFINITELY',
    fail_rate: 74,
  },
  {
    type: 'missing_vowel',
    question: 'B__T_F_L',
    answer: 'BEAUTIFUL',
    fail_rate: 62,
  },
  {
    type: 'classifier',
    question: 'Happiness',
    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    answer: 'Noun',
    fail_rate: 45,
  },
  {
    type: 'riddle',
    question: 'I have keys but no locks. I have space but no room. What am I?',
    answer: 'KEYBOARD',
    fail_rate: 78,
    hint: "It's a device you type on",
  },

  // ─── Block 4 ───
  {
    type: 'grammar',
    question: 'They has gone to the market',
    options: ['Correct', 'Incorrect'],
    answer: 'Incorrect',
    fail_rate: 35,
  },
  {
    type: 'unscramble',
    question: 'C H O L S O',
    answer: 'SCHOOL',
    fail_rate: 40,
  },
  {
    type: 'wrong_letter',
    question: 'OCCASSION',
    answer: 'OCCASION',
    fail_rate: 72,
  },
  {
    type: 'riddle',
    question: 'I can fly without wings. I can cry without eyes. What am I?',
    answer: 'CLOUD',
    fail_rate: 82,
    hint: 'Look up at the sky',
  },

  // ─── Block 5 ───
  {
    type: 'missing_vowel',
    question: '_D_C_T__N',
    answer: 'EDUCATION',
    fail_rate: 66,
  },
  {
    type: 'classifier',
    question: 'Beautiful',
    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    answer: 'Adjective',
    fail_rate: 48,
  },
  {
    type: 'grammar',
    question: 'He runs every morning',
    options: ['Correct', 'Incorrect'],
    answer: 'Correct',
    fail_rate: 25,
  },
  {
    type: 'riddle',
    question: 'What has a head and a tail but no body?',
    answer: 'COIN',
    fail_rate: 70,
    hint: 'You carry it in your pocket',
  },

  // ─── Block 6 ───
  {
    type: 'unscramble',
    question: 'D L R O W',
    answer: 'WORLD',
    fail_rate: 28,
  },
  {
    type: 'wrong_letter',
    question: 'SEPERATE',
    answer: 'SEPARATE',
    fail_rate: 76,
  },
  {
    type: 'missing_vowel',
    question: 'C_MP_T_R',
    answer: 'COMPUTER',
    fail_rate: 50,
  },
  {
    type: 'riddle',
    question: 'I get shorter as I grow older. What am I?',
    answer: 'CANDLE',
    fail_rate: 65,
    hint: 'It burns with a flame',
  },

  // ─── Block 7 ───
  {
    type: 'classifier',
    question: 'Running',
    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    answer: 'Verb',
    fail_rate: 52,
  },
  {
    type: 'grammar',
    question: 'She is more smarter than him',
    options: ['Correct', 'Incorrect'],
    answer: 'Incorrect',
    fail_rate: 58,
  },
  {
    type: 'unscramble',
    question: 'G N I N R A E L',
    answer: 'LEARNING',
    fail_rate: 55,
  },
  {
    type: 'riddle',
    question: 'What word becomes shorter when you add two letters?',
    answer: 'SHORT',
    fail_rate: 88,
    hint: 'The answer is in the question',
  },
];

export function isTextInput(type: QuestionType): boolean {
  return type === 'unscramble' || type === 'wrong_letter' || type === 'missing_vowel' || type === 'riddle';
}
