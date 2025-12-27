import { ConsonantClass, PhoneticRule, VowelLength } from '../types';
import { analyzeMultiSyllableTone } from './toneLogic';

// Based on the PDF "Consonant Mapping Matrix" and "Vowel System"
export const CONSONANT_MAP: PhoneticRule[] = [
  // Plosives (No Aspirated Digraphs)
  { thai: 'ป', roman_revised: 'p', ipa: 'p', class: ConsonantClass.MID, type: 'consonant' },
  { thai: 'ต', roman_revised: 't', ipa: 't', class: ConsonantClass.MID, type: 'consonant' },
  { thai: 'ก', roman_revised: 'k', ipa: 'k', class: ConsonantClass.MID, type: 'consonant' },
  { thai: 'ด', roman_revised: 'd', ipa: 'd', class: ConsonantClass.MID, type: 'consonant' },
  { thai: 'บ', roman_revised: 'b', ipa: 'b', class: ConsonantClass.MID, type: 'consonant' },
  { thai: 'อ', roman_revised: '-', ipa: 'ʔ', class: ConsonantClass.MID, type: 'consonant' },
  // Aspirated (Optional IPA encoding, but Roman remains clean or distinct)
  { thai: 'พ', roman_revised: 'p', ipa: 'pʰ', class: ConsonantClass.LOW, type: 'consonant' },
  { thai: 'ภ', roman_revised: 'p', ipa: 'pʰ', class: ConsonantClass.LOW, type: 'consonant' },
  // Special / Indic
  { thai: 'จ', roman_revised: 'j', ipa: 'd͡ʒ', class: ConsonantClass.MID, type: 'consonant' },
  { thai: 'ช', roman_revised: 'c', ipa: 't͡ɕʰ', class: ConsonantClass.LOW, type: 'consonant' },
  { thai: 'ญ', roman_revised: 'ñ', ipa: 'ɲ', class: ConsonantClass.LOW, type: 'consonant', notes: 'Spanish ñ preferred over ny' },
  { thai: 'ง', roman_revised: 'ng', ipa: 'ŋ', class: ConsonantClass.LOW, type: 'consonant' },
  { thai: 'ร', roman_revised: 'r', ipa: 'r', class: ConsonantClass.LOW, type: 'consonant' },
  { thai: 'ล', roman_revised: 'l', ipa: 'l', class: ConsonantClass.LOW, type: 'consonant' },
  { thai: 'ส', roman_revised: 's', ipa: 's', class: ConsonantClass.HIGH, type: 'consonant' },
  { thai: 'ษ', roman_revised: 's', ipa: 's', class: ConsonantClass.HIGH, type: 'consonant' },
  { thai: 'ศ', roman_revised: 's', ipa: 's', class: ConsonantClass.HIGH, type: 'consonant' },
  { thai: 'ห', roman_revised: 'h', ipa: 'h', class: ConsonantClass.HIGH, type: 'consonant' },
  { thai: 'น', roman_revised: 'n', ipa: 'n', class: ConsonantClass.LOW, type: 'consonant' },
  { thai: 'ม', roman_revised: 'm', ipa: 'm', class: ConsonantClass.LOW, type: 'consonant' },
];

export const VOWEL_MAP: PhoneticRule[] = [
  // Monophthongs
  { thai: 'ะ', roman_revised: 'a', ipa: 'a', type: 'vowel', notes: 'Short' },
  { thai: 'า', roman_revised: 'ā', ipa: 'aː', type: 'vowel', notes: 'Long' },
  { thai: 'ิ', roman_revised: 'i', ipa: 'i', type: 'vowel', notes: 'Short' },
  { thai: 'ี', roman_revised: 'ī', ipa: 'iː', type: 'vowel', notes: 'Long' },
  { thai: 'ุ', roman_revised: 'u', ipa: 'u', type: 'vowel', notes: 'Short' },
  { thai: 'ู', roman_revised: 'ū', ipa: 'uː', type: 'vowel', notes: 'Long' },
  // Short vowels implicit often appearing as nothing or special chars
  { thai: 'ั', roman_revised: 'a', ipa: 'a', type: 'vowel', notes: 'Mai Han-Akat (Short a)' },
  { thai: 'โ', roman_revised: 'ō', ipa: 'oː', type: 'vowel', notes: 'Long O' },
  { thai: 'เ', roman_revised: 'ē', ipa: 'eː', type: 'vowel', notes: 'Long E' },
];

// Heuristic conversion with Tone Logic integration
export const simpleTransliterate = (input: string): { roman: string, ipa: string, tone?: string, rule?: string } => {
  let romanOut = "";
  let ipaOut = "/";
  
  // 1. Generate Roman/IPA (Character mapping approach - Simplified for demo)
  // Note: A true romanizer needs the syllable splits used in toneLogic.
  // We will iterate char by char for now.
  for (const char of input) {
    const cons = CONSONANT_MAP.find(c => c.thai === char);
    const vow = VOWEL_MAP.find(v => v.thai === char);
    
    if (cons) {
      romanOut += cons.roman_revised;
      ipaOut += cons.ipa;
    } else if (vow) {
      romanOut += vow.roman_revised;
      ipaOut += vow.ipa;
    } else {
      // Pass through tone marks or unmapped chars
      if (!['่','้','๊','๋'].includes(char)) {
         romanOut += char;
         ipaOut += char;
      }
    }
  }
  ipaOut += "/";

  // 2. Calculate Tone (Multi-syllable capable)
  const toneResults = analyzeMultiSyllableTone(input);
  
  const combinedTone = toneResults.map(t => t.tone).join(', ');
  const combinedRules = toneResults.map(t => t.ruleDescription).join(' | ');

  return { 
    roman: romanOut, 
    ipa: ipaOut, 
    tone: combinedTone, 
    rule: combinedRules 
  };
};

export const normalizeUnicode = (text: string): string => {
  return text.normalize('NFC');
};