'use client';

import { Button, Card, Collapse, Divider, Switch } from 'animal-island-ui';
import {
  AlignLeft,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Keyboard,
  Palette,
  Play,
  Pause,
  Settings2,
  Sparkles
} from 'lucide-react';
import type { ColorPalette, DopamineLevel, FocusLevel, ReadingMode } from '@/store/config-store';
import { useConfigStore } from '@/store/config-store';
import { useReadingStore } from '@/store/reading-store';
import { cn } from '@/lib/utils';

const PALETTE_OPTIONS: Array<{ value: ColorPalette; label: string }> = [
  { value: 'macaron', label: 'Macaron' },
  { value: 'mid-century', label: 'Mid-Century' },
  { value: 'morandi', label: 'Morandi' },
  { value: 'ink-wash', label: 'Ink Wash' }
];

const READING_MODE_OPTIONS: Array<{ value: ReadingMode; label: string; description: string }> = [
  { value: 'lyrics', label: '歌词模式', description: '一句一行，适合追焦阅读' },
  { value: 'document', label: '文稿模式', description: '保留文段排版，逐句高亮' }
];

const DOPAMINE_LEVEL_OPTIONS: Array<{ value: DopamineLevel; label: string }> = [
  { value: 'gentle', label: '温和' },
  { value: 'dopamine', label: '多巴胺' },
  { value: 'jumpy', label: '跳跃' }
];

const FOCUS_LEVEL_OPTIONS: Array<{ value: FocusLevel; label: string }> = [
  { value: 'sentence', label: '句子' },
  { value: 'page', label: '全页' }
];

export function ControlPanel() {
  const chunksLength = useReadingStore((state) => state.chunks.length);
  const currentIndex = useReadingStore((state) => state.currentIndex);
  const isPlaying = useReadingStore((state) => state.isPlaying);
  const togglePlay = useReadingStore((state) => state.togglePlay);
  const nextChunk = useReadingStore((state) => state.nextChunk);
  const prevChunk = useReadingStore((state) => state.prevChunk);
  const readingSpeed = useConfigStore((state) => state.readingSpeed);
  const colorPalette = useConfigStore((state) => state.colorPalette);
  const readingMode = useConfigStore((state) => state.readingMode);
  const enableDopamine = useConfigStore((state) => state.enableDopamine);
  const dopamineLevel = useConfigStore((state) => state.dopamineLevel);
  const enableFocus = useConfigStore((state) => state.enableFocus);
  const focusLevel = useConfigStore((state) => state.focusLevel);
  const enableSizeVariation = useConfigStore((state) => state.enableSizeVariation);
  const enableBackgroundHighlight = useConfigStore((state) => state.enableBackgroundHighlight);
  const setReadingSpeed = useConfigStore((state) => state.setReadingSpeed);
  const setTheme = useConfigStore((state) => state.setTheme);
  const setReadingMode = useConfigStore((state) => state.setReadingMode);
  const setEnableDopamine = useConfigStore((state) => state.setEnableDopamine);
  const setDopamineLevel = useConfigStore((state) => state.setDopamineLevel);
  const setEnableFocus = useConfigStore((state) => state.setEnableFocus);
  const setFocusLevel = useConfigStore((state) => state.setFocusLevel);
  const setEnableSizeVariation = useConfigStore((state) => state.setEnableSizeVariation);
  const setEnableBackgroundHighlight = useConfigStore((state) => state.setEnableBackgroundHighlight);
  const canRead = chunksLength > 0;
  const progressPercent = canRead ? Math.round(((currentIndex + 1) / chunksLength) * 100) : 0;

  return (
    <aside className="flex min-h-0 w-full flex-col gap-6 lg:w-[280px]">
      <button
        type="button"
        disabled={!canRead}
        onClick={togglePlay}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-[24px] border-[3px] border-[#0fa597] bg-[#19c8b9] px-6 py-4 text-lg font-black text-white shadow-[0_4px_0_0_#0fa597] transition active:translate-y-[2px] active:shadow-[0_2px_0_0_#0fa597]',
          'hover:bg-[#22d4c5]',
          'disabled:cursor-not-allowed disabled:border-[#c4b89e] disabled:bg-[#dcd2bc] disabled:text-[#8c8170] disabled:shadow-[0_4px_0_0_#c4b89e]'
        )}
      >
        {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        <span>{isPlaying ? '暂停巡航' : '开始阅读'}</span>
      </button>

      <Card className="flex flex-col gap-5 p-6" color="default">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9f927d]">Other Options</p>
          <h2 className="mt-1 text-xl font-black text-bark">参数调节</h2>
        </div>

        <Divider type="line-teal" />

        <div className="rounded-[24px] bg-[#fffdf2] p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-black text-bark">
            <span>阅读进度</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#e7ddc5] shadow-[inset_0_2px_0_rgba(114,93,66,0.16)]">
            <div
              className="h-full rounded-full bg-[#19c8b9] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-bold text-[#9f927d]">
            {canRead ? `第 ${currentIndex + 1} 句，共 ${chunksLength} 句` : '粘贴文本后会显示进度'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button block disabled={!canRead || currentIndex === 0} icon={<ChevronLeft size={18} />} onClick={prevChunk}>
            上一句
          </Button>
          <Button
            block
            disabled={!canRead || currentIndex >= chunksLength - 1}
            icon={<ChevronRight size={18} />}
            onClick={nextChunk}
          >
            下一句
          </Button>
        </div>

        <div className="grid gap-2 rounded-[24px] bg-[#fffdf2] p-4">
          <div className="flex items-center gap-2 text-sm font-black text-bark">
            <AlignLeft size={18} /> 阅读模式
          </div>
          <div className="grid gap-2">
            {READING_MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start justify-between gap-3 rounded-[18px] border-[2px] border-transparent bg-white px-4 py-3 text-bark transition-colors"
              >
                <div>
                  <p className="text-sm font-black">{option.label}</p>
                  <p className="text-xs font-bold text-[#9f927d]">{option.description}</p>
                </div>
                <input
                  checked={readingMode === option.value}
                  className="mt-1 h-4 w-4 accent-[#19c8b9]"
                  name="readingMode"
                  type="radio"
                  value={option.value}
                  onChange={() => setReadingMode(option.value)}
                />
              </label>
            ))}
          </div>
        </div>

        <Collapse
          defaultExpanded
          className="rayread-collapse"
          question={
            <span className="flex items-center gap-2 font-black">
              <Gauge size={18} /> 阅读速度
            </span>
          }
          answer={
            <div className="space-y-3 pt-3">
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold text-[#9f927d]">字符/秒</span>
                <strong className="text-3xl font-black text-bark">{readingSpeed}</strong>
              </div>
              <input
                aria-label="阅读速度"
                className="rayread-range w-full"
                max={40}
                min={2}
                type="range"
                value={readingSpeed}
                onChange={(event) => setReadingSpeed(Number(event.target.value))}
              />
            </div>
          }
        />

        <Collapse
          defaultExpanded
          className="rayread-collapse"
          question={
            <span className="flex items-center gap-2 font-black">
              <Palette size={18} /> 色彩池
            </span>
          }
          answer={
            <div className="grid gap-2 pt-3">
              {PALETTE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between rounded-[18px] bg-[#fffdf2] px-4 py-3 text-sm font-black text-bark"
                >
                  <span>{option.label}</span>
                  <input
                    checked={colorPalette === option.value}
                    className="h-4 w-4 accent-[#19c8b9]"
                    name="colorPalette"
                    type="radio"
                    value={option.value}
                    onChange={() => setTheme(option.value)}
                  />
                </label>
              ))}
            </div>
          }
        />

        <div className="grid gap-4 rounded-[24px] bg-[#fffdf2] p-4">
          <label className="flex items-center justify-between gap-4 text-sm font-black text-bark">
            <span className="flex items-center gap-2">
              <Sparkles size={18} /> 多巴胺样式
            </span>
            <Switch checked={enableDopamine} checkedChildren="ON" unCheckedChildren="OFF" onChange={setEnableDopamine} />
          </label>
          {enableDopamine && (
            <div className="grid grid-cols-3 gap-1 rounded-[18px] bg-[#f1ead7] p-1">
              {DOPAMINE_LEVEL_OPTIONS.map((option) => {
                const active = dopamineLevel === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDopamineLevel(option.value)}
                    className={cn(
                      'rounded-[14px] px-2 py-2 text-xs font-black transition-colors',
                      active
                        ? 'bg-[#19c8b9] text-white shadow-[0_2px_0_0_#0fa597]'
                        : 'text-[#7a6a55] hover:bg-white'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
          <label className="flex items-center justify-between gap-4 text-sm font-black text-bark">
            <span>沉浸高亮</span>
            <Switch checked={enableFocus} checkedChildren="ON" unCheckedChildren="OFF" onChange={setEnableFocus} />
          </label>
          {enableFocus && (
            <div className="grid grid-cols-2 gap-1 rounded-[18px] bg-[#f1ead7] p-1">
              {FOCUS_LEVEL_OPTIONS.map((option) => {
                const active = focusLevel === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFocusLevel(option.value)}
                    className={cn(
                      'rounded-[14px] px-2 py-2 text-xs font-black transition-colors',
                      active
                        ? 'bg-[#19c8b9] text-white shadow-[0_2px_0_0_#0fa597]'
                        : 'text-[#7a6a55] hover:bg-white'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Collapse
          className="rayread-collapse"
          question={
            <span className="flex items-center gap-2 font-black">
              <Settings2 size={18} /> 高级设置
            </span>
          }
          answer={
            <div className="grid gap-3 pt-3">
              <label className="flex items-center justify-between gap-4 rounded-[18px] bg-[#fffdf2] px-4 py-3 text-sm font-black text-bark">
                <span>
                  <span className="block">字号变化</span>
                  <span className="mt-0.5 block text-xs font-bold text-[#9f927d]">句子字号轻微起伏，更生动但易疲劳</span>
                </span>
                <Switch
                  checked={enableSizeVariation}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  onChange={setEnableSizeVariation}
                />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-[18px] bg-[#fffdf2] px-4 py-3 text-sm font-black text-bark">
                <span>
                  <span className="block">句子背景色</span>
                  <span className="mt-0.5 block text-xs font-bold text-[#9f927d]">关闭后只用文字色变化，背景全透明</span>
                </span>
                <Switch
                  checked={enableBackgroundHighlight}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  onChange={setEnableBackgroundHighlight}
                />
              </label>
            </div>
          }
        />

        <div className="rounded-[22px] bg-[#e6f9f6] px-4 py-3 text-xs font-black leading-6 text-bark">
          <p className="mb-1 flex items-center gap-2 text-sm">
            <Keyboard size={16} /> 快捷键
          </p>
          <p>Space / → 下一句</p>
          <p>← 上一句</p>
        </div>
      </Card>
    </aside>
  );
}
