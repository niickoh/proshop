import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  MONGO_URI: z.string().min(1),
  FRONTEND_URL: z.url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  // z.coerce.boolean convertiría 'false' en true
  ENABLE_DOCS: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

export function isDocsEnabled(env: Env): boolean {
  return env.NODE_ENV !== 'production' || env.ENABLE_DOCS === true;
}

type EnvSource = Record<string, string | undefined>;

export function parseEnv(source: EnvSource): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;

  const problems = result.error.issues.map((issue) => {
    const name = issue.path.join('.');
    return source[name] === undefined || source[name] === ''
      ? `Falta la variable de entorno: ${name}`
      : `Variable de entorno inválida: ${name} (${issue.message})`;
  });
  throw new Error(problems.join('\n'));
}

export function loadEnv(source: EnvSource = process.env): Env {
  try {
    return parseEnv(source);
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n`);
    return process.exit(1);
  }
}
