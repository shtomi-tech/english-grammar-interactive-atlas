const defaultSentenceModel = {
  subjects: {
    he: { label: 'He', number: 'singular' },
    they: { label: 'They', number: 'plural' },
  },
  verb: { base: 'play', past: 'played' },
  object: 'tennis',
  punctuation: '.',
};

function presentForm(verb, number) {
  if (verb.present) return verb.present;
  return number === 'singular' ? `${verb.base}s` : verb.base;
}

export function generateSentence(
  { subject = 'he', tense = 'present', negative = false } = {},
  sentenceModel = defaultSentenceModel,
) {
  const model = sentenceModel ?? defaultSentenceModel;
  const subjectData = model.subjects?.[subject];
  const verb = model.verb;

  if (!subjectData || !verb?.base || !verb?.past || typeof model.object !== 'string') {
    throw new Error('Unsupported sentence state');
  }
  if (!['present', 'past'].includes(tense) || typeof negative !== 'boolean') {
    throw new Error('Unsupported sentence state');
  }

  const punctuation = model.punctuation ?? '.';
  if (typeof punctuation !== 'string') throw new Error('Unsupported sentence state');

  if (tense === 'past') {
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
