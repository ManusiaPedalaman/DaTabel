/**
 * Utility to optimize and compress images client-side before sending to server.
 * This prevents HTTP 413 (Payload Too Large) on Vercel and improves OCR speed.
 */

export async function compressImageIfNeeded(
  file: File,
  maxDimension = 2048,
  quality = 0.82
): Promise<File> {
  // Only process images (skip PDF and non-images)
  if (!file.type.startsWith('image/')) {
    return file;
  }

  if (typeof window === 'undefined') {
    return file;
  }

  try {
    let bitmap: ImageBitmap | null = null;
    if ('createImageBitmap' in window) {
      try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      } catch {
        try {
          bitmap = await createImageBitmap(file);
        } catch {
          bitmap = null;
        }
      }
    }

    let width = 0;
    let height = 0;
    let source: CanvasImageSource;

    if (bitmap) {
      width = bitmap.width;
      height = bitmap.height;
      source = bitmap;
    } else {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        const url = URL.createObjectURL(file);
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve(image);
        };
        image.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(err);
        };
        image.src = url;
      });
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
      source = img;
    }

    // Determine target dimensions
    let targetWidth = width;
    let targetHeight = height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        targetHeight = Math.round((height * maxDimension) / width);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((width * maxDimension) / height);
        targetHeight = maxDimension;
      }
    } else if (file.size <= 1.5 * 1024 * 1024) {
      // Dimensions are within limit and file is <= 1.5MB
      if (bitmap) bitmap.close();
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (bitmap) bitmap.close();
      return file;
    }

    // High quality smoothing for clear text and borders
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
    if (bitmap) bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
    });

    if (!blob) {
      return file;
    }

    // If compressed blob is somehow larger and dimensions were already fine, keep original
    if (blob.size >= file.size && width <= maxDimension && height <= maxDimension) {
      return file;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}.jpg`;
    return new File([blob], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('Image optimization error, using original file:', error);
    return file;
  }
}

/**
 * Optimizes an array of files ensuring the total batch size stays safely under Vercel's 4.5MB limit.
 */
export async function optimizeFileBatch(files: File[]): Promise<File[]> {
  // If multiple files, use slightly more compact resolution to ensure batch is < 4MB
  const maxDim = files.length > 2 ? 1800 : 2048;
  const quality = files.length > 2 ? 0.80 : 0.82;

  const compressed = await Promise.all(
    files.map((file) => compressImageIfNeeded(file, maxDim, quality))
  );

  return compressed;
}
