'use client';

import { create } from 'zustand';
import { parseTextToChunks, type ParsedChunk } from '@/lib/parser';

export type { ParsedChunk } from '@/lib/parser';

export interface ReadingState {
  rawText: string;
  chunks: ParsedChunk[];
  currentIndex: number;
  isPlaying: boolean;
  parseText: (text: string) => void;
  nextChunk: () => void;
  prevChunk: () => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
}

export const useReadingStore = create<ReadingState>((set) => ({
  rawText: '',
  chunks: [],
  currentIndex: 0,
  isPlaying: false,
  parseText: (text) => {
    const chunks = parseTextToChunks(text);

    set({
      rawText: text,
      chunks,
      currentIndex: 0,
      isPlaying: false
    });
  },
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
  setPlaying: (playing) => set({ isPlaying: playing })
}));
