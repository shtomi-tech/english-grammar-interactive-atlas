export const interactionCategories = [
  'build',
  'move',
  'select',
  'classify',
  'transform',
  'visualize',
  'generate',
  'compare',
  'correct',
  'simulate',
];

export const interactionCategoryLabels = {
  build: 'Build',
  move: 'Move',
  select: 'Select',
  classify: 'Classify',
  transform: 'Transform',
  visualize: 'Visualize',
  generate: 'Generate',
  compare: 'Compare',
  correct: 'Correct',
  simulate: 'Simulate',
};

export const interactionRanks = ['S', 'A', 'B'];
export const reusePolicies = ['code', 'logic', 'ui-reference', 'idea-only'];
export const sourceTypes = ['original', 'repository', 'site'];
export const researchStatuses = ['verified', 'unresearched'];
export const licenseStatuses = ['verified', 'unknown', 'not-applicable'];

export const sourceTypeLabels = {
  original: 'Original',
  repository: 'Repository',
  site: 'Site',
};

export const researchStatusLabels = {
  verified: 'Verified',
  unresearched: 'Not researched',
};

export const licenseStatusLabels = {
  verified: 'Verified',
  unknown: 'Unknown',
  'not-applicable': 'Not applicable',
};

export const reusePolicyLabels = {
  code: 'Code reuse',
  logic: 'Logic reuse',
  'ui-reference': 'UI reference',
  'idea-only': 'Idea only',
};

export const originalSourceMetadata = Object.freeze({
  sourceType: 'original',
  researchStatus: 'verified',
  licenseStatus: 'not-applicable',
});
