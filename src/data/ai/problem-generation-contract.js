import {
  createProblemGenerationContract,
  problemGenerationActionValues,
  problemGenerationAlignmentFields,
  problemGenerationFieldDefinitions,
  problemGenerationMaterialPlanRefFields,
  problemGenerationSourceEvidenceRefFields,
  problemGenerationTopLevelFields,
  problemGenerationVersion,
} from './problem-generation-schema.js';
import { problemGenerationFixtures } from './problem-generation-fixtures.js';

export {
  problemGenerationActionValues,
  problemGenerationAlignmentFields,
  problemGenerationFieldDefinitions,
  problemGenerationMaterialPlanRefFields,
  problemGenerationSourceEvidenceRefFields,
  problemGenerationTopLevelFields,
  problemGenerationVersion,
};

export const problemGenerationContract = createProblemGenerationContract(problemGenerationFixtures[0]);
