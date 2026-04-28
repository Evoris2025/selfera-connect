import { Check } from 'lucide-react';
import { useTheme, type ColorTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeOption {
  id: ColorTheme;
  name: string;
  colors: {
    primary: string;
    accent: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    id: 'coral',
    name: 'Coral',
    colors: {
      primary: 'hsl(12, 76%, 61%)',
      accent: 'hsl(270, 50%, 60%)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: 'hsl(200, 80%, 55%)',
      accent: 'hsl(180, 60%, 50%)',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: {
      primary: 'hsl(340, 65%, 60%)',
      accent: 'hsl(320, 60%, 55%)',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: 'hsl(155, 55%, 50%)',
      accent: 'hsl(140, 50%, 45%)',
    },
  },
  {
    id: 'violet',
    name: 'Violet',
    colors: {
      primary: 'hsl(270, 60%, 60%)',
      accent: 'hsl(290, 55%, 55%)',
    },
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap gap-3">
      {themeOptions.map((option) => {
        const isSelected = theme === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => setTheme(option.id)}
            className={cn(
              'group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300',
              'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected && 'bg-muted/60'
            )}
          >
            {/* Color swatch with gradient */}
            <div
              className={cn(
                'relative w-12 h-12 rounded-full transition-all duration-300',
                'ring-2 ring-offset-2 ring-offset-background',
                isSelected ? 'ring-foreground scale-110' : 'ring-transparent group-hover:ring-muted-foreground/30'
              )}
              style={{
                background: `linear-gradient(135deg, ${option.colors.primary} 0%, ${option.colors.accent} 100%)`,
              }}
            >
              {/* Checkmark overlay */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 rounded-full">
                  <Check className="w-5 h-5 text-white drop-shadow-lg" strokeWidth={3} />
                </div>
              )}
            </div>
            
            {/* Theme name */}
            <span
              className={cn(
                'text-label font-medium transition-colors',
                isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )}
            >
              {option.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
