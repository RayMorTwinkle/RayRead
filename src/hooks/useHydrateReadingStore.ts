'use client';

import { useEffect } from 'react';
import { useReadingStore } from '@/store/reading-store';

export function useHydrateReadingStore(): void {
  useEffect(() => {
    useReadingStore.persist.rehydrate();
  }, []);
}
