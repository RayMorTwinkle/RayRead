'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { parseTextToChunks, type ParsedChunk } from '@/lib/parser';

export type { ParsedChunk } from '@/lib/parser';

export interface ReadingState {
  rawText: string;
  chunks: ParsedChunk[];
  currentIndex: number;
  isPlaying: boolean;
  hasHydrated: boolean;
  parseText: (text: string) => void;
  clearText: () => void;
  nextChunk: () => void;
  prevChunk: () => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  restoreReading: (rawText: string, currentIndex: number) => void;
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      rawText: '',
      chunks: [],
      currentIndex: 0,
      isPlaying: false,
      hasHydrated: false,
      parseText: (text) => {
        const chunks = parseTextToChunks(text);

        set({
          rawText: text,
          chunks,
          currentIndex: 0,
          isPlaying: false
        });
      },
      clearText: () =>
        set({
          rawText: '',
          chunks: [],
          currentIndex: 0,
          isPlaying: false
        }),
      nextChunk: () =>
        set((state) => ({
          currentIndex: Math.min(state.currentIndex + 1, Math.max(state.chunks.length - 1, 0)),
          isPlaying: state.currentIndex >= state.chunks.length - 1 ? false : state.isPlaying
        })),
      prevChunk: () =>
        set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0)
        })),
      togglePlay: () =>
        set((state) => ({
          isPlaying: state.chunks.length > 0 ? !state.isPlaying : false
        })),
      setPlaying: (playing) => set({ isPlaying: playing }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      restoreReading: (rawText, currentIndex) => {
        const chunks = parseTextToChunks(rawText);

        set({
          rawText,
          chunks,
          currentIndex: Math.min(currentIndex, Math.max(chunks.length - 1, 0)),
          isPlaying: false
        });
      }
    }),
    {
      name: 'rayread-reading',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        rawText: state.rawText,
        currentIndex: state.currentIndex
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.rawText) {
          state.restoreReading(state.rawText, state.currentIndex);
        }
        state?.setHasHydrated(true);
      }
    }
  )
);
