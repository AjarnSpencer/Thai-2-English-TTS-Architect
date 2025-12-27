export enum ConsonantClass {
  HIGH = 'High',
  MID = 'Mid',
  LOW = 'Low'
}

export enum VowelLength {
  SHORT = 'Short',
  LONG = 'Long'
}

export interface ToneCalculationResult {
  tone: string; // Mid, Low, Falling, High, Rising
  ruleDescription: string; // e.g. "Mid Class + Dead Ending (Short Vowel)"
}

export interface PhoneticRule {
  thai: string;
  roman_revised: string;
  ipa: string;
  class?: ConsonantClass;
  type?: 'consonant' | 'vowel' | 'tone';
  notes?: string;
}

export interface CorpusEntry {
  id: string;
  native: string;
  roman_revised: string;
  roman_conventional?: string; // The "bad" one, for negative training
  ipa: string;
  language_source: string; // Pali, Sanskrit, Thai, Khmer
  etymon?: string;
  vowel_length: string[]; // ["ū", "ā"]
  tone_rules?: string; // High Class + Long Vowel = Rising, etc.
  duration_weight?: number; // For Neural TTS (0.5 to 2.0)
  notes?: string;
  tone?: string;
}

export interface VowelMatrixCell {
  vowelChar: string;
  vowelName: string;
  exampleWord: string;
  ipa: string;
  roman: string;
}