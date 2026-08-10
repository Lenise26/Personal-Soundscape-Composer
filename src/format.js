export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function uid(prefix = 'id') {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}-${random}`;
}
