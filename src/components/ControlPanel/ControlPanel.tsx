'use client';

import { Button, Card, Collapse, Divider, Switch } from 'animal-island-ui';
import { ChevronLeft, ChevronRight, Gauge, Keyboard, Palette, Play, Pause, Sparkles } from 'lucide-react';
import type { ColorPalette } from '@/store/config-store';
import { useConfigStore } from '@/store/config-store';
import { useReadingStore } from '@/store/reading-store';

const PALETTE_OPTIONS: Array<{ value: ColorPalette; label: string }> = [
  { value: 'morandi', label: 'Morandi' },
  { value: 'macaron', label: 'Macaron' },
  { value: 'high-contrast', label: 'High Contrast' }
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
  const enableDopamine = useConfigStore((state) => state.enableDopamine);
  const enableFocus = useConfigStore((state) => state.enableFocus);
  const setReadingSpeed = useConfigStore((state) => state.setReadingSpeed);
  const setTheme = useConfigStore((state) => state.setTheme);
  const setEnableDopamine = useConfigStore((state) => state.setEnableDopamine);
  const setEnableFocus = useConfigStore((state) => state.setEnableFocus);
  const canRead = chunksLength > 0;
  const progressPercent = canRead ? Math.round(((currentIndex + 1) / chunksLength) * 100) : 0;

  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[280px]">
      <Button
        block
        className="min-h-[100px] text-xl font-black"
        disabled={!canRead}
        icon={isPlaying ? <Pause size={24} /> : <Play size={24} />}
        size="large"
        type="primary"
        onClick={togglePlay}
      >
        {isPlaying ? '暂停巡航' : '开始阅读'}
      </Button>

      <Card className="flex flex-1 flex-col gap-5 p-6" color="default">
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

        <Collapse
          defaultExpanded
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

        <div className="mt-auto grid gap-4 rounded-[24px] bg-[#fffdf2] p-4">
          <label className="flex items-center justify-between gap-4 text-sm font-black text-bark">
            <span className="flex items-center gap-2">
              <Sparkles size={18} /> 多巴胺样式
            </span>
            <Switch checked={enableDopamine} checkedChildren="ON" unCheckedChildren="OFF" onChange={setEnableDopamine} />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm font-black text-bark">
            <span>沉浸高亮</span>
            <Switch checked={enableFocus} checkedChildren="ON" unCheckedChildren="OFF" onChange={setEnableFocus} />
          </label>
        </div>

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
