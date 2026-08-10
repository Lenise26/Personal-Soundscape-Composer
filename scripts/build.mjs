import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'src');
const output = resolve(root, 'dist');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });

for (const file of ['index.html', 'app.js', 'audioEngine.js', 'data.js', 'format.js', 'storage.js', 'styles.css']) {
  const info = await stat(resolve(output, file));
  if (!info.isFile() || info.size === 0) throw new Error(`Build verification failed for ${file}`);
}
console.log('Production build created in dist/.');
