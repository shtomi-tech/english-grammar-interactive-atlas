import assert from 'node:assert/strict';
import { interactions } from '../src/data/interactions.js';
import { filterInteractions, getAtlasStats, searchInteractions } from '../src/lib/atlas.js';
import { grammarClassifierProblem } from '../src/data/demo-problems.js';
import { demoRegistry } from '../src/components/demos/registry.js';
import { validateInteractions } from '../src/lib/validateInteractions.js';
import { checkClassification } from '../src/lib/grammar/classification.js';
import { checkWordOrder, shuffleWordIds } from '../src/lib/grammar/word-order.js';
import { checkTokenSelection } from '../src/lib/grammar/parts.js';
import { generateSentence } from '../src/lib/grammar/generateSentence.js';

assert.equal(interactions.length, 40);
assert.deepEqual(
  interactions.map((entry) => entry.id),
  Array.from({ length: 40 }, (_, index) => `GRAM-INT-${String(index + 1).padStart(3, '0')}`),
);
assert.equal(new Set(interactions.map((entry) => entry.category)).size, 10);
assert.equal(filterInteractions(interactions, 'transform').length, 4);
assert.equal(filterInteractions(interactions, 'all', { reusability: 'S' }).length, 29);
assert.equal(filterInteractions(interactions, 'all', { reusability: 'A' }).length, 11);
assert.equal(filterInteractions(interactions, 'all', { reusability: 'B' }).length, 0);
assert.equal(filterInteractions(interactions, 'all', { demo: 'available' }).length, 4);
assert.equal(filterInteractions(interactions, 'all', { demo: 'planned' }).length, 36);
assert.equal(searchInteractions(interactions, 'relative').length, 2);
assert.equal(searchInteractions(interactions, '  RELATIVE  ').length, 2);
assert.equal(searchInteractions(interactions, 'conditional').length, 1);
assert.equal(
  searchInteractions(filterInteractions(interactions, 'generate', { reusability: 'S', demo: 'planned' }), 'generator').length,
  2,
);
assert.deepEqual(getAtlasStats(interactions, demoRegistry), {
  catalogEntries: 40,
  interactionFamilies: 10,
  workingDemos: 4,
});

assert.equal(checkWordOrder(['i', 'play', 'tennis'], ['i', 'play', 'tennis']), true);
assert.equal(checkWordOrder(['play', 'i', 'tennis'], ['i', 'play', 'tennis']), false);
assert.equal(checkTokenSelection(['boy', 'the'], ['the', 'boy']), true);
assert.equal(checkTokenSelection(['the', 'plays'], ['the', 'boy']), false);

const shuffled = shuffleWordIds(['i', 'play', 'tennis'], ['i', 'play', 'tennis'], () => 0.5);
assert.deepEqual([...shuffled].sort(), ['i', 'play', 'tennis']);
assert.notDeepEqual(shuffled, ['i', 'play', 'tennis']);
assert.deepEqual(shuffleWordIds(['only'], ['only'], () => 0), ['only']);

const correctAssignments = Object.fromEntries(grammarClassifierProblem.items.map((item) => [item.id, item.answer]));
assert.equal(checkClassification(correctAssignments, grammarClassifierProblem.items), true);
assert.equal(checkClassification({ ...correctAssignments, plays: 'object' }, grammarClassifierProblem.items), false);
const incompleteAssignments = { ...correctAssignments };
delete incompleteAssignments['after-school'];
assert.equal(checkClassification(incompleteAssignments, grammarClassifierProblem.items), false);
assert.equal(checkClassification({ ...correctAssignments, extra: 'subject' }, grammarClassifierProblem.items), false);

const validInteractions = validateInteractions(interactions, { registryKeys: Object.keys(demoRegistry) });
assert.equal(validInteractions.valid, true, validInteractions.errors.join('; '));
const cloneInteractions = () => interactions.map((entry) => ({ ...entry, targetGrammar: [...entry.targetGrammar] }));
const duplicateId = cloneInteractions();
duplicateId[1].id = duplicateId[0].id;
assert.equal(validateInteractions(duplicateId).valid, false);
const duplicateSlug = cloneInteractions();
duplicateSlug[1].slug = duplicateSlug[0].slug;
assert.equal(validateInteractions(duplicateSlug).valid, false);
const invalidCategory = cloneInteractions();
invalidCategory[0].category = 'unknown';
assert.equal(validateInteractions(invalidCategory).valid, false);
const invalidDifficulty = cloneInteractions();
invalidDifficulty[0].implementationDifficulty = 6;
assert.equal(validateInteractions(invalidDifficulty).valid, false);
const invalidRank = cloneInteractions();
invalidRank[0].reusability = 'X';
assert.equal(validateInteractions(invalidRank).valid, false);
const missingDescription = cloneInteractions();
missingDescription[0].description = '';
assert.equal(validateInteractions(missingDescription).valid, false);
const emptyTargetGrammar = cloneInteractions();
emptyTargetGrammar[0].targetGrammar = [];
assert.equal(validateInteractions(emptyTargetGrammar).valid, false);
const blankInteractionType = cloneInteractions();
blankInteractionType[0].interactionType = [''];
assert.equal(validateInteractions(blankInteractionType).valid, false);
const invalidResearchStatus = cloneInteractions();
invalidResearchStatus[0].researchStatus = 'pending';
assert.equal(validateInteractions(invalidResearchStatus).valid, false);
const verifiedLicenseWithoutName = cloneInteractions();
verifiedLicenseWithoutName[0].licenseStatus = 'verified';
assert.equal(validateInteractions(verifiedLicenseWithoutName).valid, false);
const unknownLicenseWithName = cloneInteractions();
unknownLicenseWithName[0].licenseStatus = 'unknown';
unknownLicenseWithName[0].license = 'MIT';
assert.equal(validateInteractions(unknownLicenseWithName).valid, false);
const repositoryWithoutUrl = cloneInteractions();
repositoryWithoutUrl[0].sourceType = 'repository';
assert.equal(validateInteractions(repositoryWithoutUrl).valid, false);
const missingDemo = cloneInteractions();
missingDemo[0].demoType = 'missing-demo';
assert.equal(validateInteractions(missingDemo, { registryKeys: Object.keys(demoRegistry) }).valid, false);

const sentenceCases = [
  [{ subject: 'he', tense: 'present', negative: false }, 'He plays tennis.'],
  [{ subject: 'they', tense: 'present', negative: false }, 'They play tennis.'],
  [{ subject: 'he', tense: 'past', negative: false }, 'He played tennis.'],
  [{ subject: 'they', tense: 'past', negative: false }, 'They played tennis.'],
  [{ subject: 'he', tense: 'present', negative: true }, 'He does not play tennis.'],
  [{ subject: 'they', tense: 'present', negative: true }, 'They do not play tennis.'],
  [{ subject: 'he', tense: 'past', negative: true }, 'He did not play tennis.'],
  [{ subject: 'they', tense: 'past', negative: true }, 'They did not play tennis.'],
];

for (const [state, expected] of sentenceCases) {
  assert.equal(generateSentence(state), expected);
}

console.log('Logic tests passed.');
