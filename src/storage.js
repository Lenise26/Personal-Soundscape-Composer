const STORAGE_KEY = 'personal-soundscape-composer:v1';

export function loadCompositions(storage, fallback) {
  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(fallback);
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

export function saveCompositions(storage, compositions) {
  storage.setItem(STORAGE_KEY, JSON.stringify(compositions));
}

export { STORAGE_KEY };
