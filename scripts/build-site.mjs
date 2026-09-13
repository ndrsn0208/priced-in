import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
const entries = ['index.html', 'src', 'assets'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of entries) {
  await cp(new URL(entry, root), new URL(entry, output), { recursive: true });
}

const files = await readdir(output, { recursive: true });
let count = 0;
let bytes = 0;
for (const file of files) {
  const details = await stat(new URL(file, output));
  if (details.isFile()) {
    count++;
    bytes += details.size;
  }
}

console.log(`Built ${count} public files (${bytes.toLocaleString('en-US')} bytes) in ${fileURLToPath(output)}`);
