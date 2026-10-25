const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 0.75;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function compressImage(file: File): Promise<File> {
  const img = await loadImage(file);

  let { width, height } = img;

  // Guard dimensi ekstrem gede, bukan resize agresif
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Gagal membuat canvas context');

  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(img.src);

  // Selalu di-encode ulang ke WebP dengan quality tetap, gak peduli ukuran file asli
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));

  if (!blob) throw new Error('Gagal mengompres gambar');

  const webpFileName = file.name.replace(/\.[^/.]+$/, '.webp');

  console.log(`Compress: ${(file.size / 1024).toFixed(0)}KB -> ${(blob.size / 1024).toFixed(0)}KB`);

  return new File([blob], webpFileName, { type: 'image/webp' });
}
