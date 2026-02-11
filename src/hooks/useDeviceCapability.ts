import { useMemo } from 'react';

interface DeviceCapability {
  canRender3D: boolean;
  performanceTier: 'low' | 'medium' | 'high';
  recommendedDPR: number;
  shouldReduceMotion: boolean;
}

/**
 * Detects device capability to determine if 3D rendering is viable.
 * Falls back gracefully on low-end devices.
 */
export function useDeviceCapability(): DeviceCapability {
  return useMemo(() => {
    // Check reduced motion preference
    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    // Check hardware capabilities
    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory || 4;

    // Check if WebGL is supported
    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = !!(
        canvas.getContext('webgl2') || canvas.getContext('webgl')
      );
    } catch {
      hasWebGL = false;
    }

    // Determine performance tier
    let performanceTier: 'low' | 'medium' | 'high' = 'medium';
    if (cores >= 8 && memory >= 8 && hasWebGL) {
      performanceTier = 'high';
    } else if (cores < 4 || memory < 4 || !hasWebGL) {
      performanceTier = 'low';
    }

    // 3D only on medium+ tier with WebGL and no reduced motion
    const canRender3D =
      hasWebGL && performanceTier !== 'low' && !shouldReduceMotion;

    // DPR based on tier
    const recommendedDPR =
      performanceTier === 'high' ? 1.5 : performanceTier === 'medium' ? 1 : 0.75;

    return {
      canRender3D,
      performanceTier,
      recommendedDPR,
      shouldReduceMotion,
    };
  }, []);
}
