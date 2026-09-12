import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/^\/([A-Za-z]):/, '$1:');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const file of ['index.html', 'styles.css', 'favicon.svg']) {
  cpSync(join(root, file), join(dist, file));
}
cpSync(join(root, 'src'), join(dist, 'src'), { recursive: true });

console.log('Static build complete: dist/');
