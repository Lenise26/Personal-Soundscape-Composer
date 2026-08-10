import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, formatTime } from '../src/format.js';

test('formatTime creates timeline-friendly values', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(900), '15:00');
});

test('clamp protects numeric editor boundaries', () => {
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(6, 0, 10), 6);
  assert.equal(clamp(99, 0, 10), 10);
});
