# Grammar state contract

Phase 6A keeps the grammar state contract in one place so the realization helper, validator, and control labels do not drift apart.

## State modes

The current modes are:

```text
tense: subject + tense + negative
modal: subject + modal + negative
```

`tense` and `modal` are mutually exclusive in one state or Problem. The shared mode helper is `src/lib/grammar/grammar-state.js`; it exposes `SUPPORTED_TENSES`, `SUPPORTED_MODALS`, and `getGrammarStateMode()`.

The supported values remain deliberately small:

- Tense: `present`, `past`
- Modal: `can`, `could`, `should`, `must`

## Sentence model requirements

Every sentence model needs `subjects`, `verb.base`, and `object`. Tense mode additionally requires `verb.past`; modal mode does not, because a modal always takes the base verb.

`src/lib/grammar/generateSentence.js` resolves the mode before applying the mode-specific requirement. Existing tense output and modal output remain unchanged.

## Control labels

`src/lib/grammar/grammar-controls.js` is the single label source for `subject`, `tense`, `modal`, and `negative`. Sentence Transformer and Sentence Generator still render their own controls because their learning actions differ, but they use the same label resolver.

This contract does not add passive voice, new modal values, persistence, or a new Demo Type.
