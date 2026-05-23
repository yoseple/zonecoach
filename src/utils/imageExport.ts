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

    // 2. Generate PNG blob
    // We use a higher pixel ratio for better quality
    const dataUrl = await htmlToImage.toPng(previewElement, {
      quality: 1.0,
      pixelRatio: 3,
      skipAutoScale: true,
      cacheBust: true,
      style: {
        borderRadius: '0',
        transform: 'none',
      }
    });

    // 3. Create anchor and trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to save recap photo:', error);
    throw error;
  }
};
