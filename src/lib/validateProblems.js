import { getGrammarStateMode, SUPPORTED_MODALS, SUPPORTED_TENSES } from './grammar/grammar-state.js';

const problemTypes = new Set(['word-order', 'mark-parts', 'grammar-classifier', 'sentence-transformer', 'sentence-pattern-diagram', 'modifier-connection-viewer', 'sentence-comparison', 'error-corrector', 'context-grammar', 'sentence-generator']);
const transformerControlNames = new Set(['subject', 'tense', 'negative', 'modal']);

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function duplicateIds(entries, label, errors) {
  const ids = entries.filter(isRecord).map((entry) => entry.id).filter(hasText);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`${label} has duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);
}

function validateWordOrder(problem, label, errors) {
  if (!hasText(problem.prompt)) errors.push(`${label}.prompt is required`);
  if (!Array.isArray(problem.words) || problem.words.length < 2) {
    errors.push(`${label}.words must contain at least two words`);
  } else {
    duplicateIds(problem.words, `${label}.words`, errors);
    problem.words.forEach((word, index) => {
      if (!isRecord(word) || !hasText(word.id) || !hasText(word.text)) {
        errors.push(`${label}.words[${index}] must have id and text`);
      }
    });
  }
  if (!Array.isArray(problem.acceptedAnswers) || problem.acceptedAnswers.length === 0) {
    errors.push(`${label}.acceptedAnswers must contain at least one answer`);
  } else {
    const wordIds = new Set((problem.words ?? []).map((word) => word?.id));
    const answerSignatures = new Set();
    problem.acceptedAnswers.forEach((answer, answerIndex) => {
      if (!Array.isArray(answer) || answer.length === 0 || answer.some((id) => !hasText(id))) {
        errors.push(`${label}.acceptedAnswers[${answerIndex}] must contain word IDs`);
        return;
      }
      const signature = answer.join('\u0000');
      if (answerSignatures.has(signature)) errors.push(`${label}.acceptedAnswers contains a duplicate answer`);
      answerSignatures.add(signature);
      if (answer.length !== wordIds.size || new Set(answer).size !== answer.length) {
        errors.push(`${label}.acceptedAnswers[${answerIndex}] must use every word ID exactly once`);
      }
      answer.forEach((id) => {
        if (!wordIds.has(id)) errors.push(`${label}.acceptedAnswers[${answerIndex}] references an unknown word ID: ${id}`);
      });
    });
  }
  if (problem.hints !== undefined && (!Array.isArray(problem.hints) || problem.hints.length === 0 || problem.hints.some((hint) => !hasText(hint)))) {
    errors.push(`${label}.hints must contain non-empty strings when provided`);
  }
  if (!hasText(problem.explanation)) errors.push(`${label}.explanation is required`);
}

function validateMarkParts(problem, label, errors) {
  if (!hasText(problem.prompt)) errors.push(`${label}.prompt is required`);
  if (!Array.isArray(problem.tokens) || problem.tokens.length === 0) {
    errors.push(`${label}.tokens must contain tokens`);
  } else {
    duplicateIds(problem.tokens, `${label}.tokens`, errors);
    problem.tokens.forEach((token, index) => {
      if (!isRecord(token) || !hasText(token.id) || !hasText(token.text) || !hasText(token.role)) {
        errors.push(`${label}.tokens[${index}] must have id, text, and role`);
      }
    });
  }
  if (!Array.isArray(problem.answer) || problem.answer.length === 0) {
    errors.push(`${label}.answer must contain token IDs`);
  } else {
    const tokenIds = new Set((problem.tokens ?? []).map((token) => token?.id));
    problem.answer.forEach((id) => {
      if (!tokenIds.has(id)) errors.push(`${label}.answer references an unknown token ID: ${id}`);
    });
  }
  if (!hasText(problem.targetRole)) errors.push(`${label}.targetRole is required`);
  if (!hasText(problem.explanation)) errors.push(`${label}.explanation is required`);
}

function validateClassifier(problem, label, errors) {
  if (!hasText(problem.prompt) || !hasText(problem.sentence)) errors.push(`${label}.prompt and sentence are required`);
  if (!Array.isArray(problem.categories) || problem.categories.length === 0) {
    errors.push(`${label}.categories must contain at least one category`);
  } else {
    duplicateIds(problem.categories, `${label}.categories`, errors);
    problem.categories.forEach((category, index) => {
      if (!isRecord(category) || !hasText(category.id) || !hasText(category.label) || !hasText(category.explanation)) {
        errors.push(`${label}.categories[${index}] must have id, label, and explanation`);
      }
    });
  }
  if (!Array.isArray(problem.items) || problem.items.length === 0) {
    errors.push(`${label}.items must contain at least one item`);
  } else {
    duplicateIds(problem.items, `${label}.items`, errors);
    const categoryIds = new Set((problem.categories ?? []).map((category) => category?.id));
    problem.items.forEach((item, index) => {
      if (!isRecord(item) || !hasText(item.id) || !hasText(item.text) || !hasText(item.answer) || !hasText(item.explanation)) {
        errors.push(`${label}.items[${index}] must have id, text, answer, and explanation`);
      } else if (!categoryIds.has(item.answer)) {
        errors.push(`${label}.items[${index}].answer references an unknown category: ${item.answer}`);
      }
    });
  }
  if (!hasText(problem.explanation)) errors.push(`${label}.explanation is required`);
}

function controlValueKey(value) {
  return `${typeof value}:${String(value)}`;
}

function validateGrammarControls(problem, label, errors) {
  if (!isRecord(problem.controls) || Object.keys(problem.controls).length === 0) {
    errors.push(`${label}.controls must contain controls`);
  } else {
    for (const [name, options] of Object.entries(problem.controls)) {
      if (!transformerControlNames.has(name)) {
        errors.push(`${label}.controls.${name} is not supported`);
        continue;
      }
      if (!Array.isArray(options) || options.length < 2) {
        errors.push(`${label}.controls.${name} must contain at least two options`);
        continue;
      }
      const seenValues = new Set();
      options.forEach((option, index) => {
        if (!isRecord(option) || !('value' in option) || !hasText(option.label)) {
          errors.push(`${label}.controls.${name}[${index}] must have value and label`);
          return;
        }
        const key = controlValueKey(option.value);
        if (seenValues.has(key)) errors.push(`${label}.controls.${name} has duplicate values`);
        seenValues.add(key);
        if (name === 'tense' && !SUPPORTED_TENSES.has(option.value)) {
          errors.push(`${label}.controls.tense has unsupported value: ${option.value}`);
        }
        if (name === 'modal' && !SUPPORTED_MODALS.has(option.value)) {
          errors.push(`${label}.controls.modal has unsupported value: ${option.value}`);
        }
        if (name === 'negative' && typeof option.value !== 'boolean') {
          errors.push(`${label}.controls.negative values must be boolean`);
        }
      });
    }
  }
  if (getGrammarStateMode(problem.controls) === 'invalid') {
    errors.push(`${label}.controls cannot contain both tense and modal`);
  }
}

function validateDefaults(problem, label, errors) {
  if (!isRecord(problem.defaults)) {
    errors.push(`${label}.defaults is required`);
  } else {
    for (const [name, value] of Object.entries(problem.defaults)) {
      const options = problem.controls?.[name];
      if (!options?.some((option) => controlValueKey(option?.value) === controlValueKey(value))) {
        errors.push(`${label}.defaults.${name} is not present in controls.${name}`);
      }
    }
    for (const name of Object.keys(problem.controls ?? {})) {
      if (!Object.prototype.hasOwnProperty.call(problem.defaults, name)) {
        errors.push(`${label}.defaults.${name} is required`);
      }
    }
  }
}

function validateSentenceModel(problem, label, errors) {
  const model = problem.sentenceModel;
  if (!isRecord(model) || !isRecord(model.subjects) || !isRecord(model.verb) || !hasText(model.object)) {
    errors.push(`${label}.sentenceModel must have subjects, verb, and object`);
  } else {
    for (const [subjectId, subject] of Object.entries(model.subjects)) {
      if (!isRecord(subject) || !hasText(subject.label) || !['singular', 'plural'].includes(subject.number)) {
        errors.push(`${label}.sentenceModel.subjects.${subjectId} is invalid`);
      }
    }
    if (!hasText(model.verb.base)) errors.push(`${label}.sentenceModel.verb.base is required`);
    if (getGrammarStateMode(problem.controls) === 'tense' && !hasText(model.verb.past)) {
      errors.push(`${label}.sentenceModel.verb.past is required for tense controls`);
    }
    if (model.punctuation !== undefined && !hasText(model.punctuation)) errors.push(`${label}.sentenceModel.punctuation is invalid`);
    const subjectOptions = problem.controls?.subject ?? [];
    subjectOptions.forEach((option) => {
      if (!model.subjects[option.value]) errors.push(`${label}.sentenceModel has no subject for ${option.value}`);
    });
  }
}

function validateTransformer(problem, label, errors) {
  validateGrammarControls(problem, label, errors);
  validateDefaults(problem, label, errors);
  validateSentenceModel(problem, label, errors);
}

function validateSentenceGenerator(problem, label, errors) {
  if (!hasText(problem.prompt) || !hasText(problem.explanation)) {
    errors.push(`${label}.prompt and explanation are required`);
  }
  if (!isRecord(problem.goal)) {
    errors.push(`${label}.goal is required`);
  } else {
    if (!hasText(problem.goal.title)) errors.push(`${label}.goal.title is required`);
    if (!hasText(problem.goal.description)) errors.push(`${label}.goal.description is required`);
  }

  validateGrammarControls(problem, label, errors);
  validateSentenceModel(problem, label, errors);

  if (!Array.isArray(problem.targetStates) || problem.targetStates.length === 0) {
    errors.push(`${label}.targetStates must contain at least one target state`);
    return;
  }

  const controlNames = Object.keys(problem.controls ?? {});
  const controlValues = new Map(
    controlNames.map((name) => [
      name,
      new Set((problem.controls?.[name] ?? []).map((option) => controlValueKey(option?.value))),
    ]),
  );
  const signatures = new Set();
  problem.targetStates.forEach((state, stateIndex) => {
    if (!isRecord(state)) {
      errors.push(`${label}.targetStates[${stateIndex}] must be an object`);
      return;
    }
    let valid = true;
    for (const name of controlNames) {
      if (!Object.prototype.hasOwnProperty.call(state, name)) {
        errors.push(`${label}.targetStates[${stateIndex}].${name} is required`);
        valid = false;
      } else if (!controlValues.get(name)?.has(controlValueKey(state[name]))) {
        errors.push(`${label}.targetStates[${stateIndex}].${name} is not present in controls.${name}`);
        valid = false;
      }
    }
    for (const name of Object.keys(state)) {
      if (!controlNames.includes(name)) {
        errors.push(`${label}.targetStates[${stateIndex}] has an unsupported control: ${name}`);
        valid = false;
      }
    }
    if (valid) {
      const signature = controlNames.map((name) => controlValueKey(state[name])).join('\u0000');
      if (signatures.has(signature)) errors.push(`${label}.targetStates contains a duplicate state`);
      signatures.add(signature);
    }
  });
}

function validateSentencePatternDiagram(problem, label, errors) {
  if (!hasText(problem.prompt) || !hasText(problem.sentence) || !hasText(problem.explanation)) {
    errors.push(`${label}.prompt, sentence, and explanation are required`);
  }
  if (!Array.isArray(problem.chunks) || problem.chunks.length === 0) {
    errors.push(`${label}.chunks must contain at least one chunk`);
  } else {
    duplicateIds(problem.chunks, `${label}.chunks`, errors);
    problem.chunks.forEach((chunk, index) => {
      if (!isRecord(chunk) || !hasText(chunk.id) || !hasText(chunk.text) || !hasText(chunk.role) || !hasText(chunk.label) || !hasText(chunk.explanation)) {
        errors.push(`${label}.chunks[${index}] must have id, text, role, label, and explanation`);
      }
    });
  }

  if (!Array.isArray(problem.pattern) || problem.pattern.length === 0) {
    errors.push(`${label}.pattern must contain roles`);
    return;
  }

  const chunks = problem.chunks ?? [];
  const chunkRoleCounts = new Map();
  chunks.forEach((chunk) => {
    if (hasText(chunk?.role)) chunkRoleCounts.set(chunk.role, (chunkRoleCounts.get(chunk.role) ?? 0) + 1);
  });
  const patternRoleCounts = new Map();
  problem.pattern.forEach((role, index) => {
    if (!hasText(role)) {
      errors.push(`${label}.pattern[${index}] must be a role`);
      return;
    }
    if (!chunkRoleCounts.has(role)) errors.push(`${label}.pattern[${index}] references an unknown role: ${role}`);
    if (chunks[index]?.role !== role) errors.push(`${label}.pattern[${index}] must match chunks[${index}].role`);
    patternRoleCounts.set(role, (patternRoleCounts.get(role) ?? 0) + 1);
  });
  if (problem.pattern.length !== chunks.length) {
    errors.push(`${label}.pattern must have one role for each chunk`);
  }
  for (const [role, count] of chunkRoleCounts) {
    if (patternRoleCounts.get(role) !== count) errors.push(`${label}.pattern must match chunk role counts for ${role}`);
  }
}

function validateModifierConnectionViewer(problem, label, errors) {
  if (!hasText(problem.prompt) || !hasText(problem.sentence) || !hasText(problem.explanation)) {
    errors.push(`${label}.prompt, sentence, and explanation are required`);
  }
  if (!Array.isArray(problem.chunks) || problem.chunks.length === 0) {
    errors.push(`${label}.chunks must contain at least one chunk`);
  } else {
    duplicateIds(problem.chunks, `${label}.chunks`, errors);
    problem.chunks.forEach((chunk, index) => {
      if (!isRecord(chunk) || !hasText(chunk.id) || !hasText(chunk.text) || !hasText(chunk.kind)) {
        errors.push(`${label}.chunks[${index}] must have id, text, and kind`);
      }
    });
  }

  if (!Array.isArray(problem.relations) || problem.relations.length === 0) {
    errors.push(`${label}.relations must contain at least one relation`);
    return;
  }
  duplicateIds(problem.relations, `${label}.relations`, errors);
  const chunkById = new Map((problem.chunks ?? []).map((chunk) => [chunk?.id, chunk]));
  problem.relations.forEach((relation, index) => {
    if (!isRecord(relation) || !hasText(relation.id) || !hasText(relation.modifierId) || !hasText(relation.targetId) || !hasText(relation.relationType) || !hasText(relation.label) || !hasText(relation.explanation)) {
      errors.push(`${label}.relations[${index}] must have id, modifierId, targetId, relationType, label, and explanation`);
      return;
    }
    if (!chunkById.has(relation.modifierId)) errors.push(`${label}.relations[${index}] references an unknown modifierId: ${relation.modifierId}`);
    if (!chunkById.has(relation.targetId)) errors.push(`${label}.relations[${index}] references an unknown targetId: ${relation.targetId}`);
    if (relation.modifierId === relation.targetId) errors.push(`${label}.relations[${index}] modifierId and targetId must differ`);
    if (relation.relationType !== 'modifies') errors.push(`${label}.relations[${index}].relationType is unsupported: ${relation.relationType}`);
  });
}

function validateSentenceComparison(problem, label, errors) {
  if (!hasText(problem.prompt) || !hasText(problem.explanation)) {
    errors.push(`${label}.prompt and explanation are required`);
  }

  const sentenceById = new Map();
  const sentenceByChunkId = new Map();
  const chunkById = new Map();
  if (!Array.isArray(problem.sentences) || problem.sentences.length !== 2) {
    errors.push(`${label}.sentences must contain exactly two sentences`);
  } else {
    problem.sentences.forEach((sentence, sentenceIndex) => {
      if (!isRecord(sentence) || !hasText(sentence.id) || !hasText(sentence.text)) {
        errors.push(`${label}.sentences[${sentenceIndex}] must have id and text`);
        return;
      }
      if (sentenceById.has(sentence.id)) errors.push(`${label}.sentences has duplicate IDs: ${sentence.id}`);
      sentenceById.set(sentence.id, sentence);
      if (!Array.isArray(sentence.chunks) || sentence.chunks.length === 0) {
        errors.push(`${label}.sentences[${sentenceIndex}].chunks must contain at least one chunk`);
        return;
      }
      sentence.chunks.forEach((chunk, chunkIndex) => {
        if (!isRecord(chunk) || !hasText(chunk.id) || !hasText(chunk.text)) {
          errors.push(`${label}.sentences[${sentenceIndex}].chunks[${chunkIndex}] must have id and text`);
          return;
        }
        if (chunkById.has(chunk.id)) errors.push(`${label}.chunks has duplicate IDs: ${chunk.id}`);
        chunkById.set(chunk.id, chunk);
        sentenceByChunkId.set(chunk.id, sentence.id);
      });
    });
  }

  const differenceById = new Map();
  if (!Array.isArray(problem.differences) || problem.differences.length === 0) {
    errors.push(`${label}.differences must contain at least one difference`);
  } else {
    problem.differences.forEach((difference, differenceIndex) => {
      if (!isRecord(difference) || !hasText(difference.id) || !hasText(difference.leftChunkId) || !hasText(difference.rightChunkId) || !hasText(difference.label) || !hasText(difference.explanation) || !hasText(difference.meaningLeft) || !hasText(difference.meaningRight)) {
        errors.push(`${label}.differences[${differenceIndex}] must have id, both chunk IDs, label, explanation, and both meanings`);
        return;
      }
      if (differenceById.has(difference.id)) errors.push(`${label}.differences has duplicate IDs: ${difference.id}`);
      differenceById.set(difference.id, difference);
      const leftSentenceId = sentenceByChunkId.get(difference.leftChunkId);
      const rightSentenceId = sentenceByChunkId.get(difference.rightChunkId);
      if (!chunkById.has(difference.leftChunkId)) errors.push(`${label}.differences[${differenceIndex}] references an unknown leftChunkId: ${difference.leftChunkId}`);
      if (!chunkById.has(difference.rightChunkId)) errors.push(`${label}.differences[${differenceIndex}] references an unknown rightChunkId: ${difference.rightChunkId}`);
      if (leftSentenceId && rightSentenceId && leftSentenceId === rightSentenceId) {
        errors.push(`${label}.differences[${differenceIndex}] left and right chunks must come from different sentences`);
      }
    });
  }

  for (const chunk of chunkById.values()) {
    if (chunk.differenceId !== undefined) {
      if (!hasText(chunk.differenceId) || !differenceById.has(chunk.differenceId)) {
        errors.push(`${label}.chunks differenceId references an unknown difference: ${chunk.differenceId}`);
      } else {
        const difference = differenceById.get(chunk.differenceId);
        if (difference.leftChunkId !== chunk.id && difference.rightChunkId !== chunk.id) {
          errors.push(`${label}.chunks differenceId does not include chunk: ${chunk.id}`);
        }
      }
    }
  }
}

function validateErrorCorrector(problem, label, errors) {
  if (!hasText(problem.prompt) || !hasText(problem.explanation)) {
    errors.push(`${label}.prompt and explanation are required`);
  }

  const tokenById = new Map();
  if (!Array.isArray(problem.tokens) || problem.tokens.length === 0) {
    errors.push(`${label}.tokens must contain at least one token`);
  } else {
    duplicateIds(problem.tokens, `${label}.tokens`, errors);
    problem.tokens.forEach((token, index) => {
      if (!isRecord(token) || !hasText(token.id) || !hasText(token.text)) {
        errors.push(`${label}.tokens[${index}] must have id and text`);
        return;
      }
      tokenById.set(token.id, token);
    });
  }

  const correctionById = new Map();
  const correctionTokenIds = new Set();
  const optionIds = new Set();
  if (!Array.isArray(problem.corrections) || problem.corrections.length === 0) {
    errors.push(`${label}.corrections must contain at least one correction`);
  } else {
    duplicateIds(problem.corrections, `${label}.corrections`, errors);
    problem.corrections.forEach((correction, correctionIndex) => {
      if (!isRecord(correction) || !hasText(correction.id) || !hasText(correction.tokenId) || !hasText(correction.ruleLabel) || !hasText(correction.explanation)) {
        errors.push(`${label}.corrections[${correctionIndex}] must have id, tokenId, ruleLabel, and explanation`);
        return;
      }
      correctionById.set(correction.id, correction);
      if (!tokenById.has(correction.tokenId)) errors.push(`${label}.corrections[${correctionIndex}] references an unknown tokenId: ${correction.tokenId}`);
      if (correctionTokenIds.has(correction.tokenId)) errors.push(`${label}.corrections cannot share a tokenId: ${correction.tokenId}`);
      correctionTokenIds.add(correction.tokenId);

      if (!Array.isArray(correction.options) || correction.options.length < 2) {
        errors.push(`${label}.corrections[${correctionIndex}].options must contain at least two options`);
      } else {
        duplicateIds(correction.options, `${label}.corrections[${correctionIndex}].options`, errors);
        correction.options.forEach((option, optionIndex) => {
          if (!isRecord(option) || !hasText(option.id) || !hasText(option.text)) {
            errors.push(`${label}.corrections[${correctionIndex}].options[${optionIndex}] must have id and text`);
            return;
          }
          if (optionIds.has(option.id)) errors.push(`${label}.options has duplicate IDs: ${option.id}`);
          optionIds.add(option.id);
        });
      }

      if (!Array.isArray(correction.acceptedOptionIds) || correction.acceptedOptionIds.length === 0) {
        errors.push(`${label}.corrections[${correctionIndex}].acceptedOptionIds must contain at least one option ID`);
      } else {
        const correctionOptionIds = new Set((correction.options ?? []).map((option) => option?.id));
        correction.acceptedOptionIds.forEach((optionId) => {
          if (!correctionOptionIds.has(optionId)) errors.push(`${label}.corrections[${correctionIndex}] references an unknown accepted option: ${optionId}`);
        });
      }
    });
  }

  for (const token of tokenById.values()) {
    if (token.correctionId !== undefined) {
      const correction = correctionById.get(token.correctionId);
      if (!hasText(token.correctionId) || !correction) {
        errors.push(`${label}.tokens correctionId references an unknown correction: ${token.correctionId}`);
      } else if (correction.tokenId !== token.id) {
        errors.push(`${label}.tokens correctionId does not match correction tokenId: ${token.id}`);
      }
    }
  }
  for (const correction of correctionById.values()) {
    const token = tokenById.get(correction.tokenId);
    if (token?.correctionId !== undefined && token.correctionId !== correction.id) {
      errors.push(`${label}.corrections tokenId does not match token correctionId: ${correction.id}`);
    }
  }
}

function validateContextGrammar(problem, label, errors) {
  if (!hasText(problem.prompt) || !hasText(problem.explanation)) {
    errors.push(`${label}.prompt and explanation are required`);
  }

  const scenario = problem.scenario;
  if (!isRecord(scenario)) {
    errors.push(`${label}.scenario is required`);
  } else {
    for (const field of ['title', 'setting', 'learnerRole', 'goal']) {
      if (!hasText(scenario[field])) errors.push(`${label}.scenario.${field} is required`);
    }
  }

  if (!Array.isArray(problem.steps) || problem.steps.length === 0) {
    errors.push(`${label}.steps must contain at least one step`);
    return;
  }

  duplicateIds(problem.steps, `${label}.steps`, errors);
  const choiceIds = new Set();
  problem.steps.forEach((step, stepIndex) => {
    if (!isRecord(step) || !hasText(step.id) || !hasText(step.speaker) || !hasText(step.line) || !hasText(step.instruction)) {
      errors.push(`${label}.steps[${stepIndex}] must have id, speaker, line, and instruction`);
    }

    if (!Array.isArray(step?.choices) || step.choices.length < 2) {
      errors.push(`${label}.steps[${stepIndex}].choices must contain at least two choices`);
    } else {
      duplicateIds(step.choices, `${label}.steps[${stepIndex}].choices`, errors);
      step.choices.forEach((choice, choiceIndex) => {
        if (!isRecord(choice) || !hasText(choice.id) || !hasText(choice.text) || !hasText(choice.grammarLabel) || !hasText(choice.explanation)) {
          errors.push(`${label}.steps[${stepIndex}].choices[${choiceIndex}] must have id, text, grammarLabel, and explanation`);
          return;
        }
        if (choiceIds.has(choice.id)) errors.push(`${label}.choices has duplicate IDs: ${choice.id}`);
        choiceIds.add(choice.id);
      });
    }

    if (!Array.isArray(step?.acceptedChoiceIds) || step.acceptedChoiceIds.length === 0) {
      errors.push(`${label}.steps[${stepIndex}].acceptedChoiceIds must contain at least one choice ID`);
      return;
    }

    const stepChoiceIds = new Set((step.choices ?? []).map((choice) => choice?.id));
    const acceptedChoiceIds = new Set();
    step.acceptedChoiceIds.forEach((choiceId) => {
      if (!hasText(choiceId)) {
        errors.push(`${label}.steps[${stepIndex}].acceptedChoiceIds must contain choice IDs`);
        return;
      }
      if (acceptedChoiceIds.has(choiceId)) errors.push(`${label}.steps[${stepIndex}].acceptedChoiceIds has duplicate IDs: ${choiceId}`);
      acceptedChoiceIds.add(choiceId);
      if (!stepChoiceIds.has(choiceId)) {
        errors.push(`${label}.steps[${stepIndex}] references an unknown accepted choice: ${choiceId}`);
        return;
      }
      const choice = step.choices.find((candidate) => candidate?.id === choiceId);
      if (!hasText(choice?.reply)) errors.push(`${label}.steps[${stepIndex}].choices reply is required for accepted choice: ${choiceId}`);
    });
  });
}

export function validateProblems(entries, { expectedTypes = problemTypes } = {}) {
  const errors = [];
  if (!Array.isArray(entries)) return { valid: false, errors: ['Problems must be an array'] };
  duplicateIds(entries, 'Problems', errors);

  entries.forEach((problem, index) => {
    const label = `Problem[${index}]`;
    if (!isRecord(problem) || !hasText(problem.id)) {
      errors.push(`${label}.id is required`);
      return;
    }
    if (!expectedTypes.has(problem.type)) {
      errors.push(`${label}.type is invalid: ${problem.type}`);
      return;
    }
    if (problem.type === 'word-order') validateWordOrder(problem, label, errors);
    if (problem.type === 'mark-parts') validateMarkParts(problem, label, errors);
    if (problem.type === 'grammar-classifier') validateClassifier(problem, label, errors);
    if (problem.type === 'sentence-transformer') validateTransformer(problem, label, errors);
    if (problem.type === 'sentence-pattern-diagram') validateSentencePatternDiagram(problem, label, errors);
    if (problem.type === 'modifier-connection-viewer') validateModifierConnectionViewer(problem, label, errors);
    if (problem.type === 'sentence-comparison') validateSentenceComparison(problem, label, errors);
    if (problem.type === 'error-corrector') validateErrorCorrector(problem, label, errors);
    if (problem.type === 'context-grammar') validateContextGrammar(problem, label, errors);
    if (problem.type === 'sentence-generator') validateSentenceGenerator(problem, label, errors);
  });

  return { valid: errors.length === 0, errors };
}

export function validateDemoRegistry(registry, problemRegistry) {
  const errors = [];
  if (!isRecord(registry)) return { valid: false, errors: ['Demo registry must be an object'] };
  for (const [type, entry] of Object.entries(registry)) {
    if (!isRecord(entry) || typeof entry.mount !== 'function' || !hasText(entry.demoProblemId)) {
      errors.push(`Demo registry entry ${type} needs mount and demoProblemId`);
      continue;
    }
    const problem = problemRegistry?.[entry.demoProblemId];
    if (!problem) errors.push(`Demo registry entry ${type} references an unknown problem: ${entry.demoProblemId}`);
    else if (problem.type !== type) errors.push(`Demo registry entry ${type} has mismatched problem type: ${problem.type}`);
  }
  return { valid: errors.length === 0, errors };
}
