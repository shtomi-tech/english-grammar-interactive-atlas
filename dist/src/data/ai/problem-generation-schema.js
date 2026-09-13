export const problemGenerationVersion = '1';
export const problemGenerationActionValues = Object.freeze(['generate', 'adapt']);

export const problemGenerationTopLevelFields = Object.freeze([
  'version',
  'id',
  'materialPlanRef',
  'materialPlanItemId',
  'candidateProblem',
  'alignment',
]);
export const problemGenerationMaterialPlanRefFields = Object.freeze(['id', 'version']);
export const problemGenerationAlignmentFields = Object.freeze([
  'learningPointId',
  'sourceEvidenceRefs',
  'rationale',
]);
export const problemGenerationSourceEvidenceRefFields = Object.freeze(['sourceId', 'locator']);

export const problemGenerationFieldDefinitions = Object.freeze({
  version: {
    type: 'string',
    required: true,
    allowedValues: [problemGenerationVersion],
    description: 'Problem Generation contract version.',
  },
  id: {
    type: 'string',
    required: true,
    description: 'Stable identifier for one generated Problem proposal.',
  },
  materialPlanRef: {
    type: 'object',
    required: true,
    fields: [...problemGenerationMaterialPlanRefFields],
    description: 'Reference to the Material Plan that authorizes this generation.',
  },
  materialPlanItemId: {
    type: 'string',
    required: true,
    description: 'Material Plan item that supplies the target Interaction and action.',
  },
  candidateProblem: {
    type: 'object',
    required: true,
    description: 'Problem data using the existing Problem Contract without an AI-specific shape.',
  },
  alignment: {
    type: 'object',
    required: true,
    fields: [...problemGenerationAlignmentFields],
    description: 'Traceability from the candidate Problem back to the source-backed Learning Point.',
  },
});

export function createProblemGenerationContract(example) {
  return Object.freeze({
    version: problemGenerationVersion,
    requiredFields: [...problemGenerationTopLevelFields],
    optionalFields: [],
    fieldDefinitions: problemGenerationFieldDefinitions,
    actionValues: [...problemGenerationActionValues],
    materialPlanRefFields: [...problemGenerationMaterialPlanRefFields],
    alignmentFields: [...problemGenerationAlignmentFields],
    sourceEvidenceRefFields: [...problemGenerationSourceEvidenceRefFields],
    example,
  });
}
