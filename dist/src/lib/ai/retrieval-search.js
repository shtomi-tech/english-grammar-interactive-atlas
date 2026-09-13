import {
  retrievalDefaultLimit,
  validateRetrievalQuery,
} from '../../data/ai/retrieval-query-schema.js';

export const retrievalScoringWeights = Object.freeze({
  learningIntent: 8,
  preferredTag: 5,
  includeTerm: 2,
  interactionType: 3,
  avoidTag: -10,
  negativeRequirement: -10,
});

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(values) {
  return [...new Set(values)];
}

function hasValue(values, expected) {
  return values.includes(expected);
}

function getInteractionTypes(document) {
  if (document.kind === 'interaction') return document.interactionType ?? [];
  if (document.kind === 'problem') return document.type ? [document.type] : [];
  if (document.kind === 'lesson') return document.relations?.interactionTypes ?? [];
  return [];
}

function getPositiveTags(document) {
  return document.positiveTags ?? document.tags ?? [];
}

function getNegativeTags(document) {
  return document.negativeTags ?? [];
}

function preferredTagField(document, tag) {
  if (hasValue(document.learningIntents ?? [], tag)) return 'learningIntents';
  if (hasValue(document.bestFor ?? [], tag)) return 'bestFor';
  return 'tags';
}

function scoreDocument(document, query) {
  let score = 0;
  const reasons = [];
  const positiveTags = getPositiveTags(document);
  const negativeTags = getNegativeTags(document);
  const searchText = normalizeText(document.searchText);
  const interactionTypes = getInteractionTypes(document);

  unique(query.learningIntents ?? []).forEach((intent) => {
    if (hasValue(negativeTags, intent)) {
      score += retrievalScoringWeights.negativeRequirement;
      reasons.push({ field: 'negativeTags', value: intent, score: retrievalScoringWeights.negativeRequirement });
    } else if (hasValue(document.learningIntents ?? [], intent)) {
      score += retrievalScoringWeights.learningIntent;
      reasons.push({ field: 'learningIntents', value: intent, score: retrievalScoringWeights.learningIntent });
    }
  });

  unique(query.preferredTags ?? []).forEach((tag) => {
    if (hasValue(negativeTags, tag)) {
      score += retrievalScoringWeights.negativeRequirement;
      reasons.push({ field: 'negativeTags', value: tag, score: retrievalScoringWeights.negativeRequirement });
    } else if (hasValue(positiveTags, tag)) {
      score += retrievalScoringWeights.preferredTag;
      reasons.push({ field: preferredTagField(document, tag), value: tag, score: retrievalScoringWeights.preferredTag });
    }
  });

  unique(query.includeTerms ?? []).forEach((term) => {
    const normalizedTerm = normalizeText(term);
    if (normalizedTerm && searchText.includes(normalizedTerm)) {
      score += retrievalScoringWeights.includeTerm;
      reasons.push({ field: 'searchText', value: term, score: retrievalScoringWeights.includeTerm });
    }
  });

  unique(query.interactionTypes ?? []).forEach((interactionType) => {
    if (hasValue(interactionTypes, interactionType)) {
      score += retrievalScoringWeights.interactionType;
      reasons.push({ field: 'interactionType', value: interactionType, score: retrievalScoringWeights.interactionType });
    }
  });

  unique(query.avoidTags ?? []).forEach((tag) => {
    if (hasValue(positiveTags, tag)) {
      score += retrievalScoringWeights.avoidTag;
      reasons.push({ field: 'avoidTags', value: tag, score: retrievalScoringWeights.avoidTag });
    }
  });

  if (reasons.length === 0) reasons.push({ field: 'kind', value: document.kind, score: 0 });
  return { score, reasons };
}

export function searchRetrievalIndex(index, query) {
  const validation = validateRetrievalQuery(query);
  if (!validation.valid) throw new TypeError(`Invalid retrieval query: ${validation.errors.join('; ')}`);
  if (!index || typeof index !== 'object' || !Array.isArray(index.documents)) {
    throw new TypeError('Retrieval index must contain a documents array');
  }

  const kinds = query.kinds ?? [];
  const results = index.documents
    .map((document, originalIndex) => ({ document, originalIndex }))
    .filter(({ document }) => kinds.length === 0 || kinds.includes(document.kind))
    .map(({ document, originalIndex }) => {
      const { score, reasons } = scoreDocument(document, query);
      return {
        kind: document.kind,
        id: document.id,
        title: document.title,
        score,
        reasons,
        canonicalRef: structuredClone(document.canonicalRef),
        originalIndex,
      };
    })
    .sort((left, right) => right.score - left.score || left.originalIndex - right.originalIndex)
    .slice(0, query.limit ?? retrievalDefaultLimit)
    .map(({ originalIndex, ...result }) => result);

  return results;
}
