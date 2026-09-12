# Passive voice support

Phase 6B adds the smallest useful passive-voice slice needed for Lesson 04. It reuses the existing Sentence Comparison, Sentence Transformer, Word Order Builder, Error Corrector, Sentence Generator, and Context Grammar Components. No passive-specific Component, Demo Type, Interaction, or Research Reference is added.

## Supported grammar state

Voice is supported only with an explicit tense:

```text
tense: present | past
voice: active | passive
```

`modal + voice`, `voice + negative`, perfect/progressive passive, and an omitted tense are unsupported. `src/lib/grammar/grammar-state.js` is the source of truth for supported voice values.

## Role-based sentence model

Voice Problems use roles instead of the legacy `subjects` / `object` model:

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

The model must provide both roles, a non-empty label, `singular` or `plural` number, and `base`, `past`, and `pastParticiple` forms. Problem Data does not hardcode the completed sentence for the Transformer or Generator.

## Realization

The shared realizer produces these fixed examples:

| Tense | Active | Passive |
| --- | --- | --- |
| Present | The teacher writes the report. | The report is written by the teacher. |
| Past | The teacher wrote the report. | The report was written by the teacher. |

Present active agreement follows `roles.agent.number`. Passive `be` agreement follows `roles.patient.number`: `is/are` in present and `was/were` in past. The passive path always uses `be + pastParticiple`.

## Lesson 04 data

Lesson 04 uses six existing interaction types:

```text
SC-003 → ST-003 → WO-006 → EC-005 → SG-005 → CG-005
```

SC-003 is reused without modification. The five new Problems respectively cover voice transformation, passive word order, past-participle correction, goal-based generation, and choosing passive voice when the patient should be the focus.

The lesson does not add free text, agent omission generalization, backend state, persistence, LLM/API, or new research.
