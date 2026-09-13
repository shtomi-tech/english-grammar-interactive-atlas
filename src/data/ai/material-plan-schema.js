export const materialPlanVersion = '1';
export const materialPlanActionValues = Object.freeze(['reuse', 'adapt', 'generate', 'unresolved']);

export const materialPlanTopLevelFields = Object.freeze([
  'version',
  'id',
  'learningRequirementsRef',
  'items',
]);
export const materialPlanLearningRequirementsRefFields = Object.freeze(['id', 'version']);
export const materialPlanItemFields = Object.freeze([
  'id',
  'learningPointId',
  'interactionSelection',
  'problemDecision',
  'rationale',
]);
export const materialPlanInteractionSelectionFields = Object.freeze(['query', 'selected']);
export const materialPlanProblemDecisionFields = Object.freeze([
  'action',
  'reason',
  'problemSelection',
  'sourceProblemSelection',
]);
export const materialPlanSelectionFields = Object.freeze(['query', 'selected']);
export const materialPlanSelectedInteractionFields = Object.freeze(['canonicalRef', 'rank', 'score', 'reasons']);
export const materialPlanSelectedProblemFields = Object.freeze(['canonicalRef', 'rank', 'score', 'reasons']);
export const materialPlanInteractionCanonicalRefFields = Object.freeze(['kind', 'id']);
export const materialPlanProblemCanonicalRefFields = Object.freeze(['kind', 'id', 'type']);
export const materialPlanReasonFields = Object.freeze(['field', 'value', 'score']);

export const materialPlanFieldDefinitions = Object.freeze({
  version: {
    type: 'string',
    required: true,
    allowedValues: [materialPlanVersion],
    description: 'Material Plan contract version.',
  },
  id: {
    type: 'string',
    required: true,
    description: 'Stable identifier for one material plan.',
  },
  learningRequirementsRef: {
    type: 'object',
    required: true,
    fields: [...materialPlanLearningRequirementsRefFields],
    description: 'Reference to the source Learning Requirements document.',
  },
  items: {
    type: 'array',
    required: true,
    itemFields: [...materialPlanItemFields],
    description: 'One planned learning activity per item.',
  },
  interactionSelection: {
    type: 'object',
    required: true,
    fields: [...materialPlanInteractionSelectionFields],
    description: 'Retrieval query and evidence for the selected Interaction.',
  },
  problemDecision: {
    type: 'object',
    required: true,
    fields: [...materialPlanProblemDecisionFields],
    allowedValues: [...materialPlanActionValues],
    description: 'Decision to reuse, adapt, generate, or leave unresolved.',
  },
});

export const materialPlanExample = Object.freeze({
  version: '1',
  id: 'MATPLAN-EXAMPLE',
  learningRequirementsRef: { id: 'LR-EXAMPLE', version: '1' },
  items: [
    {
      id: 'MPI-EXAMPLE',
      learningPointId: 'LP-EXAMPLE',
      interactionSelection: {
        query: { kinds: ['interaction'], learningIntents: ['recognize-form'], limit: 5 },
        selected: {
          canonicalRef: { kind: 'interaction', id: 'GRAM-INT-EXAMPLE' },
          rank: 1,
          score: 0,
          reasons: [{ field: 'learningIntents', value: 'recognize-form', score: 0 }],
        },
      },
      problemDecision: {
        action: 'unresolved',
        reason: 'Example plan leaves the Problem unresolved.',
      },
      rationale: 'Example rationale for a planned learning activity.',
    },
  ],
});

export const materialPlanContract = Object.freeze({
  version: materialPlanVersion,
  requiredFields: [...materialPlanTopLevelFields],
  optionalFields: [],
  fieldDefinitions: materialPlanFieldDefinitions,
  actionValues: [...materialPlanActionValues],
  learningRequirementsRefFields: [...materialPlanLearningRequirementsRefFields],
  itemFields: [...materialPlanItemFields],
  interactionSelectionFields: [...materialPlanInteractionSelectionFields],
  problemDecisionFields: [...materialPlanProblemDecisionFields],
  selectionFields: [...materialPlanSelectionFields],
  selectedInteractionFields: [...materialPlanSelectedInteractionFields],
  selectedProblemFields: [...materialPlanSelectedProblemFields],
  interactionCanonicalRefFields: [...materialPlanInteractionCanonicalRefFields],
  problemCanonicalRefFields: [...materialPlanProblemCanonicalRefFields],
  reasonFields: [...materialPlanReasonFields],
  example: materialPlanExample,
});
