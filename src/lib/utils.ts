import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function hashString(input: string): number {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function seededPercent(seed: string): number {
  return hashString(seed) % 100;
}

export function pickWeighted<T extends string>(
  seed: string,
  options: ReadonlyArray<{ value: T; weight: number }>
): T {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  const roll = hashString(seed) % totalWeight;
  let cursor = 0;

  for (const option of options) {
    cursor += option.weight;
    if (roll < cursor) {
      return option.value;
    }
  }

  return options[options.length - 1].value;
}
