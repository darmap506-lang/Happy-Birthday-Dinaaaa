/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SavedBirthdayWish {
  text: string;
  savedAt: number;
}

export interface WishValidationResult {
  valid: boolean;
  trimmed: string;
  error?: string;
}

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export const BIRTHDAY_WISH_STORAGE_KEY = 'dina_birthday_wish_v1';
export const MAX_BIRTHDAY_WISH_LENGTH = 160;

/**
 * Validates and trims a birthday wish before saving.
 */
export function validateBirthdayWish(rawText: string): WishValidationResult {
  const trimmed = rawText.trim();

  if (!trimmed) {
    return {
      valid: false,
      trimmed,
      error: 'Tulis dulu harapan ulang tahunmu ya ✨',
    };
  }

  if (trimmed.length > MAX_BIRTHDAY_WISH_LENGTH) {
    return {
      valid: false,
      trimmed,
      error: `Harapan maksimal ${MAX_BIRTHDAY_WISH_LENGTH} karakter`,
    };
  }

  return {
    valid: true,
    trimmed,
  };
}

const ephemeralWishStore = new Map<string, string>();

const memoryStorage: StorageLike = {
  getItem: (key) => ephemeralWishStore.get(key) ?? null,
  setItem: (key, value) => {
    ephemeralWishStore.set(key, value);
  },
  removeItem: (key) => {
    ephemeralWishStore.delete(key);
  },
};

function clearLegacyLocalStorage(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(BIRTHDAY_WISH_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

function getSafeStorage(storage?: StorageLike | null): StorageLike {
  if (storage) return storage;
  return memoryStorage;
}

/**
 * Loads the birthday wish from ephemeral session memory (resets when app closes).
 */
export function loadSavedWish(storage?: StorageLike | null): SavedBirthdayWish | null {
  const target = getSafeStorage(storage);

  try {
    const raw = target.getItem(BIRTHDAY_WISH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedBirthdayWish>;
    if (typeof parsed.text !== 'string' || !parsed.text.trim()) {
      return null;
    }
    return {
      text: parsed.text.trim(),
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Saves a validated birthday wish into ephemeral memory for the active open session.
 */
export function saveBirthdayWish(
  rawText: string,
  storage?: StorageLike | null,
  now = Date.now()
): SavedBirthdayWish | null {
  const validation = validateBirthdayWish(rawText);
  if (!validation.valid) return null;

  const entry: SavedBirthdayWish = {
    text: validation.trimmed,
    savedAt: now,
  };

  const target = getSafeStorage(storage);
  try {
    target.setItem(BIRTHDAY_WISH_STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore storage failures gracefully
  }

  return entry;
}

/**
 * Clears the stored birthday wish (both active memory and any legacy localStorage entry).
 */
export function clearSavedWish(storage?: StorageLike | null): void {
  if (!storage) {
    clearLegacyLocalStorage();
  }
  const target = getSafeStorage(storage);
  try {
    target.removeItem(BIRTHDAY_WISH_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
