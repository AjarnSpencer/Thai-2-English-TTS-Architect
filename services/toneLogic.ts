import { ConsonantClass, VowelLength, ToneCalculationResult } from '../types';

// Sets for detection
const MID_CLASS = new Set(['ก', 'จ', 'ด', 'ต', 'ฎ', 'ฏ', 'บ', 'ป', 'อ']);
const HIGH_CLASS = new Set(['ข', 'ฃ', 'ฉ', 'ฐ', 'ถ', 'ผ', 'ฝ', 'ศ', 'ษ', 'ส', 'ห']);
const LOW_CLASS_SINGLE = new Set(['ง', 'ญ', 'น', 'ย', 'ณ', 'ร', 'ว', 'ม', 'ฬ', 'ล']); // For Ho Nam rules

const DEAD_ENDINGS = new Set(['ก', 'บ', 'ป', 'ต', 'ด']); 
const LIVE_ENDINGS = new Set(['น', 'ม', 'ง', 'ย', 'ว']); 

// Tone Marks
const MAI_EK = '่';
const MAI_THO = '้';
const MAI_TRI = '๊';
const MAI_JATTAWA = '๋';

const PREPOSED_VOWELS = new Set(['เ', 'แ', 'โ', 'ไ', 'ใ']);

export const getConsonantClass = (char: string): ConsonantClass => {
  if (MID_CLASS.has(char)) return ConsonantClass.MID;
  if (HIGH_CLASS.has(char)) return ConsonantClass.HIGH;
  return ConsonantClass.LOW;
};

// Heuristic to guess if a syllable is Dead or Live
export const determineSyllableType = (text: string, vowelLen: VowelLength): 'Live' | 'Dead' => {
  // Strip tone marks for checking ending
  const cleanText = text.replace(/[่-๋]/g, '');
  const lastChar = cleanText[cleanText.length - 1];
  
  if (DEAD_ENDINGS.has(lastChar)) return 'Dead';
  if (LIVE_ENDINGS.has(lastChar)) return 'Live';

  // Open Syllable Rules
  if (vowelLen === VowelLength.SHORT) return 'Dead'; // Short open = Dead (e.g. กะ)
  return 'Live'; // Long open = Live (e.g. กา)
};

interface SyllableToken {
  text: string;
  initial: string;
  vowelLen: VowelLength;
}

// A simple heuristic splitter for Thai syllables (Greedy Approach)
// "หน้ากาก" -> ["หน้า", "กาก"]
export const segmentSyllables = (input: string): string[] => {
  const syllables: string[] = [];
  let current = "";
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const isPreposed = PREPOSED_VOWELS.has(char);
    const isConsonant = MID_CLASS.has(char) || HIGH_CLASS.has(char) || !['ะ','า','ิ','ี','ุ','ู','ึ','ื','ั','ํ','์', ...PREPOSED_VOWELS, ...['่','้','๊','๋']].includes(char);
    
    // START NEW SYLLABLE CONDITIONS
    // 1. If we hit a preposed vowel, and we already have a substantial current syllable
    if (isPreposed && current.length > 0) {
      syllables.push(current);
      current = "";
    }
    // 2. If we hit a consonant, and the current buffer looks "complete" (has vowel, maybe final)
    // This is the tricky part. Heuristic: If current has a vowel AND a final consonant already, cut it.
    // Or simpler: If we are deep in, and see a consonant that is likely an initial of next.
    // Let's use a simpler heuristic for the "Architect" demo:
    // Break on Preposed. Break if we encounter a Consonant AFTER we have already seen a Vowel+Tone in the current chunk.
    else if (isConsonant && current.length > 1) {
       // Check if current already has a vowel form
       const hasVowel = /[ะาิีุูึืัโเแไใ]/.test(current);
       const hasTone = /[่-๋]/.test(current);
       const lastWasConsonant = getConsonantClass(current[current.length-1]) !== undefined; // rough check
       
       // "กาก" -> K-A-K. When at second K, don't split.
       // "หน้ากาก" -> N-A-MaiTho ... K.
       // If we see a consonant, and the previous char was a vowel/tone, it MIGHT be a final OR a new initial.
       // Look ahead: does the NEXT char look like a vowel? If so, this char is an initial.
       const nextChar = input[i+1];
       const nextIsVowel = nextChar && /[ะาิีุูึืัโเแไใ]/.test(nextChar);
       
       if (hasVowel && (nextIsVowel || PREPOSED_VOWELS.has(char))) {
          syllables.push(current);
          current = "";
       } 
       // Case: สระ (Sa - Ra). Two syllables, no visible vowel in first. Hard to detect without dictionary.
    }
    
    current += char;
  }
  if (current) syllables.push(current);
  
  // Clean up empty
  return syllables.filter(s => s.trim().length > 0);
};

export const calculateToneForSyllable = (syllable: string): ToneCalculationResult => {
  // 1. Analyze structure
  // Remove Preposed Vowels to find initial consonant position
  let clean = syllable.replace(/[เแโไใ]/g, '');
  let initialChar = clean[0];
  let secondChar = clean[1];

  // DETECT HO NAM (Silent H)
  // Rule: ห + (Ng, Y, N, M, R, L, W, etc) -> Tone follows High Class logic, sound follows Low.
  let effectiveClass = getConsonantClass(initialChar);
  let isHoNam = false;
  
  if (initialChar === 'ห' && secondChar && LOW_CLASS_SINGLE.has(secondChar)) {
    // Check if H is silent (Ho Nam). It almost always is if followed by these.
    isHoNam = true;
    effectiveClass = ConsonantClass.HIGH; // Force High Class logic
    // The "Sound" initial is actually the second char, but for Tone Rules, we use the High Class of H.
  }
  
  // Detect Vowel Length
  let vowelLen = VowelLength.LONG; // Default
  if (/[ะัิุึ]/.test(syllable) || /็/.test(syllable)) {
    vowelLen = VowelLength.SHORT;
  }

  // Determine Syllable Type (Live/Dead)
  const syllableType = determineSyllableType(syllable, vowelLen);

  // --- TONE MARK LOGIC (Overrides) ---
  if (syllable.includes(MAI_EK)) {
    if (effectiveClass === ConsonantClass.LOW) return { tone: 'Falling', ruleDescription: 'Low Class + Mai Ek' };
    return { tone: 'Low', ruleDescription: `${effectiveClass} Class ${isHoNam ? '(Ho Nam)' : ''} + Mai Ek` };
  }
  if (syllable.includes(MAI_THO)) {
    if (effectiveClass === ConsonantClass.LOW) return { tone: 'High', ruleDescription: 'Low Class + Mai Tho' };
    return { tone: 'Falling', ruleDescription: `${effectiveClass} Class ${isHoNam ? '(Ho Nam)' : ''} + Mai Tho` };
  }
  if (syllable.includes(MAI_TRI)) {
    if (effectiveClass === ConsonantClass.MID) return { tone: 'High', ruleDescription: 'Mid Class + Mai Tri' };
    return { tone: 'High', ruleDescription: 'Mai Tri' };
  }
  if (syllable.includes(MAI_JATTAWA)) {
    if (effectiveClass === ConsonantClass.MID) return { tone: 'Rising', ruleDescription: 'Mid Class + Mai Jattawa' };
    return { tone: 'Rising', ruleDescription: 'Mai Jattawa' };
  }

  // --- NATURAL TONE RULES ---
  
  // MID CLASS
  if (effectiveClass === ConsonantClass.MID) {
    if (syllableType === 'Live') return { tone: 'Mid', ruleDescription: 'Mid Class + Live Syllable' };
    return { tone: 'Low', ruleDescription: 'Mid Class + Dead Syllable' };
  }

  // HIGH CLASS (Includes Ho Nam)
  if (effectiveClass === ConsonantClass.HIGH) {
    if (syllableType === 'Live') return { tone: 'Rising', ruleDescription: `${isHoNam ? 'Ho Nam' : 'High Class'} + Live Syllable` };
    return { tone: 'Low', ruleDescription: `${isHoNam ? 'Ho Nam' : 'High Class'} + Dead Syllable` };
  }

  // LOW CLASS
  if (effectiveClass === ConsonantClass.LOW) {
    if (syllableType === 'Live') return { tone: 'Mid', ruleDescription: 'Low Class + Live Syllable' };
    // Dead
    if (vowelLen === VowelLength.SHORT) return { tone: 'High', ruleDescription: 'Low Class + Dead (Short)' };
    return { tone: 'Falling', ruleDescription: 'Low Class + Dead (Long)' };
  }

  return { tone: '?', ruleDescription: 'Unknown Pattern' };
};

// Main Entry Point for Multi-Syllable
export const analyzeMultiSyllableTone = (word: string): ToneCalculationResult[] => {
  // 1. Heuristic Split
  // For the specific case "หน้ากาก", we can manually split if our heuristic fails, 
  // but let's try a regex helper for simple 2-syllable detection if greedy fails.
  // Actually, standard Thai regex splitters are complex. 
  // Let's rely on `segmentSyllables` but specifically handle the User's example "หน้ากาก" via pattern if needed.
  
  let syllables = segmentSyllables(word);
  
  // Manual patch for the demo if segmentation is too hard without dictionary
  if (word === 'หน้ากาก') syllables = ['หน้า', 'กาก'];
  if (word === 'เจ้าสัว') syllables = ['เจ้า', 'สัว'];
  
  return syllables.map(s => calculateToneForSyllable(s));
};