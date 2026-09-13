import { lessonGenerationFixtures } from './lesson-generation-fixtures.js';
import {
  lessonGenerationAlignmentFields,
  lessonGenerationFieldDefinitions,
  lessonGenerationMaterialPlanRefFields,
  lessonGenerationProblemGenerationRefFields,
  lessonGenerationStepMappingFields,
  lessonGenerationTopLevelFields,
  lessonGenerationVersion,
} from './lesson-generation-schema.js';

export const lessonGenerationContract = Object.freeze({
  version: lessonGenerationVersion,
  requiredFields: [...lessonGenerationTopLevelFields],
  optionalFields: [],
  fieldDefinitions: lessonGenerationFieldDefinitions,
  materialPlanRefFields: [...lessonGenerationMaterialPlanRefFields],
  problemGenerationRefFields: [...lessonGenerationProblemGenerationRefFields],
  alignmentFields: [...lessonGenerationAlignmentFields],
  stepMappingFields: [...lessonGenerationStepMappingFields],
  example: lessonGenerationFixtures[0],
});
