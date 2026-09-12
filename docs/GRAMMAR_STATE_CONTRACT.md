# Grammar state contract

Phase 6A keeps the grammar state contract in one place so the realization helper, validator, and control labels do not drift apart.

## State modes

The current modes are:

```text
tense: subject + tense + negative
modal: subject + modal + negative
voice: tense + voice
```

`tense` and `modal` are mutually exclusive in one state or Problem. Voice is an orthogonal feature for the role-based sentence model, but Phase 6B supports only `tense + voice`. `modal + voice`, `voice + negative`, and a voice state without an explicit tense are unsupported. The shared values live in `src/lib/grammar/grammar-state.js`; it exposes `SUPPORTED_TENSES`, `SUPPORTED_MODALS`, `SUPPORTED_VOICES`, and `getGrammarStateMode()`.

The supported values remain deliberately small:

- Tense: `present`, `past`
- Modal: `can`, `could`, `should`, `must`
- Voice: `active`, `passive`

## Sentence model requirements

Legacy sentence models need `subjects`, `verb.base`, and `object`. Tense mode additionally requires `verb.past`; modal mode does not, because a modal always takes the base verb. Voice Problems use a role-based model instead:

```js
{
  roles: {
    agent: { label: 'the teacher', number: 'singular' },
    patient: { label: 'the report', number: 'singular' },
  },
  verb: { base: 'write', past: 'wrote', pastParticiple: 'written' },
  punctuation: '.',
}
```

The role-based model requires both roles, their `label` and `number`, and all three verb forms. Active realization uses the agent as subject; passive realization uses the patient as subject with `be + pastParticiple` and an optional fixed `by` phrase.

`src/lib/grammar/generateSentence.js` resolves the mode before applying the mode-specific requirement. Existing tense output and modal output remain unchanged.

## Control labels

`src/lib/grammar/grammar-controls.js` is the single label source for `subject`, `tense`, `modal`, `voice`, and `negative`. Sentence Transformer and Sentence Generator still render their own controls because their learning actions differ, but they use the same label resolver.

Problem Data for Sentence Transformer and Sentence Generator must contain exactly one of `tense` or `modal`; neither is invalid even though the low-level realizer may default an omitted tense to present for legacy callers. Voice Problems use `tense` plus `voice` and do not use `subject` or `negative` controls.

This contract does not add perfect/progressive voice, modal + voice, negative passive, persistence, or a new Demo Type.
