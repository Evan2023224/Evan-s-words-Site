import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    memoryStory: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.STRING },
        chinese: { type: Type.STRING },
      },
       required: ["english", "chinese"],
    },
    groupsByMeaning: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          groupName: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              chinese: { type: Type.STRING },
            },
            required: ["english", "chinese"],
          },
          words: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["groupName", "words"],
      },
    },
    groupsByPronunciation: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          soundDescription: { type: Type.STRING },
          ipa: { type: Type.STRING },
          words: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["soundDescription", "ipa", "words"],
      },
    },
    wordDetails: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          englishDefinition: { type: Type.STRING },
          chineseTranslation: { type: Type.STRING },
          usageExamples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING },
                chinese: { type: Type.STRING },
              },
               required: ["english", "chinese"],
            },
          },
          derivatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                chineseTranslation: { type: Type.STRING },
              },
              required: ["word", "chineseTranslation"],
            },
          },
          vowelSwaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                chineseTranslation: { type: Type.STRING },
              },
               required: ["word", "chineseTranslation"],
            },
          },
          grammar: {
            type: Type.OBJECT,
            properties: {
              partOfSpeech: { type: Type.STRING },
              forms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    formName: { type: Type.STRING, description: "The name of the grammatical form, e.g., 'Past Tense', 'Plural'." },
                    value: { type: Type.STRING, description: "The word in that grammatical form, e.g., 'backed', 'backs'." },
                  },
                  required: ["formName", "value"],
                },
              },
            },
             required: ["partOfSpeech", "forms"],
          },
        },
        required: ["word", "englishDefinition", "chineseTranslation", "usageExamples", "derivatives", "vowelSwaps", "grammar"],
      },
    },
  },
  required: ["memoryStory", "groupsByMeaning", "groupsByPronunciation", "wordDetails"],
};

export const analyzeWords = async (words: string[], prefix: string): Promise<AnalysisResult> => {
  const prompt = `
    You are an expert English teacher for Chinese speakers, specializing in phonics and memory techniques.
    Analyze the following list of English words that start with "${prefix}": ${words.join(', ')}.
    Your response MUST be a single valid JSON object that strictly adheres to the provided schema. Do not include any text outside of the JSON object.

    Here are your tasks for the analysis:

    1.  **Memory Story:** Create an engaging and short story in both English and Chinese that uses several key words from the list. This story should be memorable and help connect the words.
    2.  **Group by Meaning:** Group the words into semantically related clusters. Provide a concise English and Chinese name for each group.
    3.  **Group by Vowel Sound:** Group the words based on the pronunciation of the first main vowel sound after the initial consonant(s). For each group, provide a simple sound description (e.g., "short 'a' sound like in 'cat'") and its IPA symbol.
    4.  **Detailed Word Analysis:** For EACH word in the original list, provide the following details:
        *   'word': The word itself.
        *   'englishDefinition': A clear and simple English definition.
        *   'chineseTranslation': The primary Chinese translation.
        *   'usageExamples': Provide 2 usage examples, each with an English sentence and its Chinese translation.
        *   'derivatives': List 1-2 words formed by adding prefixes or suffixes (e.g., 'basic' -> 'basically'). Provide the Chinese translation for each derivative. If none, provide an empty array.
        *   'vowelSwaps': List 1-2 new words formed by swapping only the vowels (e.g., 'bad' -> 'bed', 'bid'). Provide the Chinese translation for each new word. If none, provide an empty array.
        *   'grammar': Specify the primary part of speech. For verbs, list forms like past tense, past participle, present participle. For nouns, list the plural form. For adjectives, list comparative and superlative forms. Store these in the 'forms' array as objects, each with a 'formName' (e.g., 'Past Tense') and 'value' (e.g., 'backed').
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Invalid JSON response from AI.");
  }
};