import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/^\/([A-Za-z]):/, '$1:');
const files = [
  'src/app.js',
  'src/data/interactions.js',
  'src/data/interaction-schema.js',
  'src/data/interactions-additional.js',
  'src/data/demo-problems.js',
  'src/data/problems/word-order.js',
  'src/data/problems/mark-parts.js',
  'src/data/problems/grammar-classifier.js',
  'src/data/problems/sentence-transformer.js',
  'src/data/problems/index.js',
  'src/data/lessons.js',
  'src/data/research/schema.js',
  'src/data/research/references.js',
  'src/data/research/mappings.js',
  'src/data/research/index.js',
  'src/lib/atlas.js',
  'src/lib/lifecycle.js',
  'src/lib/validateInteractions.js',
  'src/lib/validateProblems.js',
  'src/lib/validateLessons.js',
  'src/lib/validateResearch.js',
  'src/lib/dom.js',
  'src/lib/grammar/word-order.js',
  'src/lib/grammar/parts.js',
  'src/lib/grammar/classification.js',
  'src/lib/grammar/generateSentence.js',
  'src/webmcp.js',
  'src/components/atlas/interactionCard.js',
  'src/components/atlas/filterBar.js',
  'src/components/demos/demoPanel.js',
  'src/components/demos/wordOrderBuilder.js',
  'src/components/demos/markTheParts.js',
  'src/components/demos/sentenceTransformer.js',
  'src/components/demos/grammarClassifier.js',
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

const { interactions } = await import('../src/data/interactions.js');
const { demoRegistry } = await import('../src/components/demos/registry.js');
const { validateInteractions } = await import('../src/lib/validateInteractions.js');
const { problems, problemRegistry } = await import('../src/data/problems/index.js');
const { lessons } = await import('../src/data/lessons.js');
const { validateDemoRegistry, validateProblems } = await import('../src/lib/validateProblems.js');
const { validateLessons } = await import('../src/lib/validateLessons.js');
const { researchReferences, researchReferenceRegistry } = await import('../src/data/research/index.js');
const { validateResearchReferences, validateResearchRegistry } = await import('../src/lib/validateResearch.js');
const validation = validateInteractions(interactions, { registryKeys: Object.keys(demoRegistry) });
if (!validation.valid) throw new Error(`Interaction validation failed: ${validation.errors.join('; ')}`);
console.log(`Interaction validation passed for ${interactions.length} entries.`);
const researchValidation = validateResearchReferences(researchReferences);
if (!researchValidation.valid) throw new Error(`Research validation failed: ${researchValidation.errors.join('; ')}`);
console.log(`Research validation passed for ${researchReferences.length} references.`);
const researchRegistryValidation = validateResearchRegistry(researchReferenceRegistry, researchReferences);
if (!researchRegistryValidation.valid) throw new Error(`Research registry validation failed: ${researchRegistryValidation.errors.join('; ')}`);
const interactionResearchValidation = validateInteractions(interactions, {
  registryKeys: Object.keys(demoRegistry),
  researchRegistry: researchReferenceRegistry,
});
if (!interactionResearchValidation.valid) throw new Error(`Interaction research mapping validation failed: ${interactionResearchValidation.errors.join('; ')}`);
console.log(`Interaction research mappings passed for ${interactions.filter((entry) => entry.researchRefs?.length).length} entries.`);
const problemValidation = validateProblems(problems);
if (!problemValidation.valid) throw new Error(`Problem validation failed: ${problemValidation.errors.join('; ')}`);
console.log(`Problem validation passed for ${problems.length} problems.`);
const registryValidation = validateDemoRegistry(demoRegistry, problemRegistry);
if (!registryValidation.valid) throw new Error(`Demo registry validation failed: ${registryValidation.errors.join('; ')}`);
console.log(`Demo registry validation passed for ${Object.keys(demoRegistry).length} demo types.`);
const lessonValidation = validateLessons(lessons, {
  problemRegistry,
  problemTypes: new Set(Object.keys(demoRegistry)),
});
if (!lessonValidation.valid) throw new Error(`Lesson validation failed: ${lessonValidation.errors.join('; ')}`);
console.log(`Lesson validation passed for ${lessons.length} lessons.`);
