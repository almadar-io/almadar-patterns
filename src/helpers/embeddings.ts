/**
 * Loader for the baked `pattern-embeddings.json` (semantic vectors per pattern,
 * used to rank contextual-swap candidates). The package owns this loader so
 * consumers never reach into its `dist/` — mirrors how `@almadar/std` exposes
 * its behaviors/knob embeddings. Returns `null` when the bake was skipped at
 * publish time (no `OPEN_ROUTER_API_KEY`); callers fall back to shape-gate order.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface PatternEmbeddings {
  version?: string;
  model?: string;
  dimensions: number;
  vectors: Record<string, number[]>;
}

let cache: PatternEmbeddings | null | undefined;

/** Load the baked pattern embeddings (cached). `null` when unavailable. */
export function getPatternEmbeddings(): PatternEmbeddings | null {
  if (cache !== undefined) return cache;
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const parsed: PatternEmbeddings = JSON.parse(
      readFileSync(join(here, 'pattern-embeddings.json'), 'utf-8'),
    );
    cache = parsed && parsed.vectors ? parsed : null;
  } catch {
    cache = null;
  }
  return cache;
}
