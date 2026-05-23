import * as htmlToImage from 'html-to-image';

export const saveRecapToDevice = async (
  previewElement: HTMLElement,
  filename: string
): Promise<void> => {
  try {
    // 1. Ensure all images inside are loaded
    const images = Array.from(previewElement.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    );

    // 2. Generate JPEG Blob
    // We use toBlob for better mobile compatibility and memory management
    const blob = await htmlToImage.toBlob(previewElement, {
      quality: 0.95,
      pixelRatio: 3,
      skipAutoScale: true,
      cacheBust: true,
      style: {
        borderRadius: '0',
        transform: 'none',
      }
    });

    if (!blob) throw new Error('Failed to generate image blob');

    // 3. Trigger Save/Share
    // On iOS/Mobile Safari, navigator.share with a File object is the ONLY reliable 
    // way to get an image into the 'Photos' app (Camera Roll).
    const file = new File([blob], filename, { type: 'image/jpeg' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Run Recap',
          text: 'Captured on ZoneCoach',
        });
        return; // Success via Share Sheet (which includes 'Save Image')
      } catch (shareError) {
        // If user cancelled, don't fallback to download link (it might just fail again)
        if ((shareError as Error).name === 'AbortError') return;
        console.warn('Share sheet failed, falling back to download link', shareError);
      }
    }

    // 4. Fallback: Create anchor and trigger download (Desktop/Android)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Failed to save recap photo:', error);
    throw error;
  }
};
