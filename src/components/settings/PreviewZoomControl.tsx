import { Monitor, RotateCcw, Smartphone, Tablet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePreviewZoom } from '@/hooks/usePreviewZoom';

const MODE_LABELS = {
  mobile: { label: 'Mobile', icon: Smartphone, description: 'Preview ~430px' },
  tablet: { label: 'Tablet', icon: Tablet, description: 'Preview ~768px' },
  desktop: { label: 'Desktop', icon: Monitor, description: 'Preview 1024px+' },
};

/**
 * Settings control for adjusting desktop preview zoom.
 * Settings are saved permanently per preview mode.
 */
export function PreviewZoomControl() {
  const { 
    zoom, 
    setZoom, 
    resetZoom, 
    isDesktop,
    currentMode,
  } = usePreviewZoom();

  // Don't render on mobile/touch devices
  if (!isDesktop) return null;

  const percentage = Math.round(zoom * 100);
  const modeConfig = MODE_LABELS[currentMode];
  const ModeIcon = modeConfig.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              Preview Scaling
              <Badge variant="secondary" className="text-xs font-normal gap-1">
                <ModeIcon className="h-3 w-3" />
                {modeConfig.label}
              </Badge>
            </CardTitle>
            <CardDescription>
              Adjust zoom for {modeConfig.label.toLowerCase()} preview ({modeConfig.description})
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-12">50%</span>
          <Slider
            value={[zoom]}
            onValueChange={([value]) => setZoom(value)}
            min={0.5}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">100%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Current: <span className="text-primary">{percentage}%</span>
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetZoom}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Settings are saved permanently for each preview mode.
        </p>
      </CardContent>
    </Card>
  );
}
