import { getGrammarStateMode, SUPPORTED_MODALS, SUPPORTED_TENSES, SUPPORTED_VOICES } from './grammar-state.js';

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

function sentenceCase(label) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getBeForm(tense, number) {
  if (tense === 'present') return number === 'singular' ? 'is' : 'are';
  return number === 'singular' ? 'was' : 'were';
}

function generateRoleBasedSentence({ tense, modal, voice, negative }, model) {
  if (modal !== undefined || !SUPPORTED_VOICES.includes(voice) || !SUPPORTED_TENSES.has(tense) || negative !== false) {
    throw new Error('Unsupported sentence state');
  }
  const agent = model.roles?.agent;
  const patient = model.roles?.patient;
  const verb = model.verb;
  const punctuation = model.punctuation ?? '.';
  if (
    !agent || !patient || !verb ||
    typeof agent.label !== 'string' || !agent.label.trim() ||
    typeof patient.label !== 'string' || !patient.label.trim() ||
    !['singular', 'plural'].includes(agent.number) ||
    !['singular', 'plural'].includes(patient.number) ||
    typeof verb.base !== 'string' || !verb.base.trim() ||
    typeof verb.past !== 'string' || !verb.past.trim() ||
    typeof verb.pastParticiple !== 'string' || !verb.pastParticiple.trim() ||
    typeof punctuation !== 'string'
  ) {
    throw new Error('Unsupported sentence state');
  }

  const activeVerb = tense === 'present'
    ? presentForm(verb, agent.number)
    : verb.past;
  if (voice === 'active') {
    return `${sentenceCase(agent.label)} ${activeVerb} ${patient.label}${punctuation}`;
  }
  return `${sentenceCase(patient.label)} ${getBeForm(tense, patient.number)} ${verb.pastParticiple} by ${agent.label}${punctuation}`;
}

export function generateSentence(
  { subject = 'he', tense, modal, voice, negative = false } = {},
  sentenceModel = defaultSentenceModel,
) {
  const model = sentenceModel ?? defaultSentenceModel;
  if (model.roles) {
    const resolvedTense = tense ?? (voice === undefined ? 'present' : undefined);
    return generateRoleBasedSentence({ tense: resolvedTense, modal, voice, negative }, model);
  }
  if (voice !== undefined) throw new Error('Unsupported sentence state');
  const subjectData = model.subjects?.[subject];
  const verb = model.verb;

  if (!subjectData || !verb?.base || typeof model.object !== 'string') {
    throw new Error('Unsupported sentence state');
  }
  const mode = getGrammarStateMode({ tense, modal });
  if (mode === 'invalid') throw new Error('Unsupported sentence state');
  const punctuation = model.punctuation ?? '.';
  if (typeof punctuation !== 'string') throw new Error('Unsupported sentence state');

  if (mode === 'modal') {
    if (!SUPPORTED_MODALS.has(modal) || typeof negative !== 'boolean') {
      throw new Error('Unsupported sentence state');
    }
    const modalText = negative && modal === 'can' ? 'cannot' : negative ? `${modal} not` : modal;
    return `${subjectData.label} ${modalText} ${verb.base} ${model.object}${punctuation}`;
  }

  const resolvedTense = tense ?? 'present';
  if (!SUPPORTED_TENSES.has(resolvedTense) || !verb?.past || typeof negative !== 'boolean') {
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
