import { useState, useEffect } from 'react';

/**
 * Debug overlay that shows viewport information.
 * Enable by adding ?debug=1 to the URL.
 */
export function ViewportDebugOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [info, setInfo] = useState({
    innerWidth: 0,
    innerHeight: 0,
    clientWidth: 0,
    devicePixelRatio: 1,
    visualViewportWidth: 0,
    visualViewportScale: 1,
    previewZoom: 1,
    pointerType: 'unknown',
  });

  useEffect(() => {
    // Check URL param
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') !== '1') return;
    
    setIsVisible(true);

    const updateInfo = () => {
      const previewZoom = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--preview-zoom') || '1'
      );
      
      const isFinPointer = window.matchMedia('(pointer: fine)').matches;
      
      setInfo({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        clientWidth: document.documentElement.clientWidth,
        devicePixelRatio: window.devicePixelRatio,
        visualViewportWidth: window.visualViewport?.width || 0,
        visualViewportScale: window.visualViewport?.scale || 1,
        previewZoom,
        pointerType: isFinPointer ? 'fine (desktop)' : 'coarse (touch)',
      });
    };

    updateInfo();
    
    window.addEventListener('resize', updateInfo);
    window.visualViewport?.addEventListener('resize', updateInfo);
    
    // Poll for zoom changes
    const interval = setInterval(updateInfo, 500);

    return () => {
      window.removeEventListener('resize', updateInfo);
      window.visualViewport?.removeEventListener('resize', updateInfo);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-16 left-2 z-[9999] p-3 rounded-lg text-xs font-mono bg-black/90 text-green-400 border border-green-500/50 shadow-lg max-w-[200px]"
      style={{ zoom: 1 }} // Prevent this overlay from being affected by preview zoom
    >
      <div className="font-bold mb-2 text-green-300">📱 Viewport Debug</div>
      <div className="space-y-1">
        <div>innerWidth: <span className="text-white">{info.innerWidth}px</span></div>
        <div>innerHeight: <span className="text-white">{info.innerHeight}px</span></div>
        <div>clientWidth: <span className="text-white">{info.clientWidth}px</span></div>
        <div>DPR: <span className="text-white">{info.devicePixelRatio.toFixed(2)}</span></div>
        <div>visualVP.width: <span className="text-white">{info.visualViewportWidth.toFixed(0)}px</span></div>
        <div>visualVP.scale: <span className="text-white">{info.visualViewportScale.toFixed(2)}</span></div>
        <div className="border-t border-green-500/30 pt-1 mt-1">
          <div>previewZoom: <span className="text-yellow-400">{info.previewZoom.toFixed(2)}</span></div>
          <div>pointer: <span className="text-white">{info.pointerType}</span></div>
        </div>
      </div>
    </div>
  );
}
