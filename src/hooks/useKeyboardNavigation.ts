'use client';

import { useEffect } from 'react';
import { useReadingStore } from '@/store/reading-store';

const NEXT_KEYS = new Set(['ArrowRight', ' ']);

export function useKeyboardNavigation(): void {
  const nextChunk = useReadingStore((state) => state.nextChunk);
  const prevChunk = useReadingStore((state) => state.prevChunk);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const target = event.target;
      const isEditable =
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (isEditable) {
        return;
      }

      if (NEXT_KEYS.has(event.key)) {
        event.preventDefault();
        nextChunk();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevChunk();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextChunk, prevChunk]);
}
