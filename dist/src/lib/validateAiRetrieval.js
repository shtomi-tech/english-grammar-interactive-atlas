import { isKebabCaseTag, isKnownLearningIntent } from '../data/ai/schema.js';

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function unique(values) {
  return [...new Set(values)];
}

function validateRecordIds(records, expectedEntries, kind, errors) {
  if (!Array.isArray(records)) {
    errors.push(`AI ${kind} records must be an array`);
    return new Map();
  }
  const expectedIds = expectedEntries.map((entry) => entry.id);
  const actualIds = records.map((record) => record?.id);
  if (!sameValue(actualIds, expectedIds)) {
    errors.push(`AI ${kind} IDs must match canonical order`);
  }
  const byId = new Map();
  records.forEach((record) => {
    if (record?.id && !byId.has(record.id)) byId.set(record.id, record);
  });
  return byId;
}

function validateMetadata(interactions, metadata, errors) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    errors.push('Interaction retrieval metadata must be an object');
    return;
  }
  const interactionIds = new Set(interactions.map((interaction) => interaction.id));
  const metadataIds = Object.keys(metadata);
  interactions.forEach((interaction) => {
    if (!Object.prototype.hasOwnProperty.call(metadata, interaction.id)) {
      errors.push(`Missing interaction retrieval metadata: ${interaction.id}`);
    }
  });
  metadataIds
    .filter((id) => !interactionIds.has(id))
    .forEach((id) => errors.push(`Orphan interaction retrieval metadata: ${id}`));
  if (metadataIds.length !== interactions.length) {
    errors.push(`Interaction metadata count must equal ${interactions.length}`);
  }

  metadataIds.forEach((id) => {
    const entry = metadata[id];
    ['learningIntents', 'bestFor', 'notBestFor'].forEach((field) => {
      if (!Array.isArray(entry?.[field]) || entry[field].length === 0) {
        errors.push(`${id}.${field} must be a non-empty array`);
        return;
      }
      if (unique(entry[field]).length !== entry[field].length) {
        errors.push(`${id}.${field} must not contain duplicate tags`);
      }
      entry[field].forEach((tag) => {
        if (!isKebabCaseTag(tag)) errors.push(`${id}.${field} contains a non-kebab-case tag: ${tag}`);
      });
    });
    entry?.learningIntents?.forEach((intent) => {
      if (!isKnownLearningIntent(intent)) errors.push(`${id}.learningIntents contains an unknown intent: ${intent}`);
    });
  });
}

function validateInteractionRecords(interactions, problems, recordsById, metadata, errors) {
  interactions.forEach((interaction) => {
    const record = recordsById.get(interaction.id);
    if (!record) {
      errors.push(`Missing AI interaction record: ${interaction.id}`);
      return;
    }
    if (record.kind !== 'interaction') errors.push(`${interaction.id} must have kind interaction`);
    if (record.searchText?.trim() === '') errors.push(`${interaction.id}.searchText must not be empty`);
    const expectedMetadata = metadata[interaction.id];
    ['learningIntents', 'bestFor', 'notBestFor'].forEach((field) => {
      if (!sameValue(record[field], expectedMetadata?.[field] ?? [])) {
        errors.push(`${interaction.id}.${field} does not match retrieval metadata`);
      }
    });
    const expectedProblemIds = problems
      .filter((problem) => problem.type === interaction.demoType)
      .map((problem) => problem.id);
    if (!sameValue(record.relations?.problemIds, expectedProblemIds)) {
      errors.push(`${interaction.id}.relations.problemIds does not match problem types`);
    }
    if (interaction.demoType && expectedProblemIds.length === 0) {
      errors.push(`${interaction.id} has a demoType without matching problems`);
    }
  });
}

function validateProblemRecords(problems, interactions, lessons, recordsById, errors) {
  const lessonIdsByProblemId = new Map();
  lessons.forEach((lesson) => {
    lesson.steps.forEach((step) => {
      const lessonIds = lessonIdsByProblemId.get(step.problemId) ?? [];
      if (!lessonIds.includes(lesson.id)) lessonIds.push(lesson.id);
      lessonIdsByProblemId.set(step.problemId, lessonIds);
    });
  });
  problems.forEach((problem) => {
    const record = recordsById.get(problem.id);
    if (!record) {
      errors.push(`Missing AI problem record: ${problem.id}`);
      return;
    }
    if (record.kind !== 'problem') errors.push(`${problem.id} must have kind problem`);
    const expectedInteractionIds = interactions
      .filter((interaction) => interaction.demoType === problem.type)
      .map((interaction) => interaction.id);
    if (expectedInteractionIds.length !== 1) {
      errors.push(`${problem.id} must resolve to exactly one interaction`);
    }
    if (!sameValue(record.relations?.interactionIds, expectedInteractionIds)) {
      errors.push(`${problem.id}.relations.interactionIds does not match problem type`);
    }
    const expectedLessonIds = lessonIdsByProblemId.get(problem.id) ?? [];
    if (!sameValue(record.relations?.lessonIds, expectedLessonIds)) {
      errors.push(`${problem.id}.relations.lessonIds does not match lesson steps`);
    }
    if (record.searchText?.trim() === '') errors.push(`${problem.id}.searchText must not be empty`);
  });
}

function validateLessonRecords(lessons, problems, recordsById, errors) {
  const problemIds = new Set(problems.map((problem) => problem.id));
  lessons.forEach((lesson) => {
    const record = recordsById.get(lesson.id);
    if (!record) {
      errors.push(`Missing AI lesson record: ${lesson.id}`);
      return;
    }
    if (record.kind !== 'lesson') errors.push(`${lesson.id} must have kind lesson`);
    const expectedProblemIds = lesson.steps.map((step) => step.problemId);
    const expectedInteractionTypes = unique(lesson.steps.map((step) => step.interactionType));
    if (!sameValue(record.relations?.problemIds, expectedProblemIds)) {
      errors.push(`${lesson.id}.relations.problemIds does not match lesson steps`);
    }
    if (!sameValue(record.relations?.interactionTypes, expectedInteractionTypes)) {
      errors.push(`${lesson.id}.relations.interactionTypes does not match lesson steps`);
    }
    expectedProblemIds
      .filter((problemId) => !problemIds.has(problemId))
      .forEach((problemId) => errors.push(`${lesson.id} references unknown problem: ${problemId}`));
    if (record.searchText?.trim() === '') errors.push(`${lesson.id}.searchText must not be empty`);
  });
}

function validateDocuments(index, interactionRecords, problemRecords, lessonRecords, errors) {
  if (!Array.isArray(index.documents)) {
    errors.push('AI documents must be an array');
    return;
  }
  const expectedRecords = [...interactionRecords, ...problemRecords, ...lessonRecords];
  if (index.documents.length !== expectedRecords.length) {
    errors.push(`AI document count must equal ${expectedRecords.length}`);
  }
  const seen = new Set();
  index.documents.forEach((document) => {
    const key = `${document?.kind}:${document?.id}`;
    if (seen.has(key)) errors.push(`Duplicate AI document: ${key}`);
    seen.add(key);
    if (!document?.kind || !document?.id || !document?.title || !document?.searchText) {
      errors.push(`AI document is missing required fields: ${key}`);
    }
  });
  expectedRecords.forEach((record) => {
    const document = index.documents.find((entry) => entry.kind === record.kind && entry.id === record.id);
    if (!document) {
      errors.push(`Missing unified AI document: ${record.kind}:${record.id}`);
      return;
    }
    ['title', 'searchText', 'tags', 'relations'].forEach((field) => {
      if (!sameValue(document[field], record[field])) errors.push(`${record.kind}:${record.id}.${field} differs from record`);
    });
  });
}

export function validateAiRetrieval(
  index,
  {
    interactions = [],
    problems = [],
    lessons = [],
    interactionRetrievalMetadata = {},
  } = {},
) {
  const errors = [];
  if (!index || typeof index !== 'object' || Array.isArray(index)) {
    return { valid: false, errors: ['AI retrieval index must be an object'] };
  }
  if (index.generatedAt !== undefined) errors.push('AI retrieval index must be deterministic and omit generatedAt');
  validateMetadata(interactions, interactionRetrievalMetadata, errors);

  const interactionRecords = Array.isArray(index.interactions) ? index.interactions : [];
  const problemRecords = Array.isArray(index.problems) ? index.problems : [];
  const lessonRecords = Array.isArray(index.lessons) ? index.lessons : [];
  const interactionRecordsById = validateRecordIds(interactionRecords, interactions, 'interaction', errors);
  const problemRecordsById = validateRecordIds(problemRecords, problems, 'problem', errors);
  const lessonRecordsById = validateRecordIds(lessonRecords, lessons, 'lesson', errors);

  validateInteractionRecords(interactions, problems, interactionRecordsById, interactionRetrievalMetadata, errors);
  validateProblemRecords(problems, interactions, lessons, problemRecordsById, errors);
  validateLessonRecords(lessons, problems, lessonRecordsById, errors);
  validateDocuments(index, interactionRecords, problemRecords, lessonRecords, errors);

  const expectedCounts = {
    interactions: interactions.length,
    problems: problems.length,
    lessons: lessons.length,
    documents: interactions.length + problems.length + lessons.length,
  };
  if (!sameValue(index.metadata?.counts, expectedCounts)) {
    errors.push('AI metadata counts do not match generated records');
  }
  return { valid: errors.length === 0, errors };
}
