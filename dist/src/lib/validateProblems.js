const problemTypes = new Set(['word-order', 'mark-parts', 'grammar-classifier', 'sentence-transformer']);
const transformerControlNames = new Set(['subject', 'tense', 'negative']);
const supportedTenses = new Set(['present', 'past']);

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
  if (!Array.isArray(problem.answer) || problem.answer.length === 0) {
    errors.push(`${label}.answer must contain word IDs`);
  } else {
    const wordIds = new Set((problem.words ?? []).map((word) => word?.id));
    problem.answer.forEach((id) => {
      if (!wordIds.has(id)) errors.push(`${label}.answer references an unknown word ID: ${id}`);
    });
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

function validateTransformer(problem, label, errors) {
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
        if (name === 'tense' && !supportedTenses.has(option.value)) {
          errors.push(`${label}.controls.tense has unsupported value: ${option.value}`);
        }
        if (name === 'negative' && typeof option.value !== 'boolean') {
          errors.push(`${label}.controls.negative values must be boolean`);
        }
      });
    }
  }

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

  const model = problem.sentenceModel;
  if (!isRecord(model) || !isRecord(model.subjects) || !isRecord(model.verb) || !hasText(model.object)) {
    errors.push(`${label}.sentenceModel must have subjects, verb, and object`);
  } else {
    for (const [subjectId, subject] of Object.entries(model.subjects)) {
      if (!isRecord(subject) || !hasText(subject.label) || !['singular', 'plural'].includes(subject.number)) {
        errors.push(`${label}.sentenceModel.subjects.${subjectId} is invalid`);
      }
    }
    if (!hasText(model.verb.base) || !hasText(model.verb.past)) errors.push(`${label}.sentenceModel.verb needs base and past`);
    if (model.punctuation !== undefined && !hasText(model.punctuation)) errors.push(`${label}.sentenceModel.punctuation is invalid`);
    const subjectOptions = problem.controls?.subject ?? [];
    subjectOptions.forEach((option) => {
      if (!model.subjects[option.value]) errors.push(`${label}.sentenceModel has no subject for ${option.value}`);
    });
  }
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
