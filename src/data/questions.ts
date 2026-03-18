export type QuestionType = 'unscramble' | 'wrong_letter' | 'missing_vowel' | 'classifier' | 'grammar';

export interface Question {
  type: QuestionType;
  question: string;
  answer: string;
  options?: string[];
}

export const questions: Question[] = [
  {
    type: 'unscramble',
    question: 'R O E M T H',
    answer: 'MOTHER',
  },
  {
    type: 'wrong_letter',
    question: 'ENVIROMENT',
    answer: 'ENVIRONMENT',
  },
  {
    type: 'missing_vowel',
    question: 'M_NG__M_NT',
    answer: 'MANAGEMENT',
  },
  {
    type: 'classifier',
    question: 'Quickly',
    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    answer: 'Adverb',
  },
  {
    type: 'grammar',
    question: 'She did not knew the answer',
    options: ['Correct', 'Incorrect'],
    answer: 'Incorrect',
  },
  {
    type: 'unscramble',
    question: 'P L A E P',
    answer: 'APPLE',
  },
  {
    type: 'wrong_letter',
    question: 'DEFINATELY',
    answer: 'DEFINITELY',
  },
  {
    type: 'missing_vowel',
    question: 'B__T_F_L',
    answer: 'BEAUTIFUL',
  },
  {
    type: 'classifier',
    question: 'Happiness',
    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    answer: 'Noun',
  },
  {
    type: 'grammar',
    question: 'They has gone to the market',
    options: ['Correct', 'Incorrect'],
    answer: 'Incorrect',
  },
  {
    type: 'unscramble',
    question: 'C H O L S O',
    answer: 'SCHOOL',
  },
  {
    type: 'wrong_letter',
    question: 'OCCASSION',
    answer: 'OCCASION',
  },
  {
    type: 'missing_vowel',
    question: '_D_C_T__N',
    answer: 'EDUCATION',
  },
  {
    type: 'classifier',
    question: 'Beautiful',
    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    answer: 'Adjective',
  },
  {
    type: 'grammar',
    question: 'He runs every morning',
    options: ['Correct', 'Incorrect'],
    answer: 'Correct',
  },
  {
    type: 'unscramble',
    question: 'D L R O W',
    answer: 'WORLD',
  },
  {
    type: 'wrong_letter',
    question: 'SEPERATE',
    answer: 'SEPARATE',
  },
  {
    type: 'missing_vowel',
    question: 'C_MP_T_R',
    answer: 'COMPUTER',
  },
  {
    type: 'classifier',
    question: 'Running',
    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    answer: 'Verb',
  },
  {
    type: 'grammar',
    question: 'She is more smarter than him',
    options: ['Correct', 'Incorrect'],
    answer: 'Incorrect',
  },
];

export function isTextInput(type: QuestionType): boolean {
  return type === 'unscramble' || type === 'wrong_letter' || type === 'missing_vowel';
}
