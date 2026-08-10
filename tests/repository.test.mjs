import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('HTML contains essential responsive and accessibility metadata', async () => {
  const html = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');
  assert.match(html, /name="viewport"/);
  assert.match(html, /name="description"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /type="module"/);
});

test('README documents local quality commands and GitHub description', async () => {
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /npm test/);
  assert.match(readme, /npm run build/);
  assert.match(readme, /GitHub repository description/);
});
