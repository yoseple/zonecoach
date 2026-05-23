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

    // 3. Create object URL and trigger download
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
