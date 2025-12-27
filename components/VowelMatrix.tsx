import React from 'react';
import { ConsonantClass } from '../types';

interface MatrixProps {
  consonantClass: ConsonantClass;
}

interface VowelPattern {
  roman: string;
  ipa: string;
  thaiPattern: string; // Use '-' as placeholder for consonant
  note: string;
  type: 'short' | 'long';
}

const VowelMatrix: React.FC<MatrixProps> = ({ consonantClass }) => {
  
  // 1. Define Representative Consonant based on Class
  const getConsonant = (cls: ConsonantClass) => {
    switch (cls) {
      case ConsonantClass.HIGH: return { char: 'ข', rom: 'kʰ', ipa: 'kʰ', name: 'Kho Khai (High)' };
      case ConsonantClass.MID: return { char: 'ก', rom: 'k', ipa: 'k', name: 'Ko Kai (Mid)' };
      case ConsonantClass.LOW: return { char: 'ค', rom: 'kʰ', ipa: 'kʰ', name: 'Kho Khwai (Low)' };
    }
  };

  const c = getConsonant(consonantClass);

  // 2. Comprehensive Vowel Data
  const monophthongs: VowelPattern[] = [
    { roman: 'a', ipa: 'a', thaiPattern: '-ะ', note: 'Short Open', type: 'short' },
    { roman: 'ā', ipa: 'aː', thaiPattern: '-า', note: 'Long Open', type: 'long' },
    { roman: 'i', ipa: 'i', thaiPattern: '-ิ', note: 'Short Front', type: 'short' },
    { roman: 'ī', ipa: 'iː', thaiPattern: '-ี', note: 'Long Front', type: 'long' },
    { roman: 'u', ipa: 'u', thaiPattern: '-ุ', note: 'Short Back', type: 'short' },
    { roman: 'ū', ipa: 'uː', thaiPattern: '-ู', note: 'Long Back', type: 'long' },
  ];

  const complexVowels: VowelPattern[] = [
    // Umlauts (Central/Back Unrounded)
    { roman: 'ü', ipa: 'ɯ', thaiPattern: '-ึ', note: 'Short High Central', type: 'short' },
    { roman: 'ǖ', ipa: 'ɯː', thaiPattern: '-ือ', note: 'Long High Central', type: 'long' },
    { roman: 'ö', ipa: 'ɤ', thaiPattern: 'เ-อะ', note: 'Short Mid Central', type: 'short' },
    { roman: 'ȫ', ipa: 'ɤː', thaiPattern: 'เ-อ', note: 'Long Mid Central', type: 'long' },
    { roman: 'ä', ipa: 'ɛ', thaiPattern: 'แ-ะ', note: 'Short Low Front', type: 'short' },
    { roman: 'ǟ', ipa: 'ɛː', thaiPattern: 'แ-', note: 'Long Low Front', type: 'long' },
    // Diphthongs
    { roman: 'ia', ipa: 'iə', thaiPattern: 'เ-ีย', note: 'Diphthong (i-a)', type: 'long' },
    { roman: 'ia', ipa: 'iəʔ', thaiPattern: 'เ-ียะ', note: 'Short Diphthong', type: 'short' },
    { roman: 'üa', ipa: 'ɯə', thaiPattern: 'เ-ือ', note: 'Diphthong (ü-a)', type: 'long' },
    { roman: 'ua', ipa: 'uə', thaiPattern: 'ัว', note: 'Diphthong (u-a)', type: 'long' },
  ];

  // 3. Tone Drill Data (Specific to user request, fixed to Mid Class for demonstration)
  const toneDrills = [
    { word: 'บะ', roman: 'Ba', ipa: '/baʔ/', meaning: 'Short (Dead)', tone: 'Low' },
    { word: 'บา', roman: 'Bā', ipa: '/baː/', meaning: 'Long (Live)', tone: 'Mid' },
    { word: 'บาร์', roman: 'Bā', ipa: '/baː/', meaning: 'Bar (Loanword)', tone: 'Mid' },
    { word: 'ปา', roman: 'Pā', ipa: '/paː/', meaning: 'Throw', tone: 'Mid' },
    { word: 'ป่า', roman: 'Pā', ipa: '/paː/', meaning: 'Forest (Mai Ek)', tone: 'Low' },
    { word: 'ป้า', roman: 'Pā', ipa: '/paː/', meaning: 'Aunt (Mai Tho)', tone: 'Falling' },
    { word: 'ป๊า', roman: 'Pā', ipa: '/paː/', meaning: 'Dad (Mai Tri)', tone: 'High' },
    { word: 'ป๋า', roman: 'Pā', ipa: '/paː/', meaning: 'Rich Man (Jattawa)', tone: 'Rising' },
  ];

  const renderCard = (v: VowelPattern, idx: number) => {
    // Replace placeholder '-' with the actual consonant
    const thaiDisplay = v.thaiPattern.replace('-', c.char);
    
    return (
      <div key={idx} className="relative group border border-slate-100 p-3 rounded hover:border-sacred-gold transition-all bg-slate-50 hover:bg-white hover:shadow-md">
        <div className="flex justify-between items-start mb-1">
          <span className="font-thai text-2xl text-deep-slate">{thaiDisplay}</span>
          <span className={`text-[10px] uppercase font-bold px-1 rounded ${v.type === 'long' ? 'bg-sacred-gold/10 text-sacred-gold' : 'bg-slate-200 text-slate-500'}`}>
            {v.type}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-lg text-deep-slate font-semibold">
            {c.rom}{v.roman}
          </span>
          <span className="font-mono text-xs text-slate-400">
             /{c.ipa}{v.ipa.replace('/', '')}/
          </span>
          <span className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-1">
            {v.note}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Introduction */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl text-deep-slate">
            Active Lexicon: <span className="text-sacred-gold">{c.name}</span>
            </h3>
            <div className="text-right">
                <span className="text-xs font-mono text-slate-400 block">Base Consonant IPA</span>
                <span className="font-mono text-lg">/{c.ipa}/</span>
            </div>
        </div>
        <p className="text-sm text-slate-600 mb-2">
            The tables below dynamically fuse the selected consonant class with the comprehensive vowel system.
            Hover over cards for detail.
        </p>
      </div>

      {/* Grid 1: Monophthongs */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h4 className="font-serif text-lg text-deep-slate mb-4 border-b border-slate-100 pb-2">
            1. Fundamental Monophthongs (Short vs. Long)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {monophthongs.map(renderCard)}
        </div>
      </div>

      {/* Grid 2: Complex */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h4 className="font-serif text-lg text-deep-slate mb-4 border-b border-slate-100 pb-2">
            2. Complex Vowels, Umlauts & Diphthongs
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {complexVowels.map(renderCard)}
        </div>
      </div>

      {/* Grid 3: Tone Drills */}
      <div className="bg-deep-slate text-white p-6 rounded-lg shadow-md border-l-4 border-sacred-gold">
        <h4 className="font-serif text-lg text-sacred-gold mb-2">
            3. Tone Mechanics & Calibration (Mid-Class Reference)
        </h4>
        <p className="text-sm text-slate-300 mb-6 font-light opacity-80">
            Mid-class consonants (like ป and บ) are the control group for Neural TTS tone training, as they possess the ability to carry all 5 lexical tones naturally.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {toneDrills.map((drill, idx) => (
                <div key={idx} className="bg-slate-800 p-3 rounded border border-slate-700 hover:border-sacred-gold transition-colors">
                    <div className="font-thai text-3xl mb-1">{drill.word}</div>
                    <div className="text-sacred-gold font-serif font-bold">{drill.roman}</div>
                    <div className="text-xs font-mono text-slate-400 mb-2">{drill.ipa}</div>
                    
                    <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-600">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Tone</span>
                        <span className={`text-xs font-bold px-1 py-0.5 rounded w-fit ${
                            drill.tone === 'Mid' ? 'bg-white text-slate-900' :
                            drill.tone === 'Low' ? 'bg-blue-200 text-blue-900' :
                            drill.tone === 'Falling' ? 'bg-orange-200 text-orange-900' :
                            drill.tone === 'High' ? 'bg-red-200 text-red-900' :
                            'bg-green-200 text-green-900' // Rising
                        }`}>
                            {drill.tone}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default VowelMatrix;