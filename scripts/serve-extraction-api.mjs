import { createServer } from 'node:http';
import { createExtractionHandler } from '../server/http/extract-learning-requirements-handler.js';
import { createOpenAiLearningRequirementsAdapter } from '../server/openai/openai-learning-requirements-adapter.js';

const extractionPort = Number.parseInt(process.env.EXTRACTION_API_PORT ?? '4180', 10);
const server = createServer(createExtractionHandler({
  adapter: createOpenAiLearningRequirementsAdapter(),
  allowedOrigin: process.env.APP_ORIGIN ?? null,
}));

server.listen(extractionPort, '127.0.0.1', () => {
  console.log(`Extraction API listening on http://127.0.0.1:${extractionPort}`);
});
