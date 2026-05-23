import * as htmlToImage from 'html-to-image';

/**
 * Wait for all images inside an element to be fully loaded.
 */
async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  
  const promises = images.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('Image load timed out:', img.src);
        resolve();
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve();
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

/**
 * Generates a PNG recap photo and triggers a device download.
 */
export const saveRecapToDevice = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  if (!element) throw new Error("Preview element not found");

  const width = element.offsetWidth;
  const height = element.offsetHeight;

  if (!width || !height) {
    throw new Error("Preview is not ready yet. Please ensure the photo is displayed.");
  }

  // 1. Wait for images and layout to settle
  await waitForImagesToLoad(element);
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(r => setTimeout(r, 300)); // Extra buffer for SVG/Fonts

  // 2. Apply temporary export-safe styling
  element.classList.add("recap-export-safe");
  
  try {
    const exportOptions = {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      width,
      height,
      style: {
        transform: "none",
        borderRadius: "0",
        boxShadow: "none",
      },
      filter: (node: Node) => {
        if (!(node instanceof HTMLElement)) return true;
        return node.dataset?.noExport !== 'true';
      },
    };

    // 3. Capture as Blob (Primary)
    let blob = await htmlToImage.toBlob(element, exportOptions);

    // 4. Capture as PNG DataURL (Fallback)
    if (!blob) {
      console.warn("toBlob failed, trying toPng fallback...");
      const dataUrl = await htmlToImage.toPng(element, exportOptions);
      const response = await fetch(dataUrl);
      blob = await response.blob();
    }

    if (!blob || blob.size === 0) {
      throw new Error("Generated image was empty. Try a smaller photo or removing filters.");
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
    }, 1000);

  } catch (error) {
    console.error('Recap Export Debug Info:', {
      elementExists: !!element,
      width,
      height,
      imageCount: element.querySelectorAll('img').length,
      userAgent: navigator.userAgent,
      error
    });
    
    throw new Error('Couldn’t save recap image. Try changing the filter to None or using a smaller photo.');
  } finally {
    element.classList.remove("recap-export-safe");
  }
};
