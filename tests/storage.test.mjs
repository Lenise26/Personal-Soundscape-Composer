import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCompositions, saveCompositions } from '../src/storage.js';
import { sampleCompositions } from '../src/data.js';

function memoryStorage() {
  const map = new Map();
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)) };
}

test('storage returns starter content when empty', () => {
  const loaded = loadCompositions(memoryStorage(), sampleCompositions);
  assert.deepEqual(loaded, sampleCompositions);
  assert.notEqual(loaded, sampleCompositions, 'fallback should be cloned');
});

test('storage round-trips compositions', () => {
  const storage = memoryStorage();
  saveCompositions(storage, sampleCompositions);
  assert.deepEqual(loadCompositions(storage, []), sampleCompositions);
});

test('storage safely recovers from malformed JSON', () => {
  const storage = { getItem: () => '{broken json', setItem: () => {} };
  assert.deepEqual(loadCompositions(storage, sampleCompositions), sampleCompositions);
});
