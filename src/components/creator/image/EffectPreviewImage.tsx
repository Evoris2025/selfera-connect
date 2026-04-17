import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { ImageAdjustments } from './types';
import { filterClassToCssFilter, getAdjustmentFilterValue, mergeFilterValues } from './filterUtils';

interface EffectPreviewImageProps {
  src: string;
  alt: string;
  adjustments?: ImageAdjustments;
  presetFilterClass?: string;
  presetIntensity?: number;
  className?: string;
  imageStyle?: CSSProperties;
  baseStyle?: CSSProperties;
  overlayStyle?: CSSProperties;
  draggable?: boolean;
}

export function EffectPreviewImage({
  src,
  alt,
  adjustments,
  presetFilterClass = '',
  presetIntensity = 100,
  className,
  imageStyle,
  baseStyle,
  overlayStyle,
  draggable,
}: EffectPreviewImageProps) {
  const adjustmentFilter = getAdjustmentFilterValue(adjustments);
  const presetFilter = filterClassToCssFilter(presetFilterClass);
  const overlayOpacity = Math.max(0, Math.min(100, presetIntensity)) / 100;

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={cn(className)}
        style={{
          ...imageStyle,
          ...baseStyle,
          ...(adjustmentFilter ? { filter: adjustmentFilter } : {}),
        }}
        draggable={draggable}
      />

      {presetFilter && overlayOpacity > 0 && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className={cn(className, 'pointer-events-none')}
          style={{
            ...imageStyle,
            ...overlayStyle,
            filter: mergeFilterValues(presetFilter, adjustmentFilter),
            opacity: overlayOpacity,
            mixBlendMode: 'normal',
          }}
          draggable={draggable}
        />
      )}
    </>
  );
}