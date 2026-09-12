const defaultSentenceModel = {
  subjects: {
    he: { label: 'He', number: 'singular' },
    they: { label: 'They', number: 'plural' },
  },
  verb: { base: 'play', past: 'played' },
  object: 'tennis',
  punctuation: '.',
};

const supportedModals = new Set(['can', 'could', 'should', 'must']);

function presentForm(verb, number) {
  if (verb.present) return verb.present;
  return number === 'singular' ? `${verb.base}s` : verb.base;
}

export function generateSentence(
  { subject = 'he', tense, modal, negative = false } = {},
  sentenceModel = defaultSentenceModel,
) {
  const model = sentenceModel ?? defaultSentenceModel;
  const subjectData = model.subjects?.[subject];
  const verb = model.verb;

  if (!subjectData || !verb?.base || !verb?.past || typeof model.object !== 'string') {
    throw new Error('Unsupported sentence state');
  }
  const punctuation = model.punctuation ?? '.';
  if (typeof punctuation !== 'string') throw new Error('Unsupported sentence state');

  if (modal !== undefined) {
    if (tense !== undefined || !supportedModals.has(modal) || typeof negative !== 'boolean') {
      throw new Error('Unsupported sentence state');
    }
    const modalText = negative && modal === 'can' ? 'cannot' : negative ? `${modal} not` : modal;
    return `${subjectData.label} ${modalText} ${verb.base} ${model.object}${punctuation}`;
  }

  const resolvedTense = tense ?? 'present';
  if (!['present', 'past'].includes(resolvedTense) || typeof negative !== 'boolean') {
    throw new Error('Unsupported sentence state');
  }

  if (resolvedTense === 'past') {
    return negative
      ? `${subjectData.label} did not ${verb.base} ${model.object}${punctuation}`
      : `${subjectData.label} ${verb.past} ${model.object}${punctuation}`;
  }

  if (negative) {
    const auxiliary = subjectData.number === 'singular' ? 'does' : 'do';
    return `${subjectData.label} ${auxiliary} not ${verb.base} ${model.object}${punctuation}`;
  }

  return `${subjectData.label} ${presentForm(verb, subjectData.number)} ${model.object}${punctuation}`;
}
