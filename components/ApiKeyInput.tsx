import React, { useState, useEffect } from 'react';
import { getStoredApiKey } from '../services/geminiService';

const ApiKeyInput: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [storageType, setStorageType] = useState<'session' | 'local'>('session');

  useEffect(() => {
    const existing = getStoredApiKey();
    if (existing) {
      setHasKey(true);
      setKey(existing);
    } else {
        // Auto-open on load if no key is present (Call to Action)
        const hasSeenPrompt = sessionStorage.getItem('pta_api_prompt_seen');
        if (!hasSeenPrompt) {
            setIsOpen(true);
            sessionStorage.setItem('pta_api_prompt_seen', 'true');
        }
    }
  }, []);

  const handleSave = () => {
    if (!key.trim()) return;
    
    // Clear old keys first to avoid conflicts
    localStorage.removeItem('pta_api_key');
    sessionStorage.removeItem('pta_api_key');

    if (storageType === 'local') {
      localStorage.setItem('pta_api_key', key.trim());
    } else {
      sessionStorage.setItem('pta_api_key', key.trim());
    }
    setHasKey(true);
    setIsOpen(false);
    window.location.reload(); // Reload to refresh service state if needed or just visual confirmation
  };

  const handleClear = () => {
    localStorage.removeItem('pta_api_key');
    sessionStorage.removeItem('pta_api_key');
    setKey('');
    setHasKey(false);
    setIsOpen(true);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
          hasKey 
            ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200' 
            : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200 animate-pulse'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {hasKey ? 'API Key Active' : 'Set API Key'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-deep-slate/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border-t-4 border-sacred-gold p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl text-deep-slate">Configure AI Access</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-deep-slate">✕</button>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              This app requires a <strong>Google Gemini API Key</strong> to generate phonetic corpora. 
              The key is stored strictly in your browser.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key</label>
                <input 
                  type="password" 
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-2 border border-slate-300 rounded font-mono text-sm focus:ring-2 focus:ring-sacred-gold outline-none"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="storage" 
                    checked={storageType === 'session'} 
                    onChange={() => setStorageType('session')}
                    className="accent-deep-slate"
                  />
                  <span>Amnesiac (Session)</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="storage" 
                    checked={storageType === 'local'} 
                    onChange={() => setStorageType('local')}
                    className="accent-deep-slate"
                  />
                  <span>Persistent (Local)</span>
                </label>
              </div>

              <div className="pt-2 flex justify-between items-center">
                 <a 
                   href="https://aistudio.google.com/app/apikey" 
                   target="_blank" 
                   rel="noreferrer"
                   className="text-xs text-sacred-gold underline hover:text-yellow-600"
                 >
                   Get a Key →
                 </a>
                 <div className="flex gap-2">
                    {hasKey && (
                        <button 
                            onClick={handleClear}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                            Clear Key
                        </button>
                    )}
                    <button 
                        onClick={handleSave}
                        className="bg-deep-slate text-white px-6 py-2 rounded text-sm font-semibold hover:bg-slate-700 transition"
                    >
                        Save Access
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeyInput;