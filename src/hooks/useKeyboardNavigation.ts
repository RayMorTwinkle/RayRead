'use client';

import { useEffect } from 'react';
import { useReadingStore } from '@/store/reading-store';

const NEXT_KEYS = new Set(['ArrowRight', ' ']);
const NAV_KEYS = new Set(['ArrowRight', 'ArrowLeft', ' ']);

// 只有真正接收文字输入的 input 类型才让默认行为通过
const TEXT_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'email',
  'password',
  'tel',
  'number',
  'date',
  'datetime-local',
  'time',
  'month',
  'week'
]);

function isTypingTarget(target: EventTarget | null): boolean {
  if (target instanceof HTMLTextAreaElement) {
    return true;
  }
  if (target instanceof HTMLInputElement) {
    // radio / checkbox / button 等不算"正在输入"，方向键不应留给它们
    return TEXT_INPUT_TYPES.has(target.type);
  }
  if (target instanceof HTMLElement && target.isContentEditable) {
    return true;
  }
  return false;
}

export function useKeyboardNavigation(): void {
  const nextChunk = useReadingStore((state) => state.nextChunk);
  const prevChunk = useReadingStore((state) => state.prevChunk);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      // 文本输入场景不接管
      if (isTypingTarget(event.target)) {
        return;
      }

      // 不属于阅读导航键直接放行（Tab、字母键等）
      if (!NAV_KEYS.has(event.key)) {
        return;
      }

      // 抢在浏览器默认行为前阻止：
      // 比如 radio 组用方向键切换、空格滚动页面等
      event.preventDefault();

      // 把焦点从可能聚焦的控件（radio/button/switch）上拿走，
      // 避免后续按键继续触发原生组件的方向键行为
      if (event.target instanceof HTMLElement) {
        event.target.blur();
      }

      if (NEXT_KEYS.has(event.key)) {
        nextChunk();
      } else if (event.key === 'ArrowLeft') {
        prevChunk();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextChunk, prevChunk]);
}
