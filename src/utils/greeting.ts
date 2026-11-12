/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WishItem {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  emoji?: string;
}

export const PETAL_COLORS = [
  '#ffffff',
  '#ffccd5',
  '#ffe5ec',
  '#ffb3c6',
  '#f8bbd0',
  '#f48fb1',
];

/**
 * Normalizes recipient name, defaulting to 'Dina' if absent or blank.
 */
export function formatRecipientName(rawName?: string | null): string {
  if (!rawName) return 'Dina Perwitasari';
  const trimmed = rawName.trim();
  if (trimmed.length === 0) return 'Dina Perwitasari';
  // Capitalize first letter of each word
  return trimmed
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Validates a guestbook wish before storing.
 */
export function validateWish(author: string, message: string): { valid: boolean; error?: string } {
  const cleanAuthor = author.trim();
  const cleanMessage = message.trim();

  if (!cleanAuthor) {
    return { valid: false, error: 'Silakan isi nama pengirim' };
  }
  if (cleanAuthor.length > 30) {
    return { valid: false, error: 'Nama pengirim maksimal 30 karakter' };
  }
  if (!cleanMessage) {
    return { valid: false, error: 'Silakan tulis pesan doa / ucapan' };
  }
  if (cleanMessage.length > 300) {
    return { valid: false, error: 'Pesan maksimal 300 karakter' };
  }

  return { valid: true };
}

/**
 * Computes deterministic particle styling for falling sakura petals.
 */
export function calculatePetalStyle(seed: number) {
  // Deterministic pseudo-random based on seed
  const pseudoRand = (offset: number) => {
    const x = Math.sin(seed * 997 + offset * 1337) * 10000;
    return x - Math.floor(x);
  };

  const size = Math.floor(pseudoRand(1) * 10) + 12; // 12px to 22px
  const width = size;
  const height = Math.round(size * 1.4);
  const left = Math.round(pseudoRand(2) * 98); // 0% to 98%
  const duration = Number((pseudoRand(3) * 5 + 6).toFixed(2)); // 6s to 11s
  const delay = Number((pseudoRand(4) * 8).toFixed(2)); // 0s to 8s
  const colorIndex = Math.floor(pseudoRand(5) * PETAL_COLORS.length);
  const color = PETAL_COLORS[colorIndex];

  return {
    width,
    height,
    left,
    duration,
    delay,
    color,
  };
}

/**
 * Generates personalized message for recipient.
 */
export function getSpecialMessage(name: string): string {
  const cleanName = formatRecipientName(name);
  return `Semoga hari-harimu seindah taman bunga dan secerah senyumanmu hari ini, ${cleanName}! Have a wonderful, unforgettable birthday! 💖✨`;
}
