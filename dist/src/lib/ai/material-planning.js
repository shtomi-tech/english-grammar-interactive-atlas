import {
  learningRequirementDesiredOutcomes,
} from '../../data/ai/learning-requirements-schema.js';
import { outcomeRetrievalProfiles } from '../../data/ai/outcome-retrieval-profiles.js';
import { isKnownLearningIntent } from '../../data/ai/schema.js';
import { materialPlanVersion } from '../../data/ai/material-plan-schema.js';
import { searchRetrievalIndex } from './retrieval-search.js';

function unique(values) {
  return [...new Set(values)];
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function requireLearningPoint(learningPoint) {
  if (!learningPoint || typeof learningPoint !== 'object' || Array.isArray(learningPoint)) {
    throw new TypeError('Learning Point must be an object');
  }
  if (!Array.isArray(learningPoint.desiredOutcomes) || learningPoint.desiredOutcomes.length === 0) {
    throw new TypeError('Learning Point must contain desiredOutcomes');
  }
}

export function validateOutcomeRetrievalProfiles(profiles = outcomeRetrievalProfiles) {
  const errors = [];
  if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) {
    return { valid: false, errors: ['Outcome retrieval profiles must be an object'] };
  }
  Object.keys(profiles)
    .filter((outcome) => !learningRequirementDesiredOutcomes.includes(outcome))
    .forEach((outcome) => errors.push(`Unknown desiredOutcome profile: ${outcome}`));
  learningRequirementDesiredOutcomes.forEach((outcome) => {
    const profile = profiles[outcome];
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      errors.push(`Missing outcome retrieval profile: ${outcome}`);
      return;
    }
    Object.keys(profile)
      .filter((field) => field !== 'learningIntents')
      .forEach((field) => errors.push(`Unknown outcome retrieval profile field: ${outcome}.${field}`));
    if (!Array.isArray(profile.learningIntents) || profile.learningIntents.length === 0) {
      errors.push(`${outcome}.learningIntents must be a non-empty array`);
      return;
    }
    if (unique(profile.learningIntents).length !== profile.learningIntents.length) {
      errors.push(`${outcome}.learningIntents must not contain duplicates`);
    }
    profile.learningIntents.forEach((intent) => {
      if (!isKnownLearningIntent(intent)) errors.push(`${outcome}.learningIntents contains an unknown intent: ${intent}`);
    });
  });
  return { valid: errors.length === 0, errors };
}

export function createInteractionQueryForLearningPoint(learningPoint, { limit = 5, includeTerms = true } = {}) {
  requireLearningPoint(learningPoint);
  const learningIntents = unique(learningPoint.desiredOutcomes.flatMap((outcome) => {
    const profile = outcomeRetrievalProfiles[outcome];
    if (!profile) throw new TypeError(`Unknown desiredOutcome: ${outcome}`);
    return profile.learningIntents;
  }));
  const query = {
    kinds: ['interaction'],
    learningIntents,
    limit,
  };
  if (includeTerms && typeof learningPoint.concept === 'string' && learningPoint.concept.trim() !== '') {
    query.includeTerms = [learningPoint.concept];
  }
  return query;
}

export function captureRetrievalSelection(index, query, canonicalRef) {
  const results = searchRetrievalIndex(index, query);
  const resultIndex = results.findIndex((result) => sameValue(result.canonicalRef, canonicalRef));
  if (resultIndex < 0) {
    throw new RangeError(`Retrieval selection was not found: ${JSON.stringify(canonicalRef)}`);
  }
  const result = results[resultIndex];
  return {
    query: structuredClone(query),
    selected: {
      canonicalRef: structuredClone(result.canonicalRef),
      rank: resultIndex + 1,
      score: result.score,
      reasons: structuredClone(result.reasons),
    },
  };
}

function getInteractionRecord(index, canonicalRef) {
  return index.interactions?.find((record) => record.id === canonicalRef.id) ?? null;
}

export function hasProblemContentMatch(result) {
  return Boolean(result?.reasons?.some((reason) => reason.field === 'searchText'));
}

export function createMaterialPlan({
  learningRequirements,
  retrievalIndex,
  id = 'MATPLAN-GENERATED',
  interactionLimit = 5,
  problemLimit = 5,
} = {}) {
  if (!learningRequirements || !Array.isArray(learningRequirements.learningPoints)) {
    throw new TypeError('Material Plan requires Learning Requirements with learningPoints');
  }
  if (!retrievalIndex || !Array.isArray(retrievalIndex.documents)) {
    throw new TypeError('Material Plan requires a retrieval index');
  }

  const items = learningRequirements.learningPoints.map((learningPoint, index) => {
    const interactionQuery = createInteractionQueryForLearningPoint(learningPoint, { limit: interactionLimit });
    const interactionResults = searchRetrievalIndex(retrievalIndex, interactionQuery);
    const implementedInteraction = interactionResults.find((result) => {
      const record = getInteractionRecord(retrievalIndex, result.canonicalRef);
      return Array.isArray(record?.demoTypes) && record.demoTypes.length === 1;
    });
    const selectedInteraction = implementedInteraction ?? interactionResults[0];
    const interactionSelection = { query: interactionQuery };
    if (selectedInteraction) {
      Object.assign(interactionSelection, captureRetrievalSelection(
        retrievalIndex,
        interactionQuery,
        selectedInteraction.canonicalRef,
      ));
    }

    let problemDecision;
    if (!selectedInteraction || !implementedInteraction) {
      problemDecision = {
        action: 'unresolved',
        reason: 'No implemented interaction satisfies this learning point.',
      };
    } else {
      const interactionRecord = getInteractionRecord(retrievalIndex, implementedInteraction.canonicalRef);
      const demoType = interactionRecord.demoTypes[0];
      const problemQuery = {
        kinds: ['problem'],
        demoTypes: [demoType],
        includeTerms: [learningPoint.concept],
        limit: problemLimit,
      };
      const problemResults = searchRetrievalIndex(retrievalIndex, problemQuery);
      const reusableProblem = problemResults.find(hasProblemContentMatch);
      if (!reusableProblem) {
        problemDecision = {
          action: 'generate',
          reason: 'Existing problems do not cover the source-backed concept.',
        };
      } else {
        problemDecision = {
          action: 'reuse',
          problemSelection: captureRetrievalSelection(
            retrievalIndex,
            problemQuery,
            reusableProblem.canonicalRef,
          ),
        };
      }
    }

    return {
      id: `MPI-${String(index + 1).padStart(3, '0')}`,
      learningPointId: learningPoint.id,
      interactionSelection,
      problemDecision,
      rationale: '既存の検索可能な学習活動で、このLearning Pointを操作して確認する。',
    };
  });

  return {
    version: materialPlanVersion,
    id,
    learningRequirementsRef: {
      id: learningRequirements.id,
      version: learningRequirements.version,
    },
    items,
  };
}
