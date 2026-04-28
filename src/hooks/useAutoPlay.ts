'use client';

import { useEffect } from 'react';
import { useConfigStore } from '@/store/config-store';
import { useReadingStore } from '@/store/reading-store';

export function useAutoPlay(): void {
  const readingSpeed = useConfigStore((state) => state.readingSpeed);
  const currentIndex = useReadingStore((state) => state.currentIndex);
  const currentChunk = useReadingStore((state) => state.chunks[state.currentIndex]);
  const isPlaying = useReadingStore((state) => state.isPlaying);
  const nextChunk = useReadingStore((state) => state.nextChunk);

  useEffect(() => {
    if (!isPlaying || !currentChunk) {
      return undefined;
    }

    const duration = Math.max(700, (currentChunk.text.length / readingSpeed) * 1000);
    const timer = window.setTimeout(nextChunk, duration);

    return () => window.clearTimeout(timer);
  }, [currentChunk, currentIndex, isPlaying, nextChunk, readingSpeed]);
}
