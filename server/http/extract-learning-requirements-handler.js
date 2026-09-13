import {
  runLearningRequirementsExtraction,
  validateExtractionConstraints,
} from '../../src/lib/ai/learning-requirements-extraction.js';
import { validateGrammarReference } from '../../src/lib/validateGrammarReference.js';

export const EXTRACTION_BODY_LIMIT_BYTES = 100 * 1024;

class RequestBodyError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeMessage(message) {
  return String(message)
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, '[redacted]')
    .replace(/Bearer\s+[A-Za-z0-9._-]{8,}/gi, 'Bearer [redacted]');
}

function jsonResponse(response, status, body, origin) {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 'no-store');
  response.setHeader('vary', 'Origin');
  if (origin) response.setHeader('access-control-allow-origin', origin);
  response.end(JSON.stringify(body));
}

function errorCode(message) {
  if (message.includes('adapter failed:')) return 'provider_error';
  if (message.includes('sourceIdentity:')) return 'source_identity_invalid';
  if (message.includes('sourceTraceability:')) return 'source_traceability_invalid';
  if (message.includes('constraintFidelity:')) return 'constraint_fidelity_invalid';
  if (message.includes('learningRequirements:')) return 'learning_requirements_invalid';
  return 'invalid_request';
}

function readJsonBody(request, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    request.on('data', (chunk) => {
      if (settled) return;
      size += Buffer.byteLength(chunk);
      if (size > limitBytes) {
        fail(new RequestBodyError('Request body exceeds the configured limit', 413));
        return;
      }
      chunks.push(chunk);
    });
    request.on('aborted', () => fail(new RequestBodyError('Request body was aborted', 400)));
    request.on('error', () => fail(new RequestBodyError('Request body could not be read', 400)));
    request.on('end', () => {
      if (settled) return;
      settled = true;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new RequestBodyError('Request body must be valid JSON', 400));
      }
    });
  });
}

export function createExtractionHandler({
  adapter,
  allowedOrigin = process.env.APP_ORIGIN ?? null,
  bodyLimitBytes = EXTRACTION_BODY_LIMIT_BYTES,
} = {}) {
  return async function extractionHandler(request, response) {
    const requestOrigin = typeof request.headers.origin === 'string' ? request.headers.origin : null;
    const originAllowed = !requestOrigin || (typeof allowedOrigin === 'string' && requestOrigin === allowedOrigin);
    if (requestOrigin && !originAllowed) {
      jsonResponse(response, 403, { valid: false, errors: [{ code: 'cors_origin_denied', message: 'Origin is not allowed' }] });
      return;
    }
    if (requestOrigin) {
      response.setHeader('access-control-allow-origin', requestOrigin);
      response.setHeader('access-control-allow-methods', 'POST, OPTIONS');
      response.setHeader('access-control-allow-headers', 'content-type');
      response.setHeader('access-control-max-age', '600');
    }
    if (request.method === 'OPTIONS') {
      response.statusCode = 204;
      response.setHeader('vary', 'Origin');
      response.end();
      return;
    }
    if (request.method !== 'POST') {
      jsonResponse(response, 405, { valid: false, errors: [{ code: 'method_not_allowed', message: 'Only POST and OPTIONS are supported' }] }, requestOrigin);
      return;
    }
    try {
      const body = await readJsonBody(request, bodyLimitBytes);
      if (!isObject(body) || !isObject(body.grammarReference)) {
        throw new RequestBodyError('grammarReference must be an object');
      }
      const referenceValidation = validateGrammarReference(body.grammarReference);
      if (!referenceValidation.valid) {
        throw new RequestBodyError(`Invalid Grammar Reference: ${referenceValidation.errors.join('; ')}`);
      }
      const constraintsValidation = validateExtractionConstraints(body.constraints);
      if (!constraintsValidation.valid) {
        throw new RequestBodyError(`Invalid extraction constraints: ${constraintsValidation.errors.join('; ')}`);
      }
      const result = await runLearningRequirementsExtraction({
        grammarReference: body.grammarReference,
        constraints: body.constraints,
        adapter,
        requireQuote: true,
        requireConstraintFidelity: true,
      });
      if (!result.valid) {
        const errors = result.errors.map((message) => ({ code: errorCode(message), message: safeMessage(message) }));
        const status = errors.some((error) => error.code === 'provider_error') ? 502 : 422;
        jsonResponse(response, status, { valid: false, errors }, requestOrigin);
        return;
      }
      jsonResponse(response, 200, { valid: true, learningRequirements: result.learningRequirements }, requestOrigin);
    } catch (error) {
      const status = error?.status ?? 400;
      jsonResponse(response, status, {
        valid: false,
        errors: [{ code: status === 413 ? 'body_too_large' : 'invalid_request', message: safeMessage(error.message) }],
      }, requestOrigin);
    }
  };
}
