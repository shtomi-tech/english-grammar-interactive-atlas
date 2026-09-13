import {
  learningRequirementDesiredOutcomes,
  learningRequirementImportanceValues,
  learningRequirementSourceTypes,
  learningRequirementsVersion,
} from '../../src/data/ai/learning-requirements-schema.js';

function enumSchema(values) {
  return { type: 'string', enum: [...values] };
}
export function buildLearningRequirementsJsonSchema({ constraints = {}, grammarReference } = {}) {
  const maxLearningPoints = constraints?.maxLearningPoints;
  const sourceId = grammarReference?.sourceId;
  const sourceTitle = grammarReference?.title;
  const sourceReferenceProperties = {
    id: sourceId ? enumSchema([sourceId]) : { type: 'string', minLength: 1 },
    type: enumSchema(learningRequirementSourceTypes),
    title: sourceTitle ? enumSchema([sourceTitle]) : { type: 'string', minLength: 1 },
  };
  const evidenceProperties = {
    sourceId: sourceId ? enumSchema([sourceId]) : { type: 'string', minLength: 1 },
    locator: {
      type: 'object',
      additionalProperties: false,
      required: ['quote'],
      properties: { quote: { type: 'string', minLength: 1 } },
    },
    summary: { type: 'string', minLength: 1 },
  };

  return {
    type: 'object',
    additionalProperties: false,
    required: ['version', 'id', 'topic', 'sourceReferences', 'learningPoints'],
    properties: {
      version: enumSchema([learningRequirementsVersion]),
      id: { type: 'string', minLength: 1 },
      topic: { type: 'string', minLength: 1 },
      sourceReferences: {
        type: 'array',
        minItems: 1,
        maxItems: 1,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'type', 'title'],
          properties: sourceReferenceProperties,
        },
      },
      learningPoints: {
        type: 'array',
        minItems: 1,
        ...(Number.isInteger(maxLearningPoints) && maxLearningPoints > 0 ? { maxItems: maxLearningPoints } : {}),
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'concept', 'summary', 'importance', 'desiredOutcomes', 'sourceEvidence'],
          properties: {
            id: { type: 'string', minLength: 1 },
            concept: { type: 'string', minLength: 1 },
            summary: { type: 'string', minLength: 1 },
            importance: enumSchema(learningRequirementImportanceValues),
            desiredOutcomes: {
              type: 'array',
              minItems: 1,
              items: enumSchema(learningRequirementDesiredOutcomes),
            },
            sourceEvidence: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['sourceId', 'locator', 'summary'],
                properties: evidenceProperties,
              },
            },
          },
        },
      },
    },
  };
}
