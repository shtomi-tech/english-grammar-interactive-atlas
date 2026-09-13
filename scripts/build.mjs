import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { interactions } from '../src/data/interactions.js';
import {
  e2eMaterialGenerationFixture,
  interactionRetrievalMetadata,
  learningRequirementsContract,
  lessonGenerationContract,
  materialPlanContract,
  problemGenerationContract,
} from '../src/data/ai/index.js';
import { problems } from '../src/data/problems/index.js';
import { lessons } from '../src/data/lessons.js';
import { createAiRetrievalIndex } from '../src/lib/ai/retrieval-index.js';
import { runMaterialGenerationProof } from '../src/lib/ai/material-generation-proof.js';

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
writeFileSync(join(aiDist, 'problem-data.json'), `${JSON.stringify(problems, null, 2)}\n`, 'utf8');
writeFileSync(join(aiDist, 'lesson-data.json'), `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
writeFileSync(join(contractsDist, 'problem-generation.json'), `${JSON.stringify(problemGenerationContract, null, 2)}\n`, 'utf8');
writeFileSync(join(contractsDist, 'lesson-generation.json'), `${JSON.stringify(lessonGenerationContract, null, 2)}\n`, 'utf8');
const proofDist = join(aiDist, 'proofs');
mkdirSync(proofDist, { recursive: true });
const materialGenerationProof = runMaterialGenerationProof({
  ...e2eMaterialGenerationFixture,
  retrievalIndex,
  canonicalProblems: problems,
  canonicalLessons: lessons,
});
if (!materialGenerationProof.valid) throw new Error(`End-to-end material generation proof failed: ${materialGenerationProof.errors.join('; ')}`);
writeFileSync(join(proofDist, 'end-to-end-material-generation.json'), `${JSON.stringify(materialGenerationProof.proof, null, 2)}\n`, 'utf8');

console.log('Static build complete: dist/');
