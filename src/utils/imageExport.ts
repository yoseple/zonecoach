import * as htmlToImage from 'html-to-image';

export const saveRecapToDevice = async (
  previewElement: HTMLElement,
  filename: string
): Promise<void> => {
  try {
    // 1. Wait for all images to be LOADED and DECODED
    const images = Array.from(previewElement.querySelectorAll('img'));
    await Promise.all(
      images.map(async (img) => {
        if (img.complete) {
          try { await img.decode(); } catch (e) { /* ignore */ }
          return;
        }
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue anyway
        });
      })
    );

    // 2. Initial delay to allow SVG and layout to settle
    await new Promise(r => setTimeout(r, 500));

    // 3. Capture using toJpeg (Often more stable than toCanvas/toBlob in this library)
    let dataUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts && !dataUrl) {
      try {
        attempts++;
        dataUrl = await htmlToImage.toJpeg(previewElement, {
          quality: 0.85,
          pixelRatio: 2,
          cacheBust: true,
          // Extreme safety: Remove all complex styles during capture
          style: {
            borderRadius: '0',
            transform: 'none',
            boxShadow: 'none',
            margin: '0',
            padding: '0',
          }
        });
      } catch (err) {
        console.warn(`Export attempt ${attempts} failed:`, err);
        if (attempts === maxAttempts) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!dataUrl) throw new Error('Failed to generate image data URL');

    // 4. Convert DataURL to Blob (Manually, for maximum reliability)
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    if (!blob || blob.size < 1000) throw new Error('Generated image is invalid or empty');

    // 5. Trigger Save/Share
    const file = new File([blob], filename, { type: 'image/jpeg' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Run Recap',
          text: 'Captured on ZoneCoach',
        });
        return;
      } catch (shareError) {
        if ((shareError as Error).name === 'AbortError') return;
      }
    }

    // 6. Fallback download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Final export failure:', error);
    throw new Error('Image creation failed. Please try a different photo or check your browser permissions.');
  }
};
