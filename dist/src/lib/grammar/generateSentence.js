const subjects = {
  he: { label: 'He', number: 'singular' },
  they: { label: 'They', number: 'plural' },
};

const verbs = {
  play: { base: 'play', past: 'played', object: 'tennis' },
};

function presentForm(verb, number) {
  return number === 'singular' ? `${verb}s` : verb;
}

export function generateSentence({ subject = 'he', verb = 'play', tense = 'present', negative = false }) {
  const subjectData = subjects[subject];
  const verbData = verbs[verb];

  if (!subjectData || !verbData) {
    throw new Error('Unsupported sentence state');
  }

  if (tense === 'past') {
    return negative
      ? `${subjectData.label} did not ${verbData.base} ${verbData.object}.`
      : `${subjectData.label} ${verbData.past} ${verbData.object}.`;
  }

  if (negative) {
    const auxiliary = subjectData.number === 'singular' ? 'does' : 'do';
    return `${subjectData.label} ${auxiliary} not ${verbData.base} ${verbData.object}.`;
  }

  return `${subjectData.label} ${presentForm(verbData.base, subjectData.number)} ${verbData.object}.`;
}
