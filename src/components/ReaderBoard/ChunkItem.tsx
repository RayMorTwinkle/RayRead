'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { ParsedChunk } from '@/store/reading-store';

interface ChunkItemProps {
  chunk: ParsedChunk;
  isActive: boolean;
  enableFocus: boolean;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const ChunkItem = forwardRef<HTMLParagraphElement, ChunkItemProps>(
  ({ chunk, isActive, enableFocus, className, backgroundColor, textColor }, ref) => {
    const muted = enableFocus && !isActive;

    return (
      <motion.p
        ref={ref}
        layout
        animate={{
          opacity: muted ? 0.3 : 1,
          scale: enableFocus && isActive ? 1.05 : 1
        }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className={cn(
          'origin-center rounded-[26px] px-4 py-3 leading-[1.9] tracking-wide text-bark transition-colors',
          isActive ? 'bg-[#fff7d6]' : '',
          className
        )}
        style={{ backgroundColor: backgroundColor ?? undefined, color: textColor ?? undefined }}
      >
        {chunk.text}
      </motion.p>
    );
  }
);

ChunkItem.displayName = 'ChunkItem';
