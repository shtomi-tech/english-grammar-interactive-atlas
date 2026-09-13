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

export const learningRequirementsContract = Object.freeze({
  version: learningRequirementsVersion,
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
});
