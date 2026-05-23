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

  // 1. Force a "clean" layout for measurement
  // We take the scroll dimensions to ensure we get the UN-CROPPED area
  const width = element.scrollWidth;
  const height = element.scrollHeight;

  if (!width || !height) {
    throw new Error("Preview is not ready yet. Please ensure the photo is displayed.");
  }

  // 2. Wait for images and layout to settle
  await waitForImagesToLoad(element);
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(r => setTimeout(r, 500));

  // 3. Apply temporary export-safe styling
  element.classList.add("recap-export-safe");
  
  try {
    const exportOptions = {
      cacheBust: true,
      pixelRatio: 3, // Higher quality
      backgroundColor: "#ffffff",
      width, // Force explicit dimensions
      height,
      canvasWidth: width,
      canvasHeight: height,
      style: {
        transform: "none",
        borderRadius: "0",
        boxShadow: "none",
        margin: "0",
        padding: "0",
        left: "0",
        top: "0",
        position: "relative", // Ensure it's not fixed/absolute during capture
      },
      filter: (node: Node) => {
        if (!(node instanceof HTMLElement)) return true;
        return node.dataset?.noExport !== 'true';
      },
    };

    // 4. Capture as PNG DataURL (More reliable than Blob for forced dimensions)
    const dataUrl = await htmlToImage.toPng(element, exportOptions);
    
    if (!dataUrl || dataUrl.length < 1000) {
      throw new Error("Generated image was invalid. Try a smaller photo.");
    }

    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // 5. Trigger download
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
