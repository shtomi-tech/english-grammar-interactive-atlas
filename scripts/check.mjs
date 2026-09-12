import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/^\/([A-Za-z]):/, '$1:');
const files = [
  'src/app.js',
  'src/data/interactions.js',
  'src/data/demo-problems.js',
  'src/lib/atlas.js',
  'src/lib/dom.js',
  'src/lib/grammar/word-order.js',
  'src/lib/grammar/parts.js',
  'src/lib/grammar/generateSentence.js',
  'src/webmcp.js',
  'src/components/atlas/interactionCard.js',
  'src/components/atlas/filterBar.js',
  'src/components/demos/demoPanel.js',
  'src/components/demos/wordOrderBuilder.js',
  'src/components/demos/markTheParts.js',
  'src/components/demos/sentenceTransformer.js',
  'src/components/demos/registry.js',
];

for (const relativePath of files) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) throw new Error(`Missing source file: ${relativePath}`);
  const result = spawnSync(process.execPath, ['--check', filePath], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
}

console.log(`Syntax check passed for ${files.length} source files.`);
