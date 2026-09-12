# Modal support boundary

Phase 5F adds a small, explicit modal boundary to the existing sentence realization flow. It is a reusable grammar capability, not a new Demo Type.

## Supported state

Modal Problems use this control shape:

```js
{
  subject: 'he',
  modal: 'can',
  negative: false,
}
```

The supported modal values are `can`, `could`, `should`, and `must`. The shared `generateSentence` helper uses the base verb after every modal:

```text
He can play tennis.
They should play tennis.
He must not play tennis.
He cannot play tennis.
```

Negative `can` is rendered as `cannot`; negative `could`, `should`, and `must` use `could not`, `should not`, and `must not`.

## Reuse and validation

Sentence Transformer and Sentence Generator both call `src/lib/grammar/generateSentence.js`. The Validator checks the modal option set, defaults, target states, and the shared sentence model. A Problem must use either `tense` or `modal`; mixing both is outside this phase.

Lesson 03 composes the existing six interaction families without adding a Component, InteractionEntry, Research Reference, backend, or persistent progress. Passive voice, perfect/progressive modal combinations, `may`/`might`, and free-text generation remain future extensions.
