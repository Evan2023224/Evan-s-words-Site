import { useState, useEffect, useCallback } from 'react';
import type { LearningStatus } from '../types';

const STORAGE_KEY = 'wordLearningStatus';

export const useWordStatus = () => {
  const [wordStatuses, setWordStatuses] = useState<{ [word: string]: LearningStatus }>({});

  useEffect(() => {
    try {
      const storedStatuses = window.localStorage.getItem(STORAGE_KEY);
      if (storedStatuses) {
        setWordStatuses(JSON.parse(storedStatuses));
      }
    } catch (error) {
      console.error("Failed to load word statuses from localStorage", error);
    }
  }, []);

  const setWordStatus = useCallback((word: string, status: LearningStatus) => {
    setWordStatuses(prevStatuses => {
      const newStatuses = { ...prevStatuses, [word]: status };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatuses));
      } catch (error) {
        console.error("Failed to save word statuses to localStorage", error);
      }
      return newStatuses;
    });
  }, []);

  return { wordStatuses, setWordStatus };
};