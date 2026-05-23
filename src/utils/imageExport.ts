import * as htmlToImage from 'html-to-image';

/**
 * Wait for all images inside an element to be fully loaded and decoded.
 */
async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  
  const promises = images.map((img) => {
    if (img.complete && img.naturalWidth > 0) {
      return img.decode().catch(() => {});
    }
    
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('Image load timed out:', img.src);
        resolve();
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        img.decode().then(resolve).catch(resolve);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.warn('Image failed to load:', img.src);
        resolve();
      };
    });
  });

  await Promise.all(promises);
}

interface ExportDimensions {
  width: number;
  height: number;
}

/**
 * Generates a high-quality PNG recap photo and triggers a device download.
 * Uses fixed dimensions to prevent cropping bugs on mobile.
 */
export const saveRecapToDevice = async (
  element: HTMLElement,
  filename: string,
  targetDimensions: ExportDimensions
): Promise<void> => {
  if (!element) throw new Error("Preview element not found");

  // 1. Wait for images and layout to settle
  await waitForImagesToLoad(element);
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(r => setTimeout(r, 400));

  // 2. Capture using fixed dimensions
  // html-to-image will apply these styles to a CLONE of the element
  try {
    const exportOptions = {
      cacheBust: true,
      pixelRatio: 1, // Use 1 since we provide large fixed dimensions (1080px+)
      backgroundColor: "#000000",
      width: targetDimensions.width,
      height: targetDimensions.height,
      style: {
        transform: "none",
        borderRadius: "0",
        boxShadow: "none",
        margin: "0",
        padding: "0",
        left: "0",
        top: "0",
        width: `${targetDimensions.width}px`,
        height: `${targetDimensions.height}px`,
        position: "relative",
      },
      filter: (node: Node) => {
        if (!(node instanceof HTMLElement)) return true;
        // Skip elements marked with data-no-export
        return node.dataset?.noExport !== 'true';
      },
    };

    // 3. Generate PNG
    const dataUrl = await htmlToImage.toPng(element, exportOptions);
    
    if (!dataUrl || dataUrl.length < 1000) {
      throw new Error("Generated image was invalid. Try a smaller photo.");
    }

    // 4. Convert to Blob for cleaner download
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error("Generated image file was empty.");
    }

    // 5. Trigger download via anchor tag
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);

  } catch (error) {
    console.error('Recap Export Debug Info:', {
      elementExists: !!element,
      targetDimensions,
      imageCount: element.querySelectorAll('img').length,
      userAgent: navigator.userAgent,
      error
    });
    
    throw new Error('Couldn’t save recap image. Try changing the filter to None or using a smaller photo.');
  }
};
