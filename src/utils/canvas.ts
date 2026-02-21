/**
 * Converts an SVG string to a PNG Blob
 */
export const svgToPngBlob = (svgString: string, width: number, height: number): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
        // 1. Create a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions (multiply by 2 for high-res/retina if desired)
        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
            reject('Canvas context not found');
            return;
        }

        // 2. Create an Image from the SVG
        const img = new Image();
        // Encode SVG for data URI (handle utf8 characters safely)
        const svg64 = btoa(unescape(encodeURIComponent(svgString)));
        const image64 = `data:image/svg+xml;base64,${svg64}`;

        img.onload = () => {
            // 3. Draw SVG to Canvas
            ctx.drawImage(img, 0, 0, width, height);

            // 4. Export as PNG Blob
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        };

        img.onerror = (err) => reject(err);
        img.src = image64;
    });
};