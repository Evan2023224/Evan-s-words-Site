import React from 'react';
import type { WordDetails, LearningStatus } from '../types';
import { VolumeUpIcon, CircleIcon, BrainIcon, CheckCircleIcon } from './icons';

interface WordCardProps {
  details: WordDetails;
  speak: (text: string) => void;
  status: LearningStatus;
  setStatus: (word: string, status: LearningStatus) => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="font-semibold text-slate-600 dark:text-slate-400 text-sm mb-1">{title}</h4>
    {children}
  </div>
);

const StatusButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    activeClass: string;
    label: string;
}> = ({ onClick, isActive, children, activeClass, label }) => {
    const baseClasses = "flex-1 flex flex-col items-center justify-center p-2 rounded-md transition-all duration-200 text-xs sm:text-sm";
    const activeStateClasses = isActive ? `${activeClass} text-white shadow` : "bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700";
    return (
        <button onClick={onClick} className={`${baseClasses} ${activeStateClasses}`}>
            {children}
            <span className="mt-1 font-medium">{label}</span>
        </button>
    );
};

export const WordCard: React.FC<WordCardProps> = ({ details, speak, status, setStatus }) => {
  const statusColors: Record<LearningStatus, string> = {
    'Not Started': 'border-slate-300 dark:border-slate-600',
    'Learning': 'border-amber-400 dark:border-amber-500',
    'Mastered': 'border-green-400 dark:border-green-500',
  };

  return (
    <div className={`p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 ${statusColors[status]}`}>
      <header className="flex items-baseline gap-4 mb-3">
        <h3 className="text-2xl font-bold text-sky-700 dark:text-sky-400">{details.word}</h3>
        <p className="text-slate-500 dark:text-slate-400">{details.chineseTranslation}</p>
        <button onClick={() => speak(details.word)} className="ml-auto text-slate-500 hover:text-sky-500 transition">
          <VolumeUpIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="space-y-4">
        <p className="text-slate-700 dark:text-slate-300">{details.englishDefinition}</p>
        
        <DetailSection title="用法举例 (Usage Examples)">
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
            {details.usageExamples.map((ex, i) => (
              <li key={i}>
                <span>{ex.english}</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400 ml-4">{ex.chinese}</span>
              </li>
            ))}
          </ul>
        </DetailSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailSection title="语法 (Grammar)">
              <div className="text-sm">
                <span className="font-medium text-slate-800 dark:text-slate-200">{details.grammar.partOfSpeech}</span>
                <div className="text-slate-500 dark:text-slate-400">
                    {details.grammar.forms.map((form) => (
                        <p key={form.formName}>{form.formName}: {form.value}</p>
                    ))}
                </div>
              </div>
            </DetailSection>

            <DetailSection title="派生词 (Derivatives)">
              <div className="flex flex-wrap gap-2">
                {details.derivatives.length > 0 ? details.derivatives.map(d => (
                  <span key={d.word} className="text-sm px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    {d.word} ({d.chineseTranslation})
                  </span>
                )) : <span className="text-sm text-slate-400 italic">无</span>}
              </div>
            </DetailSection>

            <DetailSection title="元音替换词 (Vowel Swaps)">
              <div className="flex flex-wrap gap-2">
                {details.vowelSwaps.length > 0 ? details.vowelSwaps.map(v => (
                  <span key={v.word} className="text-sm px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                    {v.word} ({v.chineseTranslation})
                  </span>
                )) : <span className="text-sm text-slate-400 italic">无</span>}
              </div>
            </DetailSection>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <div className="flex gap-2 sm:gap-4 text-slate-600 dark:text-slate-300">
                <StatusButton onClick={() => setStatus(details.word, 'Not Started')} isActive={status === 'Not Started'} activeClass="bg-slate-500" label="未开始">
                    <CircleIcon className="w-5 h-5" />
                </StatusButton>
                <StatusButton onClick={() => setStatus(details.word, 'Learning')} isActive={status === 'Learning'} activeClass="bg-amber-500" label="学习中">
                    <BrainIcon className="w-5 h-5" />
                </StatusButton>
                <StatusButton onClick={() => setStatus(details.word, 'Mastered')} isActive={status === 'Mastered'} activeClass="bg-green-500" label="已掌握">
                    <CheckCircleIcon className="w-5 h-5" />
                </StatusButton>
            </div>
        </div>

      </div>
    </div>
  );
};