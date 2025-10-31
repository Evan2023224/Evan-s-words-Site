import React, { useState, useCallback, useMemo } from 'react';
import { analyzeWords } from './services/geminiService';
import { LONGMAN_WORDS } from './constants/words';
import type { AnalysisResult, WordDetails, LearningStatus } from './types';
import { Spinner } from './components/Spinner';
import { BookOpenIcon, SparklesIcon, TagIcon, VolumeUpIcon, BrainIcon, CheckCircleIcon, CircleIcon } from './components/icons';
import { WordGroup } from './components/WordGroup';
import { useWordStatus } from './hooks/useWordStatus';

const App: React.FC = () => {
  const [prefix, setPrefix] = useState<string>('ba');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const { wordStatuses, setWordStatus } = useWordStatus();

  // State for filters
  const [filterPartOfSpeech, setFilterPartOfSpeech] = useState<string>('all');
  const [filterWordLength, setFilterWordLength] = useState<{ min: number; max: number }>({ min: 0, max: 99 });
  const [filterLearningStatus, setFilterLearningStatus] = useState<LearningStatus | 'all'>('all');


  const wordDetailsMap = useMemo(() => {
    if (!analysisResult) return new Map<string, WordDetails>();
    return new Map(analysisResult.wordDetails.map(detail => [detail.word, detail]));
  }, [analysisResult]);

  const handleAnalyzeClick = useCallback(async () => {
    if (!prefix) {
      setError('请输入单词前缀。Please enter a word prefix.');
      return;
    }

    const filteredWordsList = LONGMAN_WORDS.filter(word => word.toLowerCase().startsWith(prefix.toLowerCase()));

    if (filteredWordsList.length === 0) {
      setError(`未找到以 "${prefix}" 开头的单词。No words found starting with "${prefix}".`);
      setAnalysisResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    // Reset filters on new analysis
    setFilterPartOfSpeech('all');
    setFilterWordLength({ min: 0, max: 99 });
    setFilterLearningStatus('all');

    try {
      const result = await analyzeWords(filteredWordsList, prefix);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      setError('调用AI分析时出错，请稍后再试。Error calling AI for analysis. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [prefix]);

  const speak = (text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Your browser does not support text-to-speech.');
    }
  };

  const availablePartsOfSpeech = useMemo(() => {
    if (!analysisResult) return [];
    const parts = new Set(analysisResult.wordDetails.map(d => d.grammar.partOfSpeech));
    return Array.from(parts).sort();
  }, [analysisResult]);

  const filteredWords = useMemo(() => {
    if (!analysisResult) return new Set<string>();

    const words = analysisResult.wordDetails
        .filter(detail => {
            const posMatch = filterPartOfSpeech === 'all' || detail.grammar.partOfSpeech === filterPartOfSpeech;
            const lenMatch = detail.word.length >= filterWordLength.min && detail.word.length <= filterWordLength.max;
            const statusMatch = filterLearningStatus === 'all' || (wordStatuses[detail.word] || 'Not Started') === filterLearningStatus;
            return posMatch && lenMatch && statusMatch;
        })
        .map(detail => detail.word);

    return new Set(words);
  }, [analysisResult, filterPartOfSpeech, filterWordLength, filterLearningStatus, wordStatuses]);

  const progressSummary = useMemo(() => {
    if (!analysisResult) return { mastered: 0, learning: 0, notStarted: 0, total: 0 };
    let mastered = 0;
    let learning = 0;
    let notStarted = 0;
    
    analysisResult.wordDetails.forEach(detail => {
      const status = wordStatuses[detail.word] || 'Not Started';
      if (status === 'Mastered') mastered++;
      else if (status === 'Learning') learning++;
      else notStarted++;
    });

    return { mastered, learning, notStarted, total: analysisResult.wordDetails.length };
  }, [analysisResult, wordStatuses]);


  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">发音记忆法背单词</h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">AI-Powered English Word Memorizer</p>
        </header>

        <div className="sticky top-4 z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="输入单词前缀, e.g., ba"
              className="flex-grow px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
            <button
              onClick={handleAnalyzeClick}
              disabled={isLoading}
              className="px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? <Spinner /> : <><SparklesIcon className="w-5 h-5 mr-2" /><span>AI 分析 (Analyze)</span></>}
            </button>
          </div>
        </div>

        <main className="mt-8">
          {error && <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg" role="alert">{error}</div>}
          
          {!isLoading && !analysisResult && !error && (
            <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">准备开始学习！</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">输入一个单词前缀（例如 "pre", "con", "ba"），然后点击 "AI 分析" 按钮，开始你的单词记忆之旅。</p>
            </div>
          )}
          
          {analysisResult && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">筛选 (Filter)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="pos-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">词性</label>
                      <select id="pos-filter" value={filterPartOfSpeech} onChange={e => setFilterPartOfSpeech(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition">
                        <option value="all">All</option>
                        {availablePartsOfSpeech.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="min-len-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">最短长度</label>
                      <input type="number" id="min-len-filter" value={filterWordLength.min} onChange={e => setFilterWordLength(prev => ({...prev, min: Number(e.target.value) || 0}))} min="0" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition" />
                    </div>
                    <div>
                      <label htmlFor="max-len-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">最长长度</label>
                      <input type="number" id="max-len-filter" value={filterWordLength.max} onChange={e => setFilterWordLength(prev => ({...prev, max: Number(e.target.value) || 99}))} min="0" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition" />
                    </div>
                     <div>
                      <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">学习状态</label>
                      <select id="status-filter" value={filterLearningStatus} onChange={e => setFilterLearningStatus(e.target.value as LearningStatus | 'all')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition">
                        <option value="all">All</option>
                        <option value="Not Started">Not Started</option>
                        <option value="Learning">Learning</option>
                        <option value="Mastered">Mastered</option>
                      </select>
                    </div>
                  </div>
                </div>
                 <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">进度 (Progress)</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm"><span className="text-green-600 dark:text-green-400 font-medium">已掌握 (Mastered)</span><span>{progressSummary.mastered} / {progressSummary.total}</span></div>
                        <div className="flex justify-between items-center text-sm"><span className="text-amber-600 dark:text-amber-400 font-medium">学习中 (Learning)</span><span>{progressSummary.learning} / {progressSummary.total}</span></div>
                        <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400 font-medium">未开始 (Not Started)</span><span>{progressSummary.notStarted} / {progressSummary.total}</span></div>
                    </div>
                </div>
              </div>


              <div className="space-y-8">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold flex items-center mb-4 text-sky-600 dark:text-sky-400"><BookOpenIcon className="w-7 h-7 mr-3"/>记忆故事 (Memory Story)</h2>
                  <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
                    <div>
                      <h3 className="flex items-center">English Story <button onClick={() => speak(analysisResult.memoryStory.english)} className="ml-2 text-sky-500 hover:text-sky-700"><VolumeUpIcon className="w-5 h-5"/></button></h3>
                      <p>{analysisResult.memoryStory.english}</p>
                    </div>
                    <div>
                      <h3>中文故事</h3>
                      <p>{analysisResult.memoryStory.chinese}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold flex items-center mb-4 text-sky-600 dark:text-sky-400"><TagIcon className="w-7 h-7 mr-3"/>按意思分组 (Grouped by Meaning)</h2>
                  <div className="space-y-6">
                    {analysisResult.groupsByMeaning.map((group) => (
                      <WordGroup 
                        key={group.groupName.english}
                        group={group}
                        wordDetailsMap={wordDetailsMap}
                        speak={speak}
                        filteredWords={filteredWords}
                        wordStatuses={wordStatuses}
                        setWordStatus={setWordStatus}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold flex items-center mb-4 text-sky-600 dark:text-sky-400"><VolumeUpIcon className="w-7 h-7 mr-3"/>按发音分组 (Grouped by Pronunciation)</h2>
                  <div className="space-y-6">
                  {analysisResult.groupsByPronunciation.map((group) => {
                      const wordsInGroup = group.words.filter(word => filteredWords.has(word));
                      if (wordsInGroup.length === 0) return null;

                      return (
                        <div key={group.soundDescription} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <h3 className="font-bold text-lg text-teal-600 dark:text-teal-400">{group.soundDescription} <span className="text-sm font-mono text-slate-500">({group.ipa})</span></h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {wordsInGroup.map(word => (
                              <span key={word} className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-full text-sm font-medium">{word}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;