import React, { useState } from 'react';
import VowelMatrix from './components/VowelMatrix';
import CorpusBuilder from './components/CorpusBuilder';
import { ConsonantClass } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'corpus' | 'matrix'>('corpus');
  const [consonantClass, setConsonantClass] = useState<ConsonantClass>(ConsonantClass.MID);

  return (
    <div className="min-h-screen bg-paper text-deep-slate font-sans">
      {/* Header */}
      <header className="bg-deep-slate text-white p-6 shadow-md border-b-4 border-sacred-gold sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-serif tracking-wide text-sacred-gold">Phonetic Truth Architect</h1>
                <p className="text-sm opacity-80 font-light mt-1">
                    Neural TTS Training Set Generator • Indic-Thai Fidelity System
                </p>
            </div>
            <nav className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('corpus')}
                    className={`px-4 py-2 rounded-md transition-all ${activeTab === 'corpus' ? 'bg-white text-deep-slate shadow font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                    Corpus Builder
                </button>
                <button 
                    onClick={() => setActiveTab('matrix')}
                    className={`px-4 py-2 rounded-md transition-all ${activeTab === 'matrix' ? 'bg-white text-deep-slate shadow font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                    Vowel Matrix
                </button>
            </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 mt-6">
        
        {/* Ideology Banner */}
        <div className="mb-8 p-4 bg-white border-l-4 border-red-800 rounded shadow-sm text-sm text-slate-600">
            <strong className="text-red-900 font-serif text-lg block mb-1">Foundational Ideology Applied</strong>
            <ul className="list-disc list-inside space-y-1">
                <li>Rejects aspirated digraphs (ph, th, kh) — uses single graphemes/IPA.</li>
                <li>German Umlauts (ü, ö, ä) used for central/complex vowels.</li>
                <li>Long vowels explicitly marked (ā, ī, ū) for Neural TTS duration weighting.</li>
            </ul>
        </div>

        {activeTab === 'corpus' ? (
            <CorpusBuilder />
        ) : (
            <div className="space-y-6">
                <div className="flex justify-center gap-4 mb-6">
                    {Object.values(ConsonantClass).map((cls) => (
                        <button
                            key={cls}
                            onClick={() => setConsonantClass(cls)}
                            className={`px-6 py-2 rounded-full border transition-all ${
                                consonantClass === cls 
                                ? 'bg-deep-slate text-sacred-gold border-deep-slate font-bold shadow-lg transform scale-105' 
                                : 'bg-white text-slate-500 border-slate-300 hover:border-sacred-gold'
                            }`}
                        >
                            {cls} Class Consonants
                        </button>
                    ))}
                </div>
                <VowelMatrix consonantClass={consonantClass} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                     <div className="bg-slate-100 p-6 rounded text-sm text-slate-600">
                        <h4 className="font-bold text-deep-slate mb-2">Expansion Alignment</h4>
                        <p>This matrix logic is currently aligned for Thai. Toggle settings to view Lao/Khmer/Shan comparative grids (Logic placeholder).</p>
                     </div>
                     <div className="bg-slate-100 p-6 rounded text-sm text-slate-600">
                        <h4 className="font-bold text-deep-slate mb-2">Neural TTS weighting</h4>
                        <p>Short vowels receive 0.8x duration weight. Long vowels (ā, ī, ū, ǖ) receive 1.5x - 2.0x weight in the generated TSV.</p>
                     </div>
                </div>
            </div>
        )}

      </main>

      <footer className="bg-slate-200 text-slate-600 text-center p-6 mt-12 border-t border-slate-300">
        <p className="font-serif text-sm">
            Designed for Academic Philology & High-Fidelity Speech Synthesis.
        </p>
      </footer>
    </div>
  );
};

export default App;