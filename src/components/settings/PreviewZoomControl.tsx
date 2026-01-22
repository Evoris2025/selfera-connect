import { Monitor, RotateCcw, Smartphone, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePreviewZoom } from '@/hooks/usePreviewZoom';

/**
 * Settings control for adjusting desktop preview zoom.
 * Only rendered on desktop (fine pointer) devices.
 */
export function PreviewZoomControl() {
  const { 
    zoom, 
    setZoom, 
    resetZoom, 
    recalculateFromPhone,
    isDesktop, 
    isAutoDetected, 
    phoneMetrics 
  } = usePreviewZoom();

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
            <CardTitle className="text-base flex items-center gap-2">
              Preview Scaling (Desktop)
              {isAutoDetected && (
                <Badge variant="secondary" className="text-xs font-normal gap-1">
                  <Smartphone className="h-3 w-3" />
                  Auto-detected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {phoneMetrics 
                ? `Matched to your phone (${phoneMetrics.viewport_width}px @ ${phoneMetrics.device_pixel_ratio}x DPR)`
                : 'Open the app on your phone to auto-calibrate'
              }
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
          <div className="flex gap-2">
            {phoneMetrics && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={recalculateFromPhone}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Re-sync
              </Button>
            )}
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
        </div>
        
        {!phoneMetrics && (
          <p className="text-xs text-muted-foreground">
            📱 Open the app on your Android phone once to automatically sync viewport metrics.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
