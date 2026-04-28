import { useState } from 'react';
import { Bell, Heart, MessageCircle } from 'lucide-react';
import {
  BrandScreenTitle,
  BrandSectionLabel,
  BrandIcon,
  BrandSurface,
  BrandUnderlineTabs,
} from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme, type ColorTheme } from '@/contexts/ThemeContext';

const TAB_LIST = [
  { id: 'posts', label: 'Posts' },
  { id: 'reels', label: 'Reels' },
  { id: 'tagged', label: 'Tagged' },
];

const THEMES: ColorTheme[] = ['coral', 'ocean', 'rose', 'forest', 'violet'];

/**
 * /debug/brand — internal smoke test for the shared brand layer.
 * Not linked from anywhere. Render-only. Do not consume in production code.
 */
export default function DebugBrand() {
  const [tab, setTab] = useState('posts');
  const { theme, setTheme } = useTheme();
  const color = useThemeColor();

  return (
    <div className="min-h-dvh bg-background text-white px-5 py-8 max-w-md mx-auto">
      <BrandScreenTitle
        setup="your"
        emphasis="INBOX"
        subtitle="your story, in motion."
        size="screen"
      />

      <div className="mt-8">
        <BrandSectionLabel>Surfaces</BrandSectionLabel>
        <BrandSurface className="mt-3 p-4">
          <p className="text-body text-white/85">
            Outline-only surface. bg-black + border-white/[0.08] + rounded-2xl.
          </p>
        </BrandSurface>
      </div>

      <div className="mt-8">
        <BrandSectionLabel>Brand icons</BrandSectionLabel>
        <div className="mt-3 flex items-center gap-5">
          <BrandIcon icon={Bell} />
          <BrandIcon icon={Heart} />
          <BrandIcon icon={MessageCircle} />
          <BrandIcon icon={Heart} size={32} strokeWidth={1.5} />
        </div>
      </div>

      <div className="mt-8">
        <BrandSectionLabel>Underline tabs</BrandSectionLabel>
        <div className="mt-3">
          <BrandUnderlineTabs tabs={TAB_LIST} value={tab} onChange={setTab} />
          <p className="mt-3 text-body text-white/55">Active: {tab}</p>
        </div>
      </div>

      <div className="mt-8">
        <BrandSectionLabel>useThemeColor()</BrandSectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 text-label uppercase tracking-[0.1em] rounded-full border ${
                theme === t
                  ? 'border-white/40 text-white'
                  : 'border-white/10 text-white/55'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <BrandSurface className="mt-3 p-4">
          <pre
            data-testid="theme-color-readout"
            className="text-caption leading-relaxed text-white/70 whitespace-pre-wrap break-all"
          >
{JSON.stringify({ activeTheme: theme, ...color }, null, 2)}
          </pre>
          <div className="mt-3 flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block w-6 h-6 rounded-full"
              style={{ background: color.primary }}
            />
            <span
              aria-hidden
              className="inline-block w-24 h-3 rounded-full"
              style={{
                backgroundImage: `linear-gradient(90deg, hsl(${color.gradientStops.start}), hsl(${color.gradientStops.mid}), hsl(${color.gradientStops.end}))`,
              }}
            />
          </div>
        </BrandSurface>
      </div>

      <div className="mt-8">
        <BrandSectionLabel>Hero variant</BrandSectionLabel>
        <div className="mt-3">
          <BrandScreenTitle
            setup="what will you"
            emphasis="CREATE"
            subtitle="choose how you show up today"
            size="hero"
          />
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
}
