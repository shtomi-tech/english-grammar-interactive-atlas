import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/^\/([A-Za-z]):/, '$1:');
const files = [
  'src/app.js',
  'src/data/interactions.js',
  'src/data/interaction-schema.js',
  'src/data/ai/schema.js',
  'src/data/ai/interaction-retrieval.js',
  'src/data/ai/index.js',
  'src/data/ai/retrieval-query-schema.js',
  'src/data/ai/retrieval-benchmarks.js',
  'src/data/ai/learning-requirements-schema.js',
  'src/data/ai/learning-requirements-fixtures.js',
  'src/data/ai/material-plan-schema.js',
  'src/data/ai/material-plan-fixtures.js',
  'src/data/ai/outcome-retrieval-profiles.js',
  'src/data/ai/problem-generation-schema.js',
  'src/data/ai/problem-generation-fixtures.js',
  'src/data/ai/problem-generation-contract.js',
  'src/data/ai/lesson-generation-schema.js',
  'src/data/ai/lesson-generation-fixtures.js',
  'src/data/ai/lesson-generation-contract.js',
  'src/data/ai/e2e-material-generation-fixture.js',
  'src/data/interactions-additional.js',
  'src/data/demo-problems.js',
  'src/data/problems/word-order.js',
  'src/data/problems/mark-parts.js',
  'src/data/problems/grammar-classifier.js',
  'src/data/problems/sentence-transformer.js',
  'src/data/problems/sentence-pattern-diagram.js',
  'src/data/problems/modifier-connection-viewer.js',
  'src/data/problems/modifier-positioner.js',
  'src/data/problems/sentence-comparison.js',
  'src/data/problems/error-corrector.js',
  'src/data/problems/context-grammar.js',
  'src/data/problems/sentence-generator.js',
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
  'src/lib/ai/retrieval-index.js',
  'src/lib/ai/retrieval-search.js',
  'src/lib/ai/retrieval-evaluation.js',
  'src/lib/ai/material-planning.js',
  'src/lib/ai/problem-generation.js',
  'src/lib/ai/lesson-generation.js',
  'src/lib/ai/material-generation-proof.js',
  'src/lib/validateAiRetrieval.js',
  'src/lib/validateLearningRequirements.js',
  'src/lib/validateMaterialPlan.js',
  'src/lib/validateProblemGeneration.js',
  'src/lib/validateLessonGeneration.js',
  'src/lib/validateMaterialGenerationProof.js',
  'src/lib/dom.js',
  'src/lib/grammar/word-order.js',
  'src/lib/grammar/parts.js',
  'src/lib/grammar/classification.js',
  'src/lib/grammar/generateSentence.js',
  'src/lib/grammar/sentence-pattern.js',
  'src/lib/grammar/modifier-relations.js',
  'src/lib/grammar/modifier-placement.js',
  'src/lib/grammar/sentence-comparison.js',
  'src/lib/grammar/error-correction.js',
  'src/lib/grammar/context-grammar.js',
  'src/lib/grammar/generation-goal.js',
  'src/lib/grammar/grammar-state.js',
  'src/lib/grammar/grammar-controls.js',
  'src/lib/lesson-progress.js',
  'src/webmcp.js',
  'src/components/atlas/interactionCard.js',
  'src/components/atlas/filterBar.js',
  'src/components/demos/demoPanel.js',
  'src/components/demos/wordOrderBuilder.js',
  'src/components/demos/markTheParts.js',
  'src/components/demos/sentenceTransformer.js',
  'src/components/demos/grammarClassifier.js',
  'src/components/demos/sentencePatternDiagram.js',
  'src/components/demos/modifierConnectionViewer.js',
  'src/components/demos/modifierPositioner.js',
  'src/components/demos/sentenceComparison.js',
  'src/components/demos/errorCorrector.js',
  'src/components/demos/contextGrammar.js',
  'src/components/demos/sentenceGenerator.js',
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
const { interactionRetrievalMetadata } = await import('../src/data/ai/index.js');
const {
  retrievalBenchmarks,
  learningRequirementsFixtures,
  materialPlanFixtures,
  outcomeRetrievalProfiles,
  problemGenerationFixtures,
  problemGenerationContexts,
  lessonGenerationFixtures,
  lessonGenerationContexts,
  e2eMaterialGenerationFixture,
} = await import('../src/data/ai/index.js');
const { createAiRetrievalIndex } = await import('../src/lib/ai/retrieval-index.js');
const { evaluateRetrievalBenchmarks } = await import('../src/lib/ai/retrieval-evaluation.js');
const { validateAiRetrieval } = await import('../src/lib/validateAiRetrieval.js');
const { validateLearningRequirements } = await import('../src/lib/validateLearningRequirements.js');
const { validateMaterialPlan } = await import('../src/lib/validateMaterialPlan.js');
const { validateProblemGeneration } = await import('../src/lib/validateProblemGeneration.js');
const { validateLessonGeneration } = await import('../src/lib/validateLessonGeneration.js');
const { runMaterialGenerationProof } = await import('../src/lib/ai/material-generation-proof.js');
const { validateOutcomeRetrievalProfiles } = await import('../src/lib/ai/material-planning.js');
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
const aiRetrievalIndex = createAiRetrievalIndex({
  interactions,
  problems,
  lessons,
  interactionRetrievalMetadata,
});
const aiRetrievalValidation = validateAiRetrieval(aiRetrievalIndex, {
  interactions,
  problems,
  lessons,
  interactionRetrievalMetadata,
});
if (!aiRetrievalValidation.valid) throw new Error(`AI retrieval validation failed: ${aiRetrievalValidation.errors.join('; ')}`);
console.log(`AI retrieval validation passed for ${interactions.length} interactions, ${problems.length} problems, ${lessons.length} lessons, ${aiRetrievalIndex.documents.length} documents.`);
const retrievalEvaluation = evaluateRetrievalBenchmarks(aiRetrievalIndex, retrievalBenchmarks);
if (retrievalEvaluation.failed !== 0) throw new Error(`Retrieval benchmark failed: ${retrievalEvaluation.results.filter((result) => !result.passed).map((result) => result.id).join(', ')}`);
console.log(`Retrieval benchmarks passed for ${retrievalEvaluation.passed}/${retrievalEvaluation.total} cases.`);
const learningRequirementsValidation = learningRequirementsFixtures.map((fixture) => validateLearningRequirements(fixture));
if (learningRequirementsValidation.some((result) => !result.valid)) {
  throw new Error(`Learning Requirements validation failed: ${learningRequirementsValidation.flatMap((result) => result.errors).join('; ')}`);
}
console.log(`Learning Requirements validation passed for ${learningRequirementsFixtures.length} fixtures.`);
const outcomeProfilesValidation = validateOutcomeRetrievalProfiles(outcomeRetrievalProfiles);
if (!outcomeProfilesValidation.valid) throw new Error(`Outcome retrieval profiles validation failed: ${outcomeProfilesValidation.errors.join('; ')}`);
console.log(`Outcome retrieval profiles validation passed for ${Object.keys(outcomeRetrievalProfiles).length} outcomes.`);
const materialPlanValidation = materialPlanFixtures.map((fixture, index) => validateMaterialPlan(fixture, {
  learningRequirements: learningRequirementsFixtures[index],
  retrievalIndex: aiRetrievalIndex,
}));
if (materialPlanValidation.some((result) => !result.valid)) {
  throw new Error(`Material Plan validation failed: ${materialPlanValidation.flatMap((result) => result.errors).join('; ')}`);
}
console.log(`Material Plan validation passed for ${materialPlanFixtures.length} fixtures.`);
const problemGenerationValidation = problemGenerationFixtures.map((fixture, index) => validateProblemGeneration(fixture, problemGenerationContexts[index]));
if (problemGenerationValidation.some((result) => !result.valid)) {
  throw new Error(`Problem Generation validation failed: ${problemGenerationValidation.flatMap((result) => result.errors).join('; ')}`);
}
console.log(`Problem Generation validation passed for ${problemGenerationFixtures.length} fixtures.`);
const lessonGenerationValidation = lessonGenerationFixtures.map((fixture, index) => validateLessonGeneration(fixture, lessonGenerationContexts[index]));
if (lessonGenerationValidation.some((result) => !result.valid)) {
  throw new Error(`Lesson Generation validation failed: ${lessonGenerationValidation.flatMap((result) => result.errors).join('; ')}`);
}
console.log(`Lesson Generation validation passed for ${lessonGenerationFixtures.length} fixtures.`);
const canonicalProblemSnapshotValidation = validateProblems(problems);
if (!canonicalProblemSnapshotValidation.valid) throw new Error(`Canonical Problem snapshot validation failed: ${canonicalProblemSnapshotValidation.errors.join('; ')}`);
console.log(`Canonical Problem snapshot validation passed for ${problems.length} problems.`);
const canonicalLessonSnapshotValidation = validateLessons(lessons, {
  problemRegistry,
  problemTypes: new Set(Object.keys(demoRegistry)),
});
if (!canonicalLessonSnapshotValidation.valid) throw new Error(`Canonical Lesson snapshot validation failed: ${canonicalLessonSnapshotValidation.errors.join('; ')}`);
console.log(`Canonical Lesson snapshot validation passed for ${lessons.length} lessons.`);
const materialGenerationProof = runMaterialGenerationProof({
  ...e2eMaterialGenerationFixture,
  retrievalIndex: aiRetrievalIndex,
  canonicalProblems: problems,
  canonicalLessons: lessons,
});
if (!materialGenerationProof.valid) {
  throw new Error(`End-to-end material generation proof failed: ${materialGenerationProof.errors.join('; ')}`);
}
console.log('End-to-end material generation proof passed.');
console.log('E2E source: 1');
console.log(`Learning Points: ${materialGenerationProof.proof.summary.learningPointCount}`);
console.log(`Reuse: ${materialGenerationProof.proof.summary.reusedProblemIds.length}`);
console.log(`Generate: ${materialGenerationProof.proof.summary.generatedProblemIds.length}`);
console.log(`Unresolved: ${materialGenerationProof.proof.summary.unresolvedItemIds.length}`);
console.log(`Candidate Lesson: ${materialGenerationProof.proof.summary.candidateLessonId ? 1 : 0}`);
