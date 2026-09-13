import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { interactions } from '../src/data/interactions.js';
import {
  interactionRetrievalMetadata,
  learningRequirementsContract,
  materialPlanContract,
} from '../src/data/ai/index.js';
import { problems } from '../src/data/problems/index.js';
import { lessons } from '../src/data/lessons.js';
import { createAiRetrievalIndex } from '../src/lib/ai/retrieval-index.js';

const root = decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/^\/([A-Za-z]):/, '$1:');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const file of ['index.html', 'styles.css', 'favicon.svg']) {
  cpSync(join(root, file), join(dist, file));
}
cpSync(join(root, 'src'), join(dist, 'src'), { recursive: true });

const retrievalIndex = createAiRetrievalIndex({
  interactions,
  problems,
  lessons,
  interactionRetrievalMetadata,
});
const aiDist = join(dist, 'ai');
mkdirSync(aiDist, { recursive: true });
const contractsDist = join(aiDist, 'contracts');
mkdirSync(contractsDist, { recursive: true });
for (const [fileName, data] of Object.entries({
  'interactions.json': retrievalIndex.interactions,
  'problems.json': retrievalIndex.problems,
  'lessons.json': retrievalIndex.lessons,
  'catalog.json': retrievalIndex,
})) {
  writeFileSync(join(aiDist, fileName), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
writeFileSync(join(contractsDist, 'learning-requirements.json'), `${JSON.stringify(learningRequirementsContract, null, 2)}\n`, 'utf8');
writeFileSync(join(contractsDist, 'material-plan.json'), `${JSON.stringify(materialPlanContract, null, 2)}\n`, 'utf8');

console.log('Static build complete: dist/');
