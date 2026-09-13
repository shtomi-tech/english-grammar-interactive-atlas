export const lessonGenerationVersion = '1';

export const lessonGenerationTopLevelFields = Object.freeze([
  'version',
  'id',
  'materialPlanRef',
  'problemGenerationRefs',
  'candidateLesson',
  'alignment',
]);
export const lessonGenerationMaterialPlanRefFields = Object.freeze(['id', 'version']);
export const lessonGenerationProblemGenerationRefFields = Object.freeze(['id', 'version']);
export const lessonGenerationAlignmentFields = Object.freeze(['stepMappings', 'rationale']);
export const lessonGenerationStepMappingFields = Object.freeze(['materialPlanItemId', 'lessonStepId']);

export const lessonGenerationFieldDefinitions = Object.freeze({
  version: {
    type: 'string',
    required: true,
    allowedValues: [lessonGenerationVersion],
    description: 'Lesson Generation contract version.',
  },
  id: {
    type: 'string',
    required: true,
    description: 'Stable identifier for one generated Lesson proposal.',
  },
  materialPlanRef: {
    type: 'object',
    required: true,
    fields: [...lessonGenerationMaterialPlanRefFields],
    description: 'Reference to the Material Plan that orders the Lesson steps.',
  },
  problemGenerationRefs: {
    type: 'array',
    required: true,
    itemFields: [...lessonGenerationProblemGenerationRefFields],
    description: 'Problem Generation references needed by generate and adapt items.',
  },
  candidateLesson: {
    type: 'object',
    required: true,
    description: 'Lesson data using the existing Lesson Contract.',
  },
  alignment: {
    type: 'object',
    required: true,
    fields: [...lessonGenerationAlignmentFields],
    description: 'Traceability from each Lesson step to one Material Plan item.',
  },
});
