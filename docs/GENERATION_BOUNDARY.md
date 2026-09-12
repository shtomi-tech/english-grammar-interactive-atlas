# Sentence Transformer / Sentence Generator boundary

Sentence Transformer and Sentence Generator share the existing realization helper in `src/lib/grammar/generateSentence.js`, but they represent different learning actions.

| Component | Starting point | Learner action | Feedback | Completion |
| --- | --- | --- | --- | --- |
| Sentence Transformer | A valid grammatical state is already selected | Change a control and observe the immediate sentence change | The transformed sentence and grammar recipe | No target answer is required |
| Sentence Generator | No sentence state is selected; a goal is shown | Assemble all grammar conditions, then press Generate | Generated sentence, recipe, and goal-match feedback | A generated state matches one of the Problem's `targetStates` |

The Generator must not copy sentence realization rules from the Transformer. Both Components call `generateSentence(state, sentenceModel)`. The Generator-specific pure helpers in `src/lib/grammar/generation-goal.js` only answer whether the state is complete and whether it matches an accepted target state.

An unmatched state can still be grammatical. The UI therefore shows the generated sentence and distinguishes "The sentence is grammatical, but it does not match the goal yet." from a matched goal. `onComplete` fires only for a matched target, once per mount run, and becomes available again after Reset.

The current Generator uses the same `subject`, `tense`, and `negative` control vocabulary as the Transformer for tense-based Problems. Lesson 03 also reuses the same Components with a separate modal state shape: `subject`, `modal`, and `negative`. Tense and modal are intentionally mutually exclusive in one Problem. It does not add new Research References, backend state, free text, or an LLM.
