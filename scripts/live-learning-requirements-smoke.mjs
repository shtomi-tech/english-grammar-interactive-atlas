import { markdownGrammarReference } from '../src/data/ai/learning-requirements-adapter-fixtures.js';
import { interactionRetrievalMetadata } from '../src/data/ai/index.js';
import { interactions } from '../src/data/interactions.js';
import { problems } from '../src/data/problems/index.js';
import { lessons } from '../src/data/lessons.js';
import { createAiRetrievalIndex } from '../src/lib/ai/retrieval-index.js';
import { createMaterialPlan } from '../src/lib/ai/material-planning.js';
import { validateMaterialPlan } from '../src/lib/validateMaterialPlan.js';
import { runLearningRequirementsExtraction } from '../src/lib/ai/learning-requirements-extraction.js';
import { createOpenAiLearningRequirementsAdapter } from '../server/openai/openai-learning-requirements-adapter.js';

if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
  console.error('Live LLM smoke skipped: OPENAI_API_KEY and OPENAI_MODEL are required.');
  process.exitCode = 2;
} else {
  const extraction = await runLearningRequirementsExtraction({
    grammarReference: markdownGrammarReference,
    adapter: createOpenAiLearningRequirementsAdapter(),
    requireQuote: true,
  });
  if (!extraction.valid) {
    console.error(`Live LLM smoke failed: ${extraction.errors.join('; ')}`);
    process.exitCode = 1;
  } else {
    const retrievalIndex = createAiRetrievalIndex({ interactions, problems, lessons, interactionRetrievalMetadata });
    const materialPlan = createMaterialPlan({
      learningRequirements: extraction.learningRequirements,
      retrievalIndex,
      id: 'MATPLAN-LIVE-SMOKE',
    });
    const validation = validateMaterialPlan(materialPlan, {
      learningRequirements: extraction.learningRequirements,
      retrievalIndex,
    });
    if (!validation.valid) {
      console.error(`Live LLM smoke failed: ${validation.errors.join('; ')}`);
      process.exitCode = 1;
    } else {
      console.log(`Live LLM smoke passed: ${extraction.learningRequirements.learningPoints.length} Learning Points, ${materialPlan.items.length} Material Plan items.`);
    }
  }
}
