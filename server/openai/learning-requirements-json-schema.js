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
  const audienceStage = constraints?.audienceStage;
  const outputConstraintFields = ['durationMinutes', 'maxLearningPoints', 'language']
    .filter((field) => Object.prototype.hasOwnProperty.call(constraints ?? {}, field));
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

  const required = ['version', 'id', 'topic', 'sourceReferences', 'learningPoints'];
  const properties = {
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
  };

  if (audienceStage !== undefined) {
    properties.audience = {
      type: 'object',
      additionalProperties: false,
      required: ['stage'],
      properties: { stage: enumSchema([audienceStage]) },
    };
    required.push('audience');
  }
  if (outputConstraintFields.length > 0) {
    const constraintProperties = {};
    outputConstraintFields.forEach((field) => {
      constraintProperties[field] = field === 'language'
        ? enumSchema([constraints[field]])
        : { type: 'integer', enum: [constraints[field]] };
    });
    properties.constraints = {
      type: 'object',
      additionalProperties: false,
      required: outputConstraintFields,
      properties: constraintProperties,
    };
    required.push('constraints');
  }

  return {
    type: 'object',
    additionalProperties: false,
    required,
    properties,
  };
}
