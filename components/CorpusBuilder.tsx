import React, { useState, useCallback, useEffect } from 'react';
import { CorpusEntry } from '../types';
import { simpleTransliterate } from '../services/phoneticRules.ts';
import { generateLexicalEntries } from '../services/geminiService';

const CorpusBuilder: React.FC = () => {
  const [entries, setEntries] = useState<CorpusEntry[]>([
    {
      id: '1',
      native: 'กาก',
      roman_revised: 'Kāk',
      ipa: '/kaːk/',
      language_source: 'Thai',
      vowel_length: ['ā'],
      notes: 'Waste/Residue',
      tone: 'Low',
      tone_rules: 'Mid Class + Dead Syllable (Long)'
    },
    {
      id: '2',
      native: 'หน้ากาก',
      roman_revised: 'Nākāk',
      ipa: '/naːkaːk/',
      language_source: 'Thai',
      vowel_length: ['ā', 'ā'],
      notes: 'Mask',
      tone: 'Falling, Low',
      tone_rules: 'Ho Nam + Mai Tho | Mid Class + Dead Syllable'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [inputMeaning, setInputMeaning] = useState('');
  
  // Tone state (Read Only / Derived)
  const [detectedTone, setDetectedTone] = useState('');
  const [detectedRule, setDetectedRule] = useState('');
  
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-calculate tone when input text changes
  useEffect(() => {
    if (!inputText) {
        setDetectedTone('');
        setDetectedRule('');
        return;
    }
    const result = simpleTransliterate(inputText);
    setDetectedTone(result.tone || 'Pending...');
    setDetectedRule(result.rule || 'Analyzing...');
  }, [inputText]);

  const handleManualAdd = () => {
    if (!inputText) return;
    const { roman, ipa } = simpleTransliterate(inputText);
    const newEntry: CorpusEntry = {
      id: Date.now().toString(),
      native: inputText,
      roman_revised: roman,
      ipa: ipa,
      language_source: 'Thai',
      vowel_length: [],
      notes: inputMeaning || 'User defined', 
      tone: detectedTone,
      tone_rules: detectedRule
    };
    setEntries(prev => [...prev, newEntry]);
    setInputText('');
    setInputMeaning('');
  };

  const handleAIGenerate = useCallback(async () => {
    if (!topic) return;
    setIsGenerating(true);
    const newEntries = await generateLexicalEntries(topic);
    setEntries(prev => [...prev, ...newEntries]);
    setIsGenerating(false);
  }, [topic]);

  const downloadTSV = () => {
    const headers = ['id', 'native', 'roman_revised', 'ipa', 'language_source', 'notes', 'tone', 'tone_logic'];
    const rows = entries.map(e => 
      [e.id, e.native, e.roman_revised, e.ipa, e.language_source, e.notes || '', e.tone || '', e.tone_rules || ''].join('\t')
    );
    const blob = new Blob([[headers.join('\t'), ...rows].join('\n')], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phonetic_truth_corpus.tsv';
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-serif text-xl mb-4 text-deep-slate flex justify-between">
                Manual Entry
            </h3>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Thai Word</label>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="e.g. หน้ากาก"
                            className="p-3 border border-slate-300 rounded font-thai text-2xl w-full focus:ring-2 focus:ring-sacred-gold focus:border-transparent outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Meaning</label>
                        <input 
                            type="text" 
                            value={inputMeaning}
                            onChange={(e) => setInputMeaning(e.target.value)}
                            placeholder="English definition"
                            className="p-3 border border-slate-300 rounded text-lg w-full h-[58px]"
                        />
                    </div>
                </div>

                {/* Smart Tone Dashboard */}
                {inputText && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Tone Analysis</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div>
                                <div className="text-lg font-serif font-bold text-deep-slate">
                                    {detectedTone}
                                </div>
                                <div className="text-xs text-slate-500 font-mono mt-1">
                                    {detectedRule}
                                </div>
                            </div>
                            <div className="text-right hidden md:block">
                                <span className="text-[10px] text-slate-400 border border-slate-200 px-2 py-1 rounded">
                                    Algorithmic Confidence: High
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <button 
                    onClick={handleManualAdd}
                    className="bg-deep-slate text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition font-semibold shadow-lg shadow-slate-200 mt-2"
                >
                    Add to Corpus
                </button>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
            </div>
            <h3 className="font-serif text-xl mb-4 text-deep-slate flex items-center gap-2">
                AI Expansion 
                <span className="text-xs bg-sacred-gold text-white px-2 py-0.5 rounded-full">Gemini</span>
            </h3>
            <div className="flex gap-2 relative z-10">
                <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="E.g., High Class Consonants, Sanskrit Loanwords..."
                    className="flex-1 p-2 border border-slate-300 rounded"
                />
                <button 
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="bg-sacred-gold text-deep-slate font-semibold px-4 py-2 rounded hover:bg-yellow-500 transition disabled:opacity-50"
                >
                    {isGenerating ? 'Thinking...' : 'Generate'}
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-4 relative z-10 leading-relaxed">
                Describe a linguistic category in English (e.g., "words with rising tone") or use Thai prompts directly (e.g., "ตำศัพท์เกี่ยวกับวิปัสสนา") to generate specialized terminology.
            </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-serif text-lg text-deep-slate">Corpus ({entries.length} Entries)</h3>
            <button onClick={downloadTSV} className="text-sm text-deep-slate underline decoration-sacred-gold underline-offset-4 hover:text-sacred-gold">
                Download TSV
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-serif">
                    <tr>
                        <th className="p-3">Native</th>
                        <th className="p-3">Revised Roman</th>
                        <th className="p-3">IPA</th>
                        <th className="p-3">Tone Sequence</th>
                        <th className="p-3">Logic</th>
                        <th className="p-3">Notes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                    {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-thai text-lg">{entry.native}</td>
                            <td className="p-3 font-serif text-deep-slate font-medium">{entry.roman_revised}</td>
                            <td className="p-3 text-slate-500">{entry.ipa}</td>
                            <td className="p-3">
                                {entry.tone && entry.tone.split(',').map((t, i) => (
                                    <span key={i} className={`inline-block mr-1 px-2 py-0.5 rounded text-xs font-bold ${
                                        t.trim() === 'Mid' ? 'bg-gray-100 text-gray-700' :
                                        t.trim() === 'Low' ? 'bg-blue-100 text-blue-800' :
                                        t.trim() === 'High' ? 'bg-red-100 text-red-800' :
                                        t.trim() === 'Falling' ? 'bg-orange-100 text-orange-800' :
                                        t.trim() === 'Rising' ? 'bg-green-100 text-green-800' : 'bg-slate-50'
                                    }`}>
                                        {t.trim()}
                                    </span>
                                ))}
                            </td>
                            <td className="p-3 text-xs text-slate-400 max-w-[200px] truncate" title={entry.tone_rules}>{entry.tone_rules || '-'}</td>
                            <td className="p-3 text-slate-400 italic truncate max-w-xs">{entry.notes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default CorpusBuilder;