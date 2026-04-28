'use client';

import { Card, Divider, Typewriter } from 'animal-island-ui';
import { FileText } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { getChunkVisualStyle } from '@/lib/chunk-style';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/store/config-store';
import { useReadingStore } from '@/store/reading-store';
import { ChunkItem } from './ChunkItem';

export function ReaderBoard() {
  const chunks = useReadingStore((state) => state.chunks);
  const currentIndex = useReadingStore((state) => state.currentIndex);
  const parseText = useReadingStore((state) => state.parseText);
  const rawText = useReadingStore((state) => state.rawText);
  const colorPalette = useConfigStore((state) => state.colorPalette);
  const enableDopamine = useConfigStore((state) => state.enableDopamine);
  const enableFocus = useConfigStore((state) => state.enableFocus);
  const activeRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useEffect(() => {
    activeRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentIndex]);

  const progressLabel = useMemo(() => {
    if (chunks.length === 0) {
      return '等待文本';
    }

    return `${currentIndex + 1} / ${chunks.length}`;
  }, [chunks.length, currentIndex]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-6 lg:p-8" type="title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e6f9f6] text-[#19c8b9]">
            <FileText size={24} strokeWidth={2.5} />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-wide text-bark">RayRead</h1>
            <p className="text-sm font-semibold text-[#9f927d]">粘贴文本，然后让视线跟着句子温柔巡航。</p>
          </div>
        </div>
        <span className="rounded-full bg-[#ffec99] px-4 py-2 text-sm font-black text-bark">{progressLabel}</span>
      </div>

      <Divider type="wave-yellow" />

      <label className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#9f927d]" htmlFor="rayread-input">
        Paste Text
      </label>
      <textarea
        id="rayread-input"
        className="mt-3 h-32 w-full rounded-[28px] border-[3px] border-[#c4b89e] bg-[#fffdf2] p-5 text-base font-medium leading-7 text-bark shadow-[0_4px_0_0_#d4c9b4] outline-none transition focus:border-[#ffcc00] focus:shadow-[0_4px_0_0_#e0b800,0_0_0_3px_rgba(255,204,0,0.15)]"
        placeholder="在这里粘贴想阅读的内容。RayRead 会按中英文标点切分，并保留原标点。"
        value={rawText}
        onChange={(event) => parseText(event.target.value)}
      />

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[30px] bg-[#fffdf2]/70 px-3 py-4">
        {chunks.length > 0 ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-3 py-[30vh]">
            {chunks.map((chunk, index) => {
              const visualStyle = getChunkVisualStyle(chunk.text, index, colorPalette, enableDopamine);

              return (
                <ChunkItem
                  key={chunk.id}
                  ref={(node) => {
                    activeRefs.current[index] = node;
                  }}
                  chunk={chunk}
                  isActive={index === currentIndex}
                  enableFocus={enableFocus}
                  className={cn(
                    visualStyle.sizeClass,
                    visualStyle.weightClass,
                    visualStyle.underlineClass
                  )}
                  backgroundColor={visualStyle.backgroundColor}
                  textColor={visualStyle.textColor}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-52 items-center justify-center text-center text-[#9f927d]">
            <Typewriter speed={36}>小岛还没有文字。贴一段文章、笔记或小说片段进来吧。</Typewriter>
          </div>
        )}
      </div>
    </Card>
  );
}
