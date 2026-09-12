import assert from 'node:assert/strict';
import { interactions } from '../src/data/interactions.js';
import { filterInteractions, searchInteractions } from '../src/lib/atlas.js';
import { checkWordOrder } from '../src/lib/grammar/word-order.js';
import { checkTokenSelection } from '../src/lib/grammar/parts.js';
import { generateSentence } from '../src/lib/grammar/generateSentence.js';

assert.equal(interactions.length, 10);
assert.equal(filterInteractions(interactions, 'transform').length, 1);
assert.equal(searchInteractions(interactions, 'relative').length, 2);
assert.equal(searchInteractions(interactions, '  RELATIVE  ').length, 2);

assert.equal(checkWordOrder(['i', 'play', 'tennis'], ['i', 'play', 'tennis']), true);
assert.equal(checkWordOrder(['play', 'i', 'tennis'], ['i', 'play', 'tennis']), false);
assert.equal(checkTokenSelection(['boy', 'the'], ['the', 'boy']), true);
assert.equal(checkTokenSelection(['the', 'plays'], ['the', 'boy']), false);

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
