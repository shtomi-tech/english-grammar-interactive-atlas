export function getExamChoice(choices, choiceId) {
  if (!Array.isArray(choices)) return null;
  return choices.find((choice) => choice?.id === choiceId) ?? null;
}

export function isCorrectExamChoice(problem, choiceId) {
  return Boolean(
    problem
      && choiceId
      && problem.answerChoiceId === choiceId
      && getExamChoice(problem.choices, choiceId),
  );
}

export function evaluateExamChoice(problem, choiceId) {
  const selectedChoiceId = typeof choiceId === 'string' && choiceId.trim() ? choiceId : null;
  return {
    correct: isCorrectExamChoice(problem, selectedChoiceId),
    selectedChoiceId,
    answerChoiceId: problem?.answerChoiceId ?? null,
  };
}
