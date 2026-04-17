import type { ImageAdjustments } from './types';

export interface ImageFilter {
  name: string;
  class: string;
  category: FilterCategory;
}

export type FilterCategory = 'all' | 'vintage' | 'modern' | 'mood' | 'bw';

export const filters: ImageFilter[] = [
  { name: 'Original', class: '', category: 'all' },
  { name: 'Vivid', class: 'saturate-[1.4] contrast-[1.1]', category: 'modern' },
  { name: 'Crisp', class: 'contrast-[1.15] brightness-[1.02] saturate-[1.1]', category: 'modern' },
  { name: 'Pop', class: 'saturate-[1.5] contrast-[1.2] brightness-[1.05]', category: 'modern' },
  { name: 'Punch', class: 'contrast-[1.25] saturate-[1.3]', category: 'modern' },
  { name: 'Boost', class: 'saturate-[1.2] brightness-[1.08]', category: 'modern' },
  { name: 'Warm', class: 'sepia-[0.3] saturate-[1.2]', category: 'vintage' },
  { name: 'Retro', class: 'sepia-[0.4] contrast-[1.1] brightness-[0.95]', category: 'vintage' },
  { name: 'Faded', class: 'brightness-[1.1] contrast-[0.85] saturate-[0.8]', category: 'vintage' },
  { name: 'Vintage', class: 'sepia-[0.25] contrast-[1.05] saturate-[0.9]', category: 'vintage' },
  { name: 'Film', class: 'sepia-[0.15] contrast-[1.1] saturate-[1.1] brightness-[0.98]', category: 'vintage' },
  { name: 'Analog', class: 'sepia-[0.2] saturate-[0.85] contrast-[1.05]', category: 'vintage' },
  { name: 'Cool', class: 'hue-rotate-[15deg] saturate-[0.9]', category: 'mood' },
  { name: 'Midnight', class: 'hue-rotate-[220deg] saturate-[0.7] brightness-[0.9]', category: 'mood' },
  { name: 'Golden', class: 'sepia-[0.35] saturate-[1.3] brightness-[1.05]', category: 'mood' },
  { name: 'Sunset', class: 'sepia-[0.25] saturate-[1.4] hue-rotate-[-10deg]', category: 'mood' },
  { name: 'Dreamy', class: 'brightness-[1.1] contrast-[0.9] saturate-[1.15] blur-[0.3px]', category: 'mood' },
  { name: 'Moody', class: 'contrast-[1.1] brightness-[0.92] saturate-[0.85]', category: 'mood' },
  { name: 'Mono', class: 'grayscale', category: 'bw' },
  { name: 'Noir', class: 'grayscale contrast-[1.3] brightness-[0.95]', category: 'bw' },
  { name: 'Silver', class: 'grayscale contrast-[1.1] brightness-[1.05]', category: 'bw' },
  { name: 'Stark', class: 'grayscale contrast-[1.5]', category: 'bw' },
  { name: 'Soft BW', class: 'grayscale contrast-[0.9] brightness-[1.1]', category: 'bw' },
];

export const categoryLabels: Record<FilterCategory, string> = {
  all: 'All',
  vintage: 'Vintage',
  modern: 'Modern',
  mood: 'Mood',
  bw: 'B&W',
};

export function filterClassToCssFilter(filterClass: string = ''): string {
  return filterClass
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      if (token === 'grayscale') return 'grayscale(1)';

      const bracketMatch = token.match(/^([a-z-]+)-\[(.+)\]$/);
      if (bracketMatch) {
        const [, name, value] = bracketMatch;
        return `${name}(${value})`;
      }

      return '';
    })
    .filter(Boolean)
    .join(' ');
}

export function mergeFilterValues(...filterValues: Array<string | undefined>): string {
  return filterValues
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(' ');
}

export function getAdjustmentFilterValue(adjustments?: ImageAdjustments | null): string {
  if (!adjustments) return '';

  const { brightness, contrast, saturation, warmth, fade } = adjustments;
  const filterParts: string[] = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`,
  ];

  if (warmth !== 0) {
    const hue = warmth > 0 ? warmth * 0.2 : warmth * 0.3;
    filterParts.push(`hue-rotate(${hue}deg)`);

    if (warmth > 0) {
      filterParts.push(`sepia(${warmth * 0.002})`);
    }
  }

  if (fade > 0) {
    const fadeAmount = 1 - fade * 0.003;
    filterParts.push(`contrast(${100 * fadeAmount}%)`);
  }

  return filterParts.join(' ');
}