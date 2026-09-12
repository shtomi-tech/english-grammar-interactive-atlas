import assert from 'node:assert/strict';
import { interactions } from '../src/data/interactions.js';
import { lessons } from '../src/data/lessons.js';
import { grammarClassifierProblems } from '../src/data/problems/grammar-classifier.js';
import { markPartsProblems } from '../src/data/problems/mark-parts.js';
import { problemRegistry, problems } from '../src/data/problems/index.js';
import { sentenceTransformerProblem } from '../src/data/problems/sentence-transformer.js';
import { wordOrderProblems } from '../src/data/problems/word-order.js';
import { filterInteractions, getAtlasStats, searchInteractions } from '../src/lib/atlas.js';
import { grammarClassifierProblem } from '../src/data/demo-problems.js';
import { demoRegistry, getDemoProblem } from '../src/components/demos/registry.js';
import { validateInteractions } from '../src/lib/validateInteractions.js';
import { validateLessons } from '../src/lib/validateLessons.js';
import { validateDemoRegistry, validateProblems } from '../src/lib/validateProblems.js';
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

assert.equal(problems.length, 10);
assert.deepEqual(
  Object.fromEntries(Object.entries({
    'word-order': wordOrderProblems,
    'mark-parts': markPartsProblems,
    'grammar-classifier': grammarClassifierProblems,
    'sentence-transformer': [sentenceTransformerProblem],
  }).map(([type, entries]) => [type, entries.length])),
  { 'word-order': 3, 'mark-parts': 3, 'grammar-classifier': 3, 'sentence-transformer': 1 },
);
assert.equal(problemRegistry['WO-001'], wordOrderProblems[0]);
assert.equal(validateProblems(problems).valid, true);
assert.equal(validateDemoRegistry(demoRegistry, problemRegistry).valid, true);
for (const demo of Object.values(demoRegistry)) {
  assert.equal(typeof demo.mount, 'function');
  assert.equal(problemRegistry[demo.demoProblemId].type, Object.keys(demoRegistry).find((type) => demoRegistry[type] === demo));
}
assert.equal(getDemoProblem('word-order', 'WO-002').id, 'WO-002');
assert.throws(() => getDemoProblem('word-order', 'MP-001'), /type mismatch/);

const lessonValidation = validateLessons(lessons, {
  problemRegistry,
  problemTypes: new Set(Object.keys(demoRegistry)),
});
assert.equal(lessonValidation.valid, true, lessonValidation.errors.join('; '));
assert.equal(lessons[0].steps.length, 6);

assert.equal(checkWordOrder(['i', 'play', 'tennis'], ['i', 'play', 'tennis']), true);
assert.equal(checkWordOrder(['play', 'i', 'tennis'], ['i', 'play', 'tennis']), false);
assert.equal(checkTokenSelection(['boy', 'the'], ['the', 'boy']), true);
assert.equal(checkTokenSelection(['the', 'plays'], ['the', 'boy']), false);

const shuffled = shuffleWordIds(['i', 'play', 'tennis'], ['i', 'play', 'tennis'], () => 0.5);
assert.deepEqual([...shuffled].sort(), ['i', 'play', 'tennis']);
assert.notDeepEqual(shuffled, ['i', 'play', 'tennis']);
assert.deepEqual(shuffleWordIds(['only'], ['only'], () => 0), ['only']);

for (const problem of wordOrderProblems) {
  assert.equal(checkWordOrder(problem.answer, problem.answer), true);
  assert.equal(shuffleWordIds(problem.words.map((word) => word.id), problem.answer).length, problem.words.length);
}
for (const problem of markPartsProblems) {
  assert.equal(checkTokenSelection(problem.answer, problem.answer), true);
}

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
assert.equal(
  generateSentence({ subject: 'they', tense: 'past', negative: false }, sentenceTransformerProblem.sentenceModel),
  'They played tennis.',
);

const invalidWordId = structuredClone(problems);
invalidWordId[0].words[1].id = invalidWordId[0].words[0].id;
assert.equal(validateProblems(invalidWordId).valid, false);
const unknownWordAnswer = structuredClone(problems);
unknownWordAnswer[0].answer = ['missing-word'];
assert.equal(validateProblems(unknownWordAnswer).valid, false);
const unknownTokenAnswer = structuredClone(problems);
unknownTokenAnswer[3].answer = ['missing-token'];
assert.equal(validateProblems(unknownTokenAnswer).valid, false);
const unknownClassifierCategory = structuredClone(problems);
unknownClassifierCategory[6].items[0].answer = 'missing-category';
assert.equal(validateProblems(unknownClassifierCategory).valid, false);
const invalidTransformerDefault = structuredClone(problems);
invalidTransformerDefault[9].defaults.tense = 'future';
assert.equal(validateProblems(invalidTransformerDefault).valid, false);

const unknownLessonProblem = structuredClone(lessons);
unknownLessonProblem[0].steps[0].problemId = 'MP-999';
assert.equal(validateLessons(unknownLessonProblem, { problemRegistry }).valid, false);
const mismatchedLessonStep = structuredClone(lessons);
mismatchedLessonStep[0].steps[0].interactionType = 'word-order';
assert.equal(validateLessons(mismatchedLessonStep, { problemRegistry }).valid, false);
const emptyLessonSteps = structuredClone(lessons);
emptyLessonSteps[0].steps = [];
assert.equal(validateLessons(emptyLessonSteps, { problemRegistry }).valid, false);

console.log('Logic tests passed.');
