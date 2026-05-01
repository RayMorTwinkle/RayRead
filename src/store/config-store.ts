'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ColorPalette = 'mid-century' | 'morandi' | 'macaron' | 'ink-wash';
export type ReadingMode = 'lyrics' | 'document';
export type DopamineLevel = 'gentle' | 'dopamine' | 'jumpy';
export type FocusLevel = 'sentence' | 'page';

export interface AppConfigState {
  readingSpeed: number;
  colorPalette: ColorPalette;
  readingMode: ReadingMode;
  enableDopamine: boolean;
  dopamineLevel: DopamineLevel;
  enableFocus: boolean;
  focusLevel: FocusLevel;
  enableSizeVariation: boolean;
  enableBackgroundHighlight: boolean;
  hasHydrated: boolean;
  setTheme: (theme: ColorPalette) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setReadingSpeed: (speed: number) => void;
  setEnableDopamine: (enabled: boolean) => void;
  setDopamineLevel: (level: DopamineLevel) => void;
  setEnableFocus: (enabled: boolean) => void;
  setFocusLevel: (level: FocusLevel) => void;
  setEnableSizeVariation: (enabled: boolean) => void;
  setEnableBackgroundHighlight: (enabled: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useConfigStore = create<AppConfigState>()(
  persist(
    (set) => ({
      readingSpeed: 10,
      colorPalette: 'macaron',
      readingMode: 'lyrics',
      enableDopamine: true,
      dopamineLevel: 'dopamine',
      enableFocus: true,
      focusLevel: 'sentence',
      enableSizeVariation: false,
      enableBackgroundHighlight: true,
      hasHydrated: false,
      setTheme: (theme) => set({ colorPalette: theme }),
      setReadingMode: (mode) => set({ readingMode: mode }),
      setReadingSpeed: (speed) => set({ readingSpeed: Math.min(40, Math.max(2, speed)) }),
      setEnableDopamine: (enabled) => set({ enableDopamine: enabled }),
      setDopamineLevel: (level) => set({ dopamineLevel: level }),
      setEnableFocus: (enabled) => set({ enableFocus: enabled }),
      setFocusLevel: (level) => set({ focusLevel: level }),
      setEnableSizeVariation: (enabled) => set({ enableSizeVariation: enabled }),
      setEnableBackgroundHighlight: (enabled) => set({ enableBackgroundHighlight: enabled }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated })
    }),
    {
      name: 'rayread-config',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        readingSpeed: state.readingSpeed,
        colorPalette: state.colorPalette,
        readingMode: state.readingMode,
        enableDopamine: state.enableDopamine,
        dopamineLevel: state.dopamineLevel,
        enableFocus: state.enableFocus,
        focusLevel: state.focusLevel,
        enableSizeVariation: state.enableSizeVariation,
        enableBackgroundHighlight: state.enableBackgroundHighlight
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
