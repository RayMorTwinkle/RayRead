'use client';

import { useEffect, useRef, useState } from 'react';
import { useConfigStore } from '@/store/config-store';
import { useReadingStore } from '@/store/reading-store';

interface ReadingStats {
  readingTimeSeconds: number;
  readSentenceCount: number;
  totalSentenceCount: number;
  estimatedRemainingSeconds: number;
}

export function useReadingStats(): ReadingStats {
  const isPlaying = useReadingStore((s) => s.isPlaying);
  const currentIndex = useReadingStore((s) => s.currentIndex);
  const chunks = useReadingStore((s) => s.chunks);
  const readingSpeed = useConfigStore((s) => s.readingSpeed);

  const [readingTimeSeconds, setReadingTimeSeconds] = useState(0);
  const maxReadRef = useRef(0);

  useEffect(() => {
    if (chunks.length === 0) {
      setReadingTimeSeconds(0);
      maxReadRef.current = 0;
    }
  }, [chunks.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setReadingTimeSeconds((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  if (currentIndex + 1 > maxReadRef.current) {
    maxReadRef.current = currentIndex + 1;
  }
  const readSentenceCount = maxReadRef.current;

  const totalSentenceCount = chunks.length;

  let remainingChars = 0;
  for (let i = currentIndex + 1; i < chunks.length; i++) {
    remainingChars += chunks[i].length;
  }
  const estimatedRemainingSeconds = readingSpeed > 0 ? remainingChars / readingSpeed : 0;

  return {
    readingTimeSeconds,
    readSentenceCount,
    totalSentenceCount,
    estimatedRemainingSeconds
  };
}
