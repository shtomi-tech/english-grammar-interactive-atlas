import { learningIntentVocabulary } from '../../data/ai/schema.js';

const internalIdPattern = /^(?:[A-Z]+-\d{3}(?:-[A-Z0-9-]+)?|[a-z]+\d+|[a-z][a-z0-9]*(?:-[a-z0-9]+)*-\d+[a-z0-9-]*)$/;
const excludedSearchKeys = new Set([
  'id',
  'stepId',
  'problemId',
  'tokenId',
  'choiceId',
  'correctionId',
  'optionId',
  'sourceUrl',
  'repositoryUrl',
  'researchRefs',
  'researchStatus',
  'licenseStatus',
  'sourceType',
  'reusePolicy',
  'implementationDifficulty',
  'reusability',
]);

function uniqueStrings(values) {
  const seen = new Set();
  return values.filter((value) => {
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function collectStringValues(value, output, seen, key, excludedKeys) {
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text || excludedKeys.has(key) || internalIdPattern.test(text)) return;
    if (!seen.has(text)) {
      seen.add(text);
      output.push(text);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStringValues(item, output, seen, key, excludedKeys));
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.entries(value).forEach(([entryKey, entryValue]) => {
    collectStringValues(entryValue, output, seen, entryKey, excludedKeys);
  });
}

export function collectSearchStrings(value, { excludedKeys = excludedSearchKeys } = {}) {
  const output = [];
  collectStringValues(value, output, new Set(), '', excludedKeys);
  return output;
}

export function buildSearchText(...values) {
  return uniqueStrings(values.flatMap((value) => collectSearchStrings(value))).join('\n');
}

function uniqueIds(values) {
  return [...new Set(values)];
}

function buildProblemLessonRelations(lessons) {
  const lessonIdsByProblemId = new Map();
  lessons.forEach((lesson) => {
    lesson.steps.forEach((step) => {
      const lessonIds = lessonIdsByProblemId.get(step.problemId) ?? [];
      if (!lessonIds.includes(lesson.id)) lessonIds.push(lesson.id);
      lessonIdsByProblemId.set(step.problemId, lessonIds);
    });
  });
  return lessonIdsByProblemId;
}

function createInteractionRecords(interactions, problems, interactionRetrievalMetadata) {
  return interactions.map((interaction) => {
    const metadata = interactionRetrievalMetadata[interaction.id];
    const problemIds = problems
      .filter((problem) => problem.type === interaction.demoType)
      .map((problem) => problem.id);
    const tags = uniqueIds([
      ...(metadata?.learningIntents ?? []),
      ...(metadata?.bestFor ?? []),
      ...(metadata?.notBestFor ?? []),
    ]);
    const record = {
      kind: 'interaction',
      id: interaction.id,
      slug: interaction.slug,
      title: interaction.title,
      category: interaction.category,
      description: interaction.description,
      learningGoal: interaction.learningGoal,
      touchTarget: interaction.touchTarget,
      userAction: interaction.userAction,
      changingElement: interaction.changingElement,
      insight: interaction.insight,
      targetGrammar: [...interaction.targetGrammar],
      interactionType: [...interaction.interactionType],
      feedbackType: [...interaction.feedbackType],
      learningIntents: [...(metadata?.learningIntents ?? [])],
      bestFor: [...(metadata?.bestFor ?? [])],
      notBestFor: [...(metadata?.notBestFor ?? [])],
      tags,
      relations: { problemIds },
      searchText: buildSearchText(
        {
          slug: interaction.slug,
          title: interaction.title,
          category: interaction.category,
          description: interaction.description,
          learningGoal: interaction.learningGoal,
          touchTarget: interaction.touchTarget,
          userAction: interaction.userAction,
          changingElement: interaction.changingElement,
          insight: interaction.insight,
          targetGrammar: interaction.targetGrammar,
          interactionType: interaction.interactionType,
          feedbackType: interaction.feedbackType,
        },
        tags,
      ),
    };
    if (interaction.demoType) record.demoType = interaction.demoType;
    return record;
  });
}

function createProblemRecords(problems, interactions, lessonIdsByProblemId) {
  return problems.map((problem) => ({
    kind: 'problem',
    id: problem.id,
    title: problem.id,
    type: problem.type,
    tags: [problem.type],
    relations: {
      interactionIds: interactions
        .filter((interaction) => interaction.demoType === problem.type)
        .map((interaction) => interaction.id),
      lessonIds: [...(lessonIdsByProblemId.get(problem.id) ?? [])],
    },
    searchText: buildSearchText(problem),
  }));
}

function createLessonRecords(lessons) {
  return lessons.map((lesson) => {
    const problemIds = lesson.steps.map((step) => step.problemId);
    const interactionTypes = uniqueIds(lesson.steps.map((step) => step.interactionType));
    return {
      kind: 'lesson',
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      learningGoal: lesson.learningGoal,
      tags: uniqueIds(['lesson', lesson.slug, ...interactionTypes]),
      relations: { problemIds, interactionTypes },
      searchText: buildSearchText({
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        learningGoal: lesson.learningGoal,
        steps: lesson.steps,
      }),
    };
  });
}

function toDocument(record) {
  return {
    kind: record.kind,
    id: record.id,
    title: record.title,
    searchText: record.searchText,
    tags: [...record.tags],
    relations: structuredClone(record.relations),
  };
}

export function createAiRetrievalIndex({
  interactions = [],
  problems = [],
  lessons = [],
  interactionRetrievalMetadata = {},
}) {
  const interactionRecords = createInteractionRecords(interactions, problems, interactionRetrievalMetadata);
  const lessonIdsByProblemId = buildProblemLessonRelations(lessons);
  const problemRecords = createProblemRecords(problems, interactions, lessonIdsByProblemId);
  const lessonRecords = createLessonRecords(lessons);
  const documents = [...interactionRecords, ...problemRecords, ...lessonRecords].map(toDocument);

  return {
    version: '1',
    generatedFrom: {
      interactions: ['src/data/interactions.js', 'src/data/interactions-additional.js'],
      problems: 'src/data/problems/',
      lessons: 'src/data/lessons.js',
      retrievalMetadata: 'src/data/ai/interaction-retrieval.js',
    },
    metadata: {
      learningIntents: [...learningIntentVocabulary],
      counts: {
        interactions: interactionRecords.length,
        problems: problemRecords.length,
        lessons: lessonRecords.length,
        documents: documents.length,
      },
    },
    interactions: interactionRecords,
    problems: problemRecords,
    lessons: lessonRecords,
    documents,
  };
}
