'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ColorPalette = 'morandi' | 'macaron' | 'high-contrast';

export interface AppConfigState {
  readingSpeed: number;
  colorPalette: ColorPalette;
  enableDopamine: boolean;
  enableFocus: boolean;
  hasHydrated: boolean;
  setTheme: (theme: ColorPalette) => void;
  setReadingSpeed: (speed: number) => void;
  setEnableDopamine: (enabled: boolean) => void;
  setEnableFocus: (enabled: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useConfigStore = create<AppConfigState>()(
  persist(
    (set) => ({
      readingSpeed: 10,
      colorPalette: 'morandi',
      enableDopamine: true,
      enableFocus: true,
      hasHydrated: false,
      setTheme: (theme) => set({ colorPalette: theme }),
      setReadingSpeed: (speed) => set({ readingSpeed: Math.min(40, Math.max(2, speed)) }),
      setEnableDopamine: (enabled) => set({ enableDopamine: enabled }),
      setEnableFocus: (enabled) => set({ enableFocus: enabled }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated })
    }),
    {
      name: 'rayread-config',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        readingSpeed: state.readingSpeed,
        colorPalette: state.colorPalette,
        enableDopamine: state.enableDopamine,
        enableFocus: state.enableFocus
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
