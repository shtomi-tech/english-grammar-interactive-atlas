export const CONTROL_LABELS = Object.freeze({
  subject: 'Subject',
  tense: 'Tense',
  modal: 'Modal',
  negative: 'Polarity',
});

export function getControlLabel(name) {
  return CONTROL_LABELS[name] ?? name;
}
