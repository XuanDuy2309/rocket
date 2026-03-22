export function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${m}-${y}`;
}
export function fileNameFromUri(uri: string, idx: number) {
  const clean = uri.split('?')[0];
  const last = clean.split('/').pop();
  return last && last.includes('.') ? last : `wc_${idx + 1}.jpg`;
}
export function guessMime(uri: string) {
  const u = uri.toLowerCase();
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.heic')) return 'image/heic';
  if (u.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export function extractQrCode(scannedText: string): string {
  if (!scannedText) return '';
  const trimmed = scannedText.trim();
  if (trimmed.startsWith('http')) {
    try {
      // 1. Try to extract from query parameter 'code' (standard)
      const parts = trimmed.split('?');
      if (parts.length > 1) {
        const query = parts[1];
        const params = query.split('&');
        for (const p of params) {
          const [key, value] = p.split('=');
          if (key.toLowerCase() === 'code' && value) {
            return decodeURIComponent(value);
          }
        }
      }

      // 2. Handle specific INAX path format: https://qr.inax.com.vn/qr/CODE
      // Or any URL ending with /qr/CODE
      if (trimmed.includes('/qr/')) {
        const pathParts = trimmed.split('/qr/');
        const code = pathParts[pathParts.length - 1];
        if (code && !code.includes('/')) {
          return code.split('?')[0]; // Remove any potential trailing query params
        }
      }
    } catch (e) {
      console.log('QR parse error', e);
    }
  }
  return trimmed;
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
