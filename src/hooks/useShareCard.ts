import { useRef, useCallback, useState } from 'react';
import { analytics } from '@/services/AnalyticsService';

export function useShareCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setIsGenerating(true);

    try {
      // Dynamic import to avoid bloating main bundle
      const { default: html2canvas } = await import('html2canvas');

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Retina quality
        useCORS: true,
        logging: false,
        width: 600,
        height: 1067,
      });

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Failed to generate share card:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const shareCard = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;

    analytics.track('share_card_generated');

    const file = new File([blob], 'spark-mastery-progress.png', { type: 'image/png' });

    // Try Web Share API first (great mobile support)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: 'My Spark Mastery Progress',
          text: 'Check out my fitness progress on Spark Mastery!',
          files: [file],
        });
        analytics.track('share_card_shared', { method: 'native' });
        return;
      } catch (err) {
        // User cancelled or API failed -- fall through to clipboard
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: copy image to clipboard (desktop)
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      analytics.track('share_card_shared', { method: 'clipboard' });
    } catch {
      // Last resort: download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spark-mastery-progress.png';
      a.click();
      URL.revokeObjectURL(url);
      analytics.track('share_card_shared', { method: 'download' });
    }
  }, [generateImage]);

  return { cardRef, shareCard, isGenerating };
}
