'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { FocusLevel } from '@/store/config-store';
import type { ParsedChunk } from '@/store/reading-store';

interface ChunkItemProps {
  chunk: ParsedChunk;
  isActive: boolean;
  enableFocus: boolean;
  focusLevel: FocusLevel;
  displayMode?: 'block' | 'inline';
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const ChunkItem = forwardRef<HTMLSpanElement, ChunkItemProps>(
  ({ chunk, isActive, enableFocus, focusLevel, displayMode = 'block', className, backgroundColor, textColor }, ref) => {
    const muted = enableFocus && !isActive;
    const mutedOpacity = focusLevel === 'page' ? 0.45 : 0.3;
    const spotlightActive = enableFocus && focusLevel === 'page' && isActive;

    return (
      <motion.span
        ref={ref}
        layout
        animate={{
          opacity: muted ? mutedOpacity : 1,
          scale: enableFocus && isActive ? 1.05 : 1
        }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className={cn(
          displayMode === 'inline'
            ? 'origin-center whitespace-pre-wrap break-words text-bark transition-colors'
            : 'block origin-center rounded-[26px] px-4 py-3 leading-[1.9] tracking-wide text-bark transition-colors',
          isActive ? 'bg-[#fff7d6]' : '',
          spotlightActive
            ? 'relative z-30 shadow-[0_0_0_8px_rgba(255,247,214,0.86),0_18px_55px_rgba(47,40,31,0.24)]'
            : '',
          className
        )}
        style={{ backgroundColor: backgroundColor ?? undefined, color: textColor ?? undefined }}
      >
        {displayMode === 'inline' ? `${chunk.text} ` : chunk.text}
      </motion.span>
    );
  }
);

ChunkItem.displayName = 'ChunkItem';
