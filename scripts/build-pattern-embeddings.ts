#!/usr/bin/env npx tsx
/**
 * Build `src/pattern-embeddings.json` at publish time.
 *
 * Reads every pattern in `patterns-registry.json`, composes a domain-text
 * snippet per pattern (type + description + category + suggestedFor + prop
 * keys), sends a single batch request to the OpenRouter Embeddings API
 * (baai/bge-base-en-v1.5, 768-d), and writes the manifest. `tsup.config.ts`
 * copies it into `dist/` alongside the registry JSON so consumers find it
 * next to the published package's other artifacts.
 *
 * Mirrors `packages/almadar-behaviors/scripts/build-embeddings.ts`. The
 * semantic-rank step of a contextual pattern swap ranks the deterministic
 * shape-gate candidates (`findCompatiblePatterns`) against these vectors.
 *
 * Required env var: `OPEN_ROUTER_API_KEY`. Skips with a warning when unset —
 * the swap path falls back to the shape-gate order when the file is missing.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const REGISTRY_PATH = join(PKG_ROOT, 'src', 'patterns-registry.json');
const OUTPUT_PATH = join(PKG_ROOT, 'src', 'pattern-embeddings.json');
const PKG_PATH = join(PKG_ROOT, 'package.json');

const EMBEDDING_PROVIDER = 'openrouter' as const;
const EMBEDDING_MODEL = 'baai/bge-base-en-v1.5';
const EMBEDDING_DIMS = 768;
const PRICE_PER_1M = 0.005;

interface PropEntry {
  description?: string;
  enumValues?: string[];
  synonyms?: string;
}

interface PatternEntry {
  type?: string;
  category?: string;
  description?: string;
  suggestedFor?: string[];
  propsSchema?: Record<string, PropEntry>;
}

interface RegistryFile {
  patterns: Record<string, PatternEntry>;
}

interface PackageJson {
  version: string;
}

function buildPatternText(name: string, entry: PatternEntry): string {
  const parts: string[] = [name];
  if (entry.description) parts.push(entry.description);
  if (entry.category) parts.push(`Category: ${entry.category}`);
  if (entry.suggestedFor && entry.suggestedFor.length > 0) {
    parts.push(`For: ${entry.suggestedFor.join(', ')}`);
  }
  if (entry.propsSchema) {
    const props = Object.entries(entry.propsSchema);
    parts.push(`Props: ${props.map(([k]) => k).join(' ')}`);
    // Per-prop semantics: the deliberate `@synonyms` + the declared variant
    // `enumValues` (and the description of those signal-bearing props) enter the
    // pattern's vector, so an intent word ("bar") pulls the pattern whose prop
    // can express it — the swap-rank generalization of the suggestedFor seed.
    for (const [prop, def] of props) {
      const bits: string[] = [];
      if (def.synonyms) bits.push(def.synonyms);
      if (def.enumValues && def.enumValues.length > 0) bits.push(def.enumValues.join(', '));
      if (bits.length > 0) {
        if (def.description) bits.push(def.description);
        parts.push(`${prop}: ${bits.join(' — ')}`);
      }
    }
  }
  return parts.join('\n');
}

async function main(): Promise<void> {
  const apiKey = process.env['OPEN_ROUTER_API_KEY'];
  if (!apiKey) {
    console.warn(
      '[build-pattern-embeddings] OPEN_ROUTER_API_KEY not set — skipping bake. ' +
        'The swap path falls back to shape-gate order at runtime.',
    );
    process.exit(0);
  }

  // Resolve the embedding client lazily so a missing @almadar/llm install
  // (it is a publish-time devDependency) skips the bake instead of crashing
  // the package build — same graceful path as a missing API key.
  const llm = await import('@almadar/llm').catch(() => null);
  if (!llm) {
    console.warn(
      '[build-pattern-embeddings] @almadar/llm not resolvable — skipping bake. ' +
        'The swap path falls back to shape-gate order at runtime.',
    );
    process.exit(0);
  }

  const registry: RegistryFile = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
  const pkg: PackageJson = JSON.parse(readFileSync(PKG_PATH, 'utf-8'));

  const entries = Object.entries(registry.patterns);
  console.log(`[build-pattern-embeddings] Found ${entries.length} patterns in registry`);

  const names: string[] = [];
  const texts: string[] = [];
  for (const [name, entry] of entries) {
    names.push(name);
    texts.push(buildPatternText(name, entry));
  }

  const client = new llm.EmbeddingClient({ provider: EMBEDDING_PROVIDER, model: EMBEDDING_MODEL });
  console.log(
    `[build-pattern-embeddings] Calling ${EMBEDDING_MODEL} via ${EMBEDDING_PROVIDER} for ${texts.length} patterns...`,
  );
  const result = await client.embedBatch(texts);
  console.log(
    `[build-pattern-embeddings] Got ${result.embeddings.length} vectors; ` +
      `tokens: ${result.usage.totalTokens} (≈ $${((result.usage.totalTokens / 1_000_000) * PRICE_PER_1M).toFixed(6)})`,
  );

  const vectors: Record<string, number[]> = {};
  for (let i = 0; i < names.length; i++) {
    const embedding = result.embeddings[i];
    if (!embedding || embedding.length !== EMBEDDING_DIMS) {
      throw new Error(
        `[build-pattern-embeddings] Vector for "${names[i]}" has dimension ${embedding?.length ?? 0}, expected ${EMBEDDING_DIMS}`,
      );
    }
    vectors[names[i]] = [...embedding];
  }

  const manifest = {
    version: pkg.version,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMS,
    vectors,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2) + '\n');
  const sizeBytes = JSON.stringify(manifest).length;
  console.log(
    `[build-pattern-embeddings] Wrote ${OUTPUT_PATH} (${(sizeBytes / 1024 / 1024).toFixed(2)} MB, ` +
      `${Object.keys(vectors).length} patterns × ${EMBEDDING_DIMS} dims)`,
  );
}

main().catch((err) => {
  console.error('[build-pattern-embeddings] FAILED:', err);
  process.exit(1);
});
