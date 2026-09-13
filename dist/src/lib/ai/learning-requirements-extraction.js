import { learningRequirementsContract } from '../../data/ai/learning-requirements-schema.js';
import { normalizeGrammarReference } from './grammar-reference.js';
import { validateGrammarReference } from '../validateGrammarReference.js';
import { validateGrammarReferenceTraceability } from '../validateMaterialGenerationProof.js';
import { validateLearningRequirements } from '../validateLearningRequirements.js';

const extractionRequestFields = Object.freeze([
  'version',
  'task',
  'grammarReference',
  'outputContract',
  'instructions',
  'constraints',
]);

export function createLearningRequirementsExtractionRequest({ grammarReference, constraints } = {}) {
  const normalizedReference = normalizeGrammarReference(grammarReference);
  const referenceValidation = validateGrammarReference(normalizedReference);
  if (!referenceValidation.valid) {
    throw new TypeError(`Invalid Grammar Reference: ${referenceValidation.errors.join('; ')}`);
  }
  const request = {
    version: '1',
    task: 'extract-learning-requirements',
    grammarReference: {
      id: normalizedReference.id,
      sourceId: normalizedReference.sourceId,
      title: normalizedReference.title,
      format: normalizedReference.format,
      content: normalizedReference.content,
    },
    outputContract: {
      name: 'learning-requirements',
      version: learningRequirementsContract.version,
    },
    instructions: {
      sourcePriority: 'user-provided',
      doNotAddUnsupportedGrammar: true,
      requireSourceEvidence: true,
    },
  };
  if (constraints !== undefined) request.constraints = structuredClone(constraints);
  return request;
}

function invalidResult(request, errors) {
  return {
    valid: false,
    request: request ? structuredClone(request) : null,
    learningRequirements: null,
    errors,
  };
}

export async function runLearningRequirementsExtraction({ grammarReference, adapter, constraints } = {}) {
  let request;
  try {
    request = createLearningRequirementsExtractionRequest({ grammarReference, constraints });
  } catch (error) {
    return invalidResult(null, [error.message]);
  }
  if (!adapter || typeof adapter.extractLearningRequirements !== 'function') {
    return invalidResult(request, ['adapter.extractLearningRequirements must be a function']);
  }

  let response;
  try {
    response = await adapter.extractLearningRequirements(structuredClone(request));
  } catch (error) {
    return invalidResult(request, [`adapter failed: ${error.message}`]);
  }
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return invalidResult(request, ['adapter must return a Learning Requirements object']);
  }

  let learningRequirements;
  try {
    learningRequirements = structuredClone(response);
  } catch {
    return invalidResult(request, ['adapter returned a non-serializable Learning Requirements object']);
  }
  const errors = [];
  const requirementsValidation = validateLearningRequirements(learningRequirements);
  if (!requirementsValidation.valid) errors.push(`learningRequirements: ${requirementsValidation.errors.join('; ')}`);
  const traceability = validateGrammarReferenceTraceability(grammarReference, learningRequirements);
  if (!traceability.valid) errors.push(`sourceTraceability: ${traceability.errors.join('; ')}`);
  return {
    valid: errors.length === 0,
    request: structuredClone(request),
    learningRequirements: errors.length === 0 ? learningRequirements : null,
    errors,
  };
}

export { extractionRequestFields };
