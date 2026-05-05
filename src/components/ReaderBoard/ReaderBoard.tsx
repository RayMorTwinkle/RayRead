'use client';

import { Button, Card, Divider, Typewriter } from 'animal-island-ui';
import { FileText, Link, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getChunkVisualStyle } from '@/lib/chunk-style';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/store/config-store';
import { useReadingStore } from '@/store/reading-store';
import { ChunkItem } from './ChunkItem';

const SAMPLE_TEXT =
  'RayRead 像一座安静的小岛。你把一段很长的文字放进来，它会先切成一句一句的小木牌。然后，当前句子会被轻轻点亮，其余内容退到背景里。这样阅读时不需要追赶整片文字，只要跟着眼前这一句，慢慢往前走。';

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function ReaderBoard() {
  const chunks = useReadingStore((state) => state.chunks);
  const currentIndex = useReadingStore((state) => state.currentIndex);
  const parseText = useReadingStore((state) => state.parseText);
  const clearText = useReadingStore((state) => state.clearText);
  const rawText = useReadingStore((state) => state.rawText);
  const colorPalette = useConfigStore((state) => state.colorPalette);
  const readingMode = useConfigStore((state) => state.readingMode);
  const enableDopamine = useConfigStore((state) => state.enableDopamine);
  const dopamineLevel = useConfigStore((state) => state.dopamineLevel);
  const enableFocus = useConfigStore((state) => state.enableFocus);
  const focusLevel = useConfigStore((state) => state.focusLevel);
  const enableSizeVariation = useConfigStore((state) => state.enableSizeVariation);
  const enableBackgroundHighlight = useConfigStore((state) => state.enableBackgroundHighlight);
  const activeRefs = useRef<Array<HTMLElement | null>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');

  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const urlValid = urlInput.trim().length > 0 && isValidUrl(urlInput.trim());

  useEffect(() => {
    activeRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentIndex]);

  useEffect(() => {
    if (fileError) {
      const timer = setTimeout(() => setFileError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [fileError]);

  const progressLabel = useMemo(() => {
    if (chunks.length === 0) {
      return '等待文本';
    }

    return `${currentIndex + 1} / ${chunks.length}`;
  }, [chunks.length, currentIndex]);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.txt')) {
        setFileError('仅支持 .txt 文件');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          parseText(content);
          setFileError('');
        }
      };
      reader.readAsText(file);
    },
    [parseText]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleUrlImport = useCallback(async () => {
    const trimmed = urlInput.trim();
    if (!isValidUrl(trimmed)) return;

    setUrlLoading(true);
    setUrlError('');

    try {
      const res = await fetch(`/api/fetch-url?url=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setUrlError(data.error || '抓取失败，请检查 URL 是否可访问');
        return;
      }

      if (data.text && data.text.trim().length > 0) {
        parseText(data.text);
        setUrlInput('');
      } else {
        setUrlError('该页面未提取到有效文本内容');
      }
    } catch {
      setUrlError('网络请求失败，请稍后重试');
    } finally {
      setUrlLoading(false);
    }
  }, [urlInput, parseText]);

  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && urlValid && !urlLoading) {
        handleUrlImport();
      }
    },
    [urlValid, urlLoading, handleUrlImport]
  );

  return (
    <Card
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-hidden p-6 transition-colors lg:p-8',
        isDragging && 'border-[#19c8b9]'
      )}
      type="title"
    >
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

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <label className="text-sm font-black uppercase tracking-[0.18em] text-[#9f927d]" htmlFor="rayread-input">
            Paste Text
          </label>
          <p className="mt-1 text-xs font-bold text-[#9f927d]">
            {rawText.length > 0 ? `${rawText.length} 字符，已切分 ${chunks.length} 句` : '支持中文与英文句号、问号、感叹号切分'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="small" type="dashed" onClick={() => fileInputRef.current?.click()}>
            导入文件
          </Button>
          <Button size="small" type="dashed" onClick={() => setShowUrlInput((prev) => !prev)}>
            {showUrlInput ? '收起' : '导入URL'}
          </Button>
          <Button size="small" type="dashed" onClick={() => parseText(SAMPLE_TEXT)}>
            载入示例
          </Button>
          <Button disabled={rawText.length === 0} size="small" type="text" onClick={clearText}>
            清空
          </Button>
        </div>
      </div>
      <textarea
        id="rayread-input"
        className="mt-3 h-28 w-full rounded-[28px] border-[3px] border-[#c4b89e] bg-[#fffdf2] p-5 text-base font-medium leading-7 text-bark shadow-[0_4px_0_0_#d4c9b4] outline-none transition focus:border-[#ffcc00] focus:shadow-[0_4px_0_0_#e0b800,0_0_0_3px_rgba(255,204,0,0.15)] lg:h-32"
        placeholder="在这里粘贴想阅读的内容。RayRead 会按中英文标点切分，并保留原标点。"
        value={rawText}
        onChange={(event) => parseText(event.target.value)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleFileInputChange}
      />
      {fileError && (
        <span className="mt-1 inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500">{fileError}</span>
      )}

      {showUrlInput && (
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Link size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9f927d]" />
            <input
              type="url"
              className="w-full rounded-[28px] border-[3px] border-[#c4b89e] bg-[#fffdf2] py-3 pl-10 pr-4 text-sm font-medium text-bark shadow-[0_4px_0_0_#d4c9b4] outline-none transition focus:border-[#ffcc00] focus:shadow-[0_4px_0_0_#e0b800,0_0_0_3px_rgba(255,204,0,0.15)]"
              placeholder="输入网页 URL，提取正文内容"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setUrlError('');
              }}
              onKeyDown={handleUrlKeyDown}
            />
          </div>
          <Button size="small" type="dashed" disabled={!urlValid || urlLoading} onClick={handleUrlImport}>
            {urlLoading ? '导入中...' : '导入'}
          </Button>
        </div>
      )}
      {urlError && (
        <p className="mt-1 text-xs font-bold text-red-500">{urlError}</p>
      )}

      <div
        className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[30px] bg-[#fffdf2]/70 px-3 py-4 scroll-smooth"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {chunks.length > 0 ? (
          readingMode === 'document' ? (
            <div className="mx-auto max-w-3xl px-3 py-10 lg:px-6">
              <div className="rounded-[28px] bg-[#fffdf2] px-5 py-6 text-lg leading-[2.1] text-bark shadow-[inset_0_2px_0_rgba(255,255,255,0.75)] lg:px-8 lg:py-8 lg:text-[1.15rem]">
                {chunks.map((chunk, index) => {
                  const visualStyle = getChunkVisualStyle(
                    chunk.text,
                    index,
                    colorPalette,
                    enableDopamine,
                    dopamineLevel,
                    enableSizeVariation,
                    enableBackgroundHighlight
                  );

                  return (
                    <ChunkItem
                      key={chunk.id}
                      ref={(node) => {
                        activeRefs.current[index] = node;
                      }}
                      chunk={chunk}
                      isActive={index === currentIndex}
                      enableFocus={enableFocus}
                      focusLevel={focusLevel}
                      displayMode="inline"
                      className={cn(
                        'inline rounded-[8px] px-1 py-0.5 align-baseline',
                        visualStyle.sizeClass,
                        visualStyle.weightClass,
                        visualStyle.italicClass,
                        visualStyle.underlineClass
                      )}
                      backgroundColor={visualStyle.backgroundColor}
                      textColor={visualStyle.textColor}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-3 py-[30vh]">
              {chunks.map((chunk, index) => {
                const visualStyle = getChunkVisualStyle(
                  chunk.text,
                  index,
                  colorPalette,
                  enableDopamine,
                  dopamineLevel,
                  enableSizeVariation,
                  enableBackgroundHighlight
                );

                return (
                  <ChunkItem
                    key={chunk.id}
                    ref={(node) => {
                      activeRefs.current[index] = node;
                    }}
                    chunk={chunk}
                    isActive={index === currentIndex}
                    enableFocus={enableFocus}
                    focusLevel={focusLevel}
                    className={cn(
                      visualStyle.sizeClass,
                      visualStyle.weightClass,
                      visualStyle.italicClass,
                      visualStyle.underlineClass
                    )}
                    backgroundColor={visualStyle.backgroundColor}
                    textColor={visualStyle.textColor}
                  />
                );
              })}
            </div>
          )
        ) : (
          <div className="flex h-full min-h-52 items-center justify-center text-center text-[#9f927d]">
            <Typewriter speed={36}>小岛还没有文字。贴一段文章、笔记或小说片段进来吧。</Typewriter>
          </div>
        )}
      </div>
    </Card>
  );
}
