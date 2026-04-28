import type { ColorPalette } from '@/store/config-store';
import { pickWeighted, seededPercent } from './utils';

interface ChunkVisualStyle {
  sizeClass: string;
  weightClass: string;
  underlineClass: string;
  backgroundColor: string | undefined;
  textColor: string | undefined;
}

const PALETTES: Record<ColorPalette, readonly string[]> = {
  macaron: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
  morandi: ['#E9E5CE', '#D2CDBB', '#A2A595', '#B5A8A4', '#E1DCD9'],
  'high-contrast': ['#111827', '#f59e0b', '#0f766e', '#be123c', '#1d4ed8']
};

export function getChunkVisualStyle(
  text: string,
  index: number,
  palette: ColorPalette,
  enabled: boolean
): ChunkVisualStyle {
  if (!enabled) {
    return {
      sizeClass: 'text-lg',
      weightClass: 'font-medium',
      underlineClass: '',
      backgroundColor: undefined,
      textColor: undefined
    };
  }

  const seed = `${text}-${index}`;
  const sizeClass = pickWeighted(seed, [
    { value: 'text-lg', weight: 60 },
    { value: 'text-xl', weight: 25 },
    { value: 'text-2xl', weight: 15 }
  ]);
  const weightClass = pickWeighted(`${seed}-weight`, [
    { value: 'font-normal', weight: 70 },
    { value: 'font-bold', weight: 30 }
  ]);
  const colors = PALETTES[palette];
  const color = colors[seededPercent(`${seed}-color`) % colors.length];
  const useUnderline = seededPercent(`${seed}-underline`) < 10;
  const useBackground = seededPercent(`${seed}-background`) < 20;
  const isHighContrast = palette === 'high-contrast';

  return {
    sizeClass,
    weightClass,
    underlineClass: useUnderline ? 'underline decoration-4 underline-offset-4' : '',
    backgroundColor: useBackground ? `${color}66` : undefined,
    textColor: isHighContrast ? color : undefined
  };
}
