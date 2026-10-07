import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import pino from 'pino';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { loadEnv, parseEnv } from '../src/config/env.js';
import {
  connectMongo,
  disconnectMongo,
  isMongoUp,
} from '../src/infrastructure/persistence/mongo/connection.js';

const FRONTEND_URL = 'http://localhost:8080';
const logger = pino({ level: 'silent' });

const testRouter = Router();
testRouter.get('/boom', () => {
  throw new Error('secreto interno');
});
testRouter.post('/echo', (req, res) => {
  res.json(req.body);
});

const app = createApp({
  frontendUrl: FRONTEND_URL,
  isDbUp: isMongoUp,
  logger,
  apiRouter: testRouter,
});

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectMongo(mongo.getUri());
});

afterAll(async () => {
  await disconnectMongo();
  await mongo.stop();
});

describe('GET /health', () => {
  it('responde 200 con db up cuando Mongo está arriba', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'up' });
  });

  it('responde 503 con db down cuando Mongo no está disponible', async () => {
    const appSinDb = createApp({
      frontendUrl: FRONTEND_URL,
      isDbUp: () => false,
      logger,
    });

    const res = await request(appSinDb).get('/health');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'error', db: 'down' });
  });
});

describe('errores', () => {
  it('una ruta inexistente responde 404 con el formato de error', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: expect.any(String) },
    });
  });

  it('un error no controlado responde 500 sin exponer el stack', async () => {
    const res = await request(app).get('/api/boom');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: expect.any(String) },
    });
    expect(res.text).not.toContain('secreto interno');
    expect(res.text).not.toContain('at ');
  });
});

describe('seguridad', () => {
  it('rechaza con 403 peticiones desde un origen distinto a FRONTEND_URL', async () => {
    const res = await request(app).get('/health').set('Origin', 'http://evil.example');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CORS_NOT_ALLOWED');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('acepta peticiones desde FRONTEND_URL', async () => {
    const res = await request(app).get('/health').set('Origin', FRONTEND_URL);

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(FRONTEND_URL);
  });

  it('un body mayor a 100 kb responde 413', async () => {
    const res = await request(app)
      .post('/api/echo')
      .send({ data: 'x'.repeat(101 * 1024) });

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});

describe('config/env', () => {
  const validEnv = {
    PORT: '4000',
    MONGO_URI: 'mongodb://localhost:27017/proshop',
    FRONTEND_URL,
    NODE_ENV: 'test',
  };

  it('sin MONGO_URI falla indicando qué variable falta', () => {
    const { MONGO_URI: _omit, ...sinMongo } = validEnv;

    expect(() => parseEnv(sinMongo)).toThrow(/MONGO_URI/);
  });

  it('sin MONGO_URI el proceso termina y muestra la variable faltante', () => {
    const { MONGO_URI: _omit, ...sinMongo } = validEnv;
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('exit');
    }) as never);
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    expect(() => loadEnv(sinMongo)).toThrow('exit');
    expect(exit).toHaveBeenCalledWith(1);
    expect(String(stderr.mock.calls[0]?.[0])).toContain('MONGO_URI');

    exit.mockRestore();
    stderr.mockRestore();
  });

  it('con todas las variables devuelve la configuración tipada', () => {
    expect(parseEnv(validEnv)).toEqual({ ...validEnv, PORT: 4000 });
  });
});

describe('arquitectura', () => {
  const srcDir = fileURLToPath(new URL('../src', import.meta.url));

  const listFiles = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? listFiles(path) : [path];
    });

  it('domain/ y application/ no importan Express ni Mongoose', () => {
    const files = ['domain', 'application']
      .flatMap((layer) => listFiles(join(srcDir, layer)))
      .filter((file) => file.endsWith('.ts'));
    const forbidden = /from\s+['"](express|mongoose)(\/[^'"]*)?['"]|require\(\s*['"](express|mongoose)/;

    const offenders = files.filter((file) => forbidden.test(readFileSync(file, 'utf8')));

    expect(offenders).toEqual([]);
  });
});
