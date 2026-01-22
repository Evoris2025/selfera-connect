import { Monitor, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { usePreviewZoom } from '@/hooks/usePreviewZoom';

/**
 * Settings control for adjusting desktop preview zoom.
 * Only rendered on desktop (fine pointer) devices.
 */
export function PreviewZoomControl() {
  const { zoom, setZoom, resetZoom, isDesktop } = usePreviewZoom();

  // Don't render on mobile/touch devices
  if (!isDesktop) return null;

  const percentage = Math.round(zoom * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">Preview Scaling (Desktop)</CardTitle>
            <CardDescription>
              Adjust UI scale to match your phone's display
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
            Reset
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          💡 Tip: Add <code className="bg-muted px-1 rounded">?debug=1</code> to the URL to see viewport info on both devices, then match the scale.
        </p>
      </CardContent>
    </Card>
  );
}
