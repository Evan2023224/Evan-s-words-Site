import React, { useState } from 'react';
import type { MeaningGroup, WordDetails, LearningStatus } from '../types';
import { WordCard } from './WordCard';

interface WordGroupProps {
  group: MeaningGroup;
  wordDetailsMap: Map<string, WordDetails>;
  speak: (text: string) => void;
  filteredWords: Set<string>;
  wordStatuses: { [word: string]: LearningStatus };
  setWordStatus: (word: string, status: LearningStatus) => void;
}

export const WordGroup: React.FC<WordGroupProps> = ({ group, wordDetailsMap, speak, filteredWords, wordStatuses, setWordStatus }) => {
  const [isOpen, setIsOpen] = useState(true);

  const wordDetailsList = group.words
    .filter(word => filteredWords.has(word))
    .map(word => wordDetailsMap.get(word))
    .filter((details): details is WordDetails => details !== undefined);

  if (wordDetailsList.length === 0) {
    return null;
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left p-4 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      >
        <div className="flex justify-between items-center">
            <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{group.groupName.chinese}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{group.groupName.english}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className="px-2 py-1 text-xs font-semibold text-sky-800 bg-sky-100 dark:bg-sky-900 dark:text-sky-200 rounded-full">
                    {wordDetailsList.length} words
                </span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
            </div>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 bg-white dark:bg-slate-800">
          {wordDetailsList.map(details => (
            <WordCard 
                key={details.word} 
                details={details} 
                speak={speak}
                status={wordStatuses[details.word] || 'Not Started'}
                setStatus={setWordStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};