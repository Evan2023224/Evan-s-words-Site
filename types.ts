export type LearningStatus = 'Not Started' | 'Learning' | 'Mastered';

export interface WordDetails {
  word: string;
  englishDefinition: string;
  chineseTranslation: string;
  usageExamples: {
    english: string;
    chinese: string;
  }[];
  derivatives: {
    word: string;
    chineseTranslation: string;
  }[];
  vowelSwaps: {
    word: string;
    chineseTranslation: string;
  }[];
  grammar: {
    partOfSpeech: string;
    forms: {
      formName: string;
      value: string;
    }[];
  };
}

export interface MeaningGroup {
  groupName: {
    english: string;
    chinese: string;
  };
  words: string[];
}

export interface PronunciationGroup {
  soundDescription: string;
  ipa: string;
  words: string[];
}

export interface AnalysisResult {
  memoryStory: {
    english: string;
    chinese: string;
  };
  groupsByMeaning: MeaningGroup[];
  groupsByPronunciation: PronunciationGroup[];
  wordDetails: WordDetails[];
}