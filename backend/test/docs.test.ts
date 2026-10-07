import SwaggerParser from '@apidevtools/swagger-parser';
import pino from 'pino';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { isDocsEnabled, parseEnv } from '../src/config/env.js';
import { buildOpenApiDocument } from '../src/infrastructure/http/docs/openapi.js';

const FRONTEND_URL = 'http://localhost:8080';
const logger = pino({ level: 'silent' });

const buildApp = (docsEnabled: boolean) =>
  createApp({
    frontendUrl: FRONTEND_URL,
    isDbUp: () => true,
    logger,
    docs: { enabled: docsEnabled, port: 4000 },
  });

const baseEnv = {
  PORT: '4000',
  MONGO_URI: 'mongodb://localhost:27017/proshop',
  FRONTEND_URL,
};

describe('documento OpenAPI', () => {
  it('se genera sin errores y es un OpenAPI 3 válido', async () => {
    const document = buildOpenApiDocument(4000);

    expect(document.openapi).toMatch(/^3\./);
    expect(document.info.title).toBe('Proshop API');
    expect(document.servers).toEqual([{ url: 'http://localhost:4000' }]);
    await expect(SwaggerParser.validate(structuredClone(document) as never)).resolves.toBeDefined();
  });

  it('documenta GET /health bajo el tag Sistema', () => {
    const health = buildOpenApiDocument(4000).paths?.['/health']?.get;

    expect(health?.tags).toEqual(['Sistema']);
    expect(Object.keys(health?.responses ?? {})).toEqual(
      expect.arrayContaining(['200', '503', '500']),
    );
  });

  it('ErrorResponse aparece una sola vez en components y las rutas lo referencian', () => {
    const document = buildOpenApiDocument(4000);
    const schemaNames = Object.keys(document.components?.schemas ?? {});
    const json = JSON.stringify(document.paths);

    expect(schemaNames.filter((name) => name === 'ErrorResponse')).toHaveLength(1);
    expect(json).toContain('"$ref":"#/components/schemas/ErrorResponse"');
  });
});

describe('rutas de documentación', () => {
  it('GET /api/docs.json devuelve el documento', async () => {
    const res = await request(buildApp(true)).get('/api/docs.json');

    expect(res.status).toBe(200);
    expect(res.body.info.title).toBe('Proshop API');
  });

  it('GET /api/docs sirve Swagger UI con CSP relajada', async () => {
    const res = await request(buildApp(true)).get('/api/docs/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
    expect(res.headers['content-security-policy']).toContain("'unsafe-inline'");
  });

  it('el resto de la API mantiene la CSP estricta de helmet', async () => {
    const res = await request(buildApp(true)).get('/health');

    expect(res.headers['content-security-policy']).toContain("script-src 'self';");
    expect(res.headers['content-security-policy']).not.toContain("'unsafe-inline' 'self'");
    expect(res.headers['content-security-policy']).toContain('upgrade-insecure-requests');
  });

  it('con NODE_ENV=production y sin ENABLE_DOCS, /api/docs responde 404', async () => {
    const env = parseEnv({ ...baseEnv, NODE_ENV: 'production' });

    expect(isDocsEnabled(env)).toBe(false);
    const res = await request(buildApp(isDocsEnabled(env))).get('/api/docs');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('ENABLE_DOCS=true habilita la documentación en producción', () => {
    expect(isDocsEnabled(parseEnv({ ...baseEnv, NODE_ENV: 'production', ENABLE_DOCS: 'true' }))).toBe(true);
    expect(isDocsEnabled(parseEnv({ ...baseEnv, NODE_ENV: 'production', ENABLE_DOCS: 'false' }))).toBe(false);
    expect(isDocsEnabled(parseEnv({ ...baseEnv, NODE_ENV: 'development' }))).toBe(true);
  });
});
