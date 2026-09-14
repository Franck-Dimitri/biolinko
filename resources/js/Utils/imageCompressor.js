/**
 * Biolinko Client-side Image Compression Utility
 * Resizes large smartphone/camera photos before upload to ensure ultra-fast
 * and crash-free uploads even on slower 3G/4G network connections.
 */
export async function compressImage(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {}) {
    if (!file || !(file instanceof File) || !file.type.startsWith('image/')) {
        return file;
    }

    // Skip GIFs (to preserve animation) or SVGs or files that are already small (< 300KB)
    if (file.type === 'image/gif' || file.type === 'image/svg+xml' || file.size <= 300 * 1024) {
        return file;
    }

    return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            // Compute scaling ratio
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return resolve(file);
            }

            // Draw with image smoothing enabled for crisp rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Determine output mime type (prefer original JPEG/WebP, fallback to JPEG for PNG if large)
            const outputType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';

            canvas.toBlob(
                (blob) => {
                    if (!blob || blob.size >= file.size) {
                        // If compression didn't reduce size, keep original
                        return resolve(file);
                    }

                    const newFileName = file.name.replace(/\.[^/.]+$/, '') + (outputType === 'image/webp' ? '.webp' : '.jpg');
                    const compressedFile = new File([blob], newFileName, {
                        type: outputType,
                        lastModified: Date.now(),
                    });

                    resolve(compressedFile);
                },
                outputType,
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            // Fallback gracefully to original file
            resolve(file);
        };

        img.src = objectUrl;
    });
}

/**
 * Batch compress an array of files concurrently
 */
export async function compressImages(files, options = {}) {
    if (!files || !Array.isArray(files)) return [];
    return Promise.all(files.map((file) => compressImage(file, options)));
}
