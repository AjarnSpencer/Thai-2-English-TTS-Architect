import { GoogleGenAI, Type } from "@google/genai";
import { CorpusEntry } from "../types";

// Helper to retrieve key from various storage layers
export const getStoredApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    // Check Local (Persistent), then Session (Amnesiac).
    // STRICT UPDATE: Removed process.env.API_KEY fallback. 
    // This guarantees the deployed app cannot accidentally use the developer's injected credentials.
    // Every user (including the dev) must enter their key in the UI for the deployed instance.
    return localStorage.getItem('pta_api_key') || 
           sessionStorage.getItem('pta_api_key');
  }
  return null;
};

const getAIClient = () => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateLexicalEntries = async (
  topic: string, 
  count: number = 3
): Promise<CorpusEntry[]> => {
  try {
    const ai = getAIClient();
  
    const prompt = `
      You are a linguistics expert specializing in Thai, Pali, and Sanskrit phonology.
      Generate ${count} training entries for a TTS corpus related to: "${topic}".
      
      Strict Rules:
      1. Use "Revised Romanization": 
         - Long vowels must use macrons (ā, ī, ū, ē, ō).
         - Central vowels use Umlauts: ü for /ɯ/, ö for /ɤː/, ä for /ɛː/.
         - No aspirated digraphs (ph, th, kh). Use p, t, k.
         - Use 'ñ' for palatal nasal /ɲ/.
      2. IPA must be precise using International Phonetic Alphabet.
      3. Return strictly JSON.

      Format per entry:
      {
        "native": "Thai script",
        "roman_revised": "Revised Roman",
        "ipa": "/i.p.a/",
        "language_source": "Pali/Sanskrit/Thai",
        "vowel_length": ["list", "vowels"],
        "notes": "Brief etymology or tone note",
        "tone": "Lexical tone (e.g., Mid, Low, Falling, High, Rising)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    native: { type: Type.STRING },
                    roman_revised: { type: Type.STRING },
                    ipa: { type: Type.STRING },
                    language_source: { type: Type.STRING },
                    vowel_length: { type: Type.ARRAY, items: { type: Type.STRING } },
                    notes: { type: Type.STRING },
                    tone: { type: Type.STRING }
                }
            }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((item: any, index: number) => ({
        ...item,
        id: `gen_${Date.now()}_${index}`,
        duration_weight: 1.0 // Default for neural training
      }));
    }
    return [];
  } catch (error: any) {
    if (error.message === 'API_KEY_MISSING') {
        throw error; // Re-throw to be caught by UI
    }
    console.error("Gemini generation failed", error);
    return [];
  }
};