import type { ColorPalette, DopamineLevel } from '@/store/config-store';
import { pickWeighted, seededPercent } from './utils';

interface ChunkVisualStyle {
  sizeClass: string;
  weightClass: string;
  italicClass: string;
  underlineClass: string;
  backgroundColor: string | undefined;
  textColor: string | undefined;
}

// 调色板设计原则：
// - backgrounds 一律使用"浅色"，叠加 0x66 alpha 后仍保持柔和
// - texts 选同色系深色，确保在白底和半透明背景上都有足够对比度
// - 明确避免"深色背景 + 浅色文字"组合，长时间阅读对比度低易疲劳
const PALETTES: Record<
  ColorPalette,
  {
    backgrounds: readonly string[];
    texts: readonly string[];
  }
> = {
  // 马卡龙：精致甜点色（默认基准，背景浅而柔，文字深而沉）
  macaron: {
    backgrounds: ['#F8D2CC', '#FBE3BC', '#FFF3C2', '#D4ECCF', '#CFE2EE', '#E0D2E8'],
    texts: ['#9a4942', '#9a6324', '#7d6312', '#34664a', '#385f78', '#5e4280']
  },
  // 中世纪现代：把原深色挪到文字，背景改为同色系浅色版本，保持温暖知性
  'mid-century': {
    backgrounds: ['#CDE3E2', '#F8D9B5', '#F5C7B2', '#CCE2D4', '#DDEEE2', '#EBDDC0'],
    texts: ['#1f3d40', '#a35f1f', '#8a3414', '#23574a', '#4a7d63', '#7a6536']
  },
  // 莫兰迪：整体提亮，依然保持灰调静物质感（奶油 / 灰粉 / 雾蓝 / 鼠尾草 / 陶土）
  morandi: {
    backgrounds: ['#F0E9D8', '#E5CDC4', '#CDD3D7', '#C2CCBC', '#DCC2B3', '#E5DDD2'],
    texts: ['#6f5e48', '#704c44', '#475763', '#4a5d44', '#704c3a', '#5f5852']
  },
  // 墨色：改为"浅纸基底 + 深墨文字"，呼应水墨纸面，避免深色背景
  'ink-wash': {
    backgrounds: ['#F2EBDC', '#D9DEE8', '#EAD0CB', '#D4E2DA', '#E8D8C0', '#D8D6E2'],
    texts: ['#1a1f2c', '#1e2e48', '#7a1d12', '#15463a', '#7a4c1c', '#2c2945']
  }
};

interface LevelConfig {
  // 字号档位权重，使用任意值类避免 Tailwind 字号类附带的 line-height 影响 inline 排版
  sizeWeights: Array<{ value: string; weight: number }>;
  // 加粗概率（0-100）
  boldChance: number;
  // 斜体概率（0-100）
  italicChance: number;
  // 任意装饰下划线概率（0-100）
  underlineChance: number;
  // 下划线变体权重
  underlineVariants: Array<{ value: string; weight: number }>;
  // 背景色命中概率（0-100）
  backgroundChance: number;
  // 文字色命中概率（0-100）
  textColorChance: number;
}

// 下划线统一使用 decoration-2，避免视觉过粗压住文字
const UNDERLINE_BASE = 'underline decoration-2 underline-offset-4';
const UNDERLINE_WAVY = 'underline decoration-wavy decoration-2 underline-offset-4';
const UNDERLINE_DOUBLE = 'underline decoration-double decoration-2 underline-offset-4';

// 三档字号：基准 1rem / 中 1.1rem / 大 1.25rem，最大档比最小档约大 25%
// 使用任意值类（含 leading-[inherit]）避免 Tailwind text-xl 等附带 line-height 撑爆文稿行距
const SIZE_S = 'text-[1rem] leading-[inherit]';
const SIZE_M = 'text-[1.1rem] leading-[inherit]';
const SIZE_L = 'text-[1.25rem] leading-[inherit]';

const LEVEL_CONFIGS: Record<DopamineLevel, LevelConfig> = {
  // 温和：中号为主，大号点缀，小号最少
  gentle: {
    sizeWeights: [
      { value: SIZE_S, weight: 15 },
      { value: SIZE_M, weight: 55 },
      { value: SIZE_L, weight: 30 }
    ],
    boldChance: 22,
    italicChance: 0,
    underlineChance: 8,
    underlineVariants: [{ value: UNDERLINE_BASE, weight: 100 }],
    backgroundChance: 7,
    textColorChance: 18
  },
  // 多巴胺：中号主导，大号和小号各占三分之一
  dopamine: {
    sizeWeights: [
      { value: SIZE_S, weight: 18 },
      { value: SIZE_M, weight: 50 },
      { value: SIZE_L, weight: 32 }
    ],
    boldChance: 35,
    italicChance: 6,
    underlineChance: 18,
    underlineVariants: [
      { value: UNDERLINE_BASE, weight: 60 },
      { value: UNDERLINE_WAVY, weight: 30 },
      { value: UNDERLINE_DOUBLE, weight: 10 }
    ],
    backgroundChance: 16,
    textColorChance: 42
  },
  // 跳跃：中号仍最多，大号比例拉高制造视觉冲击，小号最少
  jumpy: {
    sizeWeights: [
      { value: SIZE_S, weight: 18 },
      { value: SIZE_M, weight: 42 },
      { value: SIZE_L, weight: 40 }
    ],
    boldChance: 50,
    italicChance: 14,
    underlineChance: 30,
    underlineVariants: [
      { value: UNDERLINE_BASE, weight: 45 },
      { value: UNDERLINE_WAVY, weight: 35 },
      { value: UNDERLINE_DOUBLE, weight: 20 }
    ],
    backgroundChance: 28,
    textColorChance: 70
  }
};

const PLAIN_STYLE: ChunkVisualStyle = {
  sizeClass: SIZE_M,
  weightClass: 'font-medium',
  italicClass: '',
  underlineClass: '',
  backgroundColor: undefined,
  textColor: undefined
};

export function getChunkVisualStyle(
  text: string,
  index: number,
  palette: ColorPalette,
  enabled: boolean,
  level: DopamineLevel = 'dopamine',
  enableSizeVariation: boolean = false,
  enableBackgroundHighlight: boolean = true
): ChunkVisualStyle {
  if (!enabled) {
    return PLAIN_STYLE;
  }

  const config = LEVEL_CONFIGS[level];
  const seed = `${text}-${index}`;

  // 字号变化默认关闭，所有句子统一为中号；打开后才按权重随机
  const sizeClass = enableSizeVariation ? pickWeighted(seed, config.sizeWeights) : SIZE_M;
  const weightClass =
    seededPercent(`${seed}-weight`) < config.boldChance ? 'font-bold' : 'font-normal';
  const italicClass =
    config.italicChance > 0 && seededPercent(`${seed}-italic`) < config.italicChance ? 'italic' : '';

  const colors = PALETTES[palette];
  const backgroundColor =
    colors.backgrounds[seededPercent(`${seed}-background-color`) % colors.backgrounds.length];
  const textColor = colors.texts[seededPercent(`${seed}-text-color`) % colors.texts.length];

  const useUnderline = seededPercent(`${seed}-underline`) < config.underlineChance;
  const useBackground =
    enableBackgroundHighlight && seededPercent(`${seed}-background`) < config.backgroundChance;
  const useTextColor = seededPercent(`${seed}-text-enabled`) < config.textColorChance;

  const underlineClass = useUnderline ? pickWeighted(`${seed}-underline-style`, config.underlineVariants) : '';

  return {
    sizeClass,
    weightClass,
    italicClass,
    underlineClass,
    backgroundColor: useBackground ? `${backgroundColor}66` : undefined,
    textColor: useTextColor ? textColor : undefined
  };
}
