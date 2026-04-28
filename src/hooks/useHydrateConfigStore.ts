'use client';

import { useEffect } from 'react';
import { useConfigStore } from '@/store/config-store';

export function useHydrateConfigStore(): void {
  useEffect(() => {
    void useConfigStore.persist.rehydrate();
  }, []);
}
