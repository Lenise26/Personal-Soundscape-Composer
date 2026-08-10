import test from 'node:test';
import assert from 'node:assert/strict';
import { reusableConfigurations, sampleCompositions, soundPresets } from '../src/data.js';

const presetIds = new Set(soundPresets.map((item) => item.id));

function validateLayer(layer, duration) {
  assert.ok(presetIds.has(layer.presetId), `unknown preset ${layer.presetId}`);
  assert.ok(layer.volume >= 0 && layer.volume <= 100, 'volume must be 0–100');
  assert.ok(layer.start >= 0, 'start must be non-negative');
  assert.ok(layer.end > layer.start, 'end must follow start');
  assert.ok(layer.end <= duration, 'layer must fit composition duration');
  assert.ok(layer.fadeIn >= 0 && layer.fadeOut >= 0, 'fades must be non-negative');
}

test('sample compositions have valid, unique production data', () => {
  const ids = new Set();
  for (const composition of sampleCompositions) {
    assert.ok(!ids.has(composition.id), 'composition ids must be unique');
    ids.add(composition.id);
    assert.ok(composition.name.length >= 5);
    assert.ok(composition.duration >= 60);
    composition.layers.forEach((layer) => validateLayer(layer, composition.duration));
  }
});

test('reusable configuration library contains U.S.-focused examples', () => {
  const usLocation = /, (WA|NY|CA)$/;
  for (const config of reusableConfigurations) {
    assert.match(config.location, usLocation);
    const duration = Math.max(...config.layers.map((layer) => layer.end));
    config.layers.forEach((layer) => validateLayer(layer, duration));
  }
});
