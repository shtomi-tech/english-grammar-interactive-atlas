export const learningRequirementsVersion = '1';

export const learningRequirementSourceTypes = Object.freeze(['user-provided']);
export const learningRequirementImportanceValues = Object.freeze(['core', 'supporting', 'extension']);
export const learningRequirementDesiredOutcomes = Object.freeze([
  'recognize-form',
  'produce-form',
  'identify-role',
  'classify-function',
  'understand-meaning',
  'compare-meaning',
  'understand-rule',
  'apply-rule',
  'diagnose-error',
  'correct-error',
  'choose-in-context',
  'explain-choice',
]);
export const learningRequirementLocatorFields = Object.freeze([
  'page',
  'section',
  'paragraph',
  'line',
  'heading',
  'offset',
  'quote',
]);
export const learningRequirementAudienceStages = Object.freeze(['middle-school', 'high-school', 'adult']);

export const learningRequirementTopLevelFields = Object.freeze([
  'version',
  'id',
  'topic',
  'sourceReferences',
  'audience',
  'constraints',
  'learningPoints',
]);
export const learningRequirementSourceReferenceFields = Object.freeze(['id', 'type', 'title']);
export const learningRequirementLearningPointFields = Object.freeze([
  'id',
  'concept',
  'summary',
  'importance',
  'desiredOutcomes',
  'sourceEvidence',
]);
export const learningRequirementSourceEvidenceFields = Object.freeze(['sourceId', 'locator', 'summary']);
export const learningRequirementAudienceFields = Object.freeze(['stage']);
export const learningRequirementConstraintFields = Object.freeze([
  'durationMinutes',
  'maxLearningPoints',
  'language',
]);

export const learningRequirementRequiredFields = Object.freeze([
  'version',
  'id',
  'topic',
  'sourceReferences',
  'learningPoints',
]);
export const learningRequirementOptionalFields = Object.freeze(['audience', 'constraints']);
export const learningRequirementFieldDefinitions = Object.freeze({
  version: {
    type: 'string',
    required: true,
    allowedValues: [learningRequirementsVersion],
    description: 'Learning Requirements contract version.',
  },
  id: {
    type: 'string',
    required: true,
    description: 'Stable identifier for one Learning Requirements document.',
  },
  topic: {
    type: 'string',
    required: true,
    description: 'Grammar topic described by the source material.',
  },
  sourceReferences: {
    type: 'array',
    required: true,
    itemFields: [...learningRequirementSourceReferenceFields],
    description: 'Sources that are authoritative for the learning content.',
  },
  audience: {
    type: 'object',
    required: false,
    fields: [...learningRequirementAudienceFields],
    allowedValues: [...learningRequirementAudienceStages],
    description: 'Optional audience constraints.',
  },
  constraints: {
    type: 'object',
    required: false,
    fields: [...learningRequirementConstraintFields],
    description: 'Optional authoring constraints supplied by the user.',
  },
  learningPoints: {
    type: 'array',
    required: true,
    itemFields: [...learningRequirementLearningPointFields],
    description: 'Source-backed learning points to be planned later.',
  },
});

export const learningRequirementsExample = Object.freeze({
  version: '1',
  id: 'LR-EXAMPLE',
  topic: 'example-topic',
  sourceReferences: [
    { id: 'SOURCE-EXAMPLE', type: 'user-provided', title: 'Example source' },
  ],
  learningPoints: [
    {
      id: 'LP-EXAMPLE',
      concept: 'example concept',
      summary: 'Example source-backed learning point.',
      importance: 'core',
      desiredOutcomes: ['recognize-form'],
      sourceEvidence: [
        {
          sourceId: 'SOURCE-EXAMPLE',
          locator: { section: 'Example section' },
          summary: 'Example evidence summary.',
        },
      ],
    },
  ],
});

export const learningRequirementsContract = Object.freeze({
  version: learningRequirementsVersion,
  requiredFields: [...learningRequirementRequiredFields],
  optionalFields: [...learningRequirementOptionalFields],
  fieldDefinitions: learningRequirementFieldDefinitions,
  topLevelFields: [...learningRequirementTopLevelFields],
  sourceReferenceFields: [...learningRequirementSourceReferenceFields],
  sourceReferenceTypes: [...learningRequirementSourceTypes],
  learningPointFields: [...learningRequirementLearningPointFields],
  importanceValues: [...learningRequirementImportanceValues],
  desiredOutcomeValues: [...learningRequirementDesiredOutcomes],
  sourceEvidenceFields: [...learningRequirementSourceEvidenceFields],
  locatorFields: [...learningRequirementLocatorFields],
  audienceFields: [...learningRequirementAudienceFields],
  audienceStageValues: [...learningRequirementAudienceStages],
  constraintFields: [...learningRequirementConstraintFields],
  example: learningRequirementsExample,
});
