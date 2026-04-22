/**
 * Shared types for @almadar/patterns
 *
 * @packageDocumentation
 */

/**
 * Semantic kind marker for a pattern prop. Complements the structural
 * `types` field (which declares "string" / "array" / "object" / ...)
 * with meaning — *what is this value, beyond its JSON shape?*
 *
 * Consumers of the patterns registry (the Rust compiler's inline phase
 * in `orbital-compiler`, the JS preprocess in `@almadar/runtime`, and
 * verifiers in `@almadar-io/verify`) read `kind` to decide whether a
 * prop participates in call-site `events: { OLD: NEW }` renames,
 * entity substitutions, and similar structural rewrites. Without this
 * marker, consumers fall back to name-matching heuristics that drift
 * between implementations — the problem this field eliminates.
 *
 * Kinds:
 * - `"event"`      — the prop value is a declared event key (string).
 *                     Inline phase rewrites via the trait's events map.
 *                     Source type: `EventKey` from `@almadar/core`.
 * - `"event-list"` — the prop is an array of action-descriptor objects.
 *                     Each item has a field (default `"event"`, override
 *                     with {@link PatternPropDef.eventField}) holding a
 *                     declared event key. Same rename applies per item.
 *
 * Reserved for future use: `"entity"`, `"config-binding"`. Add here
 * rather than inventing per-consumer markers.
 */
export type PropKind = 'event' | 'event-list';

/**
 * Schema describing a single prop in a pattern's propsSchema. Emitted
 * by the pattern-sync tool (`tools/almadar-pattern-sync/`) from a
 * component's TypeScript Props interface, consumed by every part of
 * the stack that inspects pattern shape.
 */
export interface PatternPropDef {
  /** Structural JSON types this prop accepts ("string", "array", ...). */
  types?: string[];
  /** Whether the prop is required at the pattern call site. */
  required?: boolean;
  /** Human-readable prop description (from TS JSDoc when available). */
  description?: string;
  /** Allowed literal values when the TS type is a string-literal union. */
  enumValues?: string[];
  /**
   * Semantic marker layered over {@link PatternPropDef.types}. Set by
   * the pattern-sync tool when the prop's TS type references a
   * semantic alias (e.g. `EventKey` from `@almadar/core`). Absent when
   * the prop has no additional semantic meaning beyond its JSON shape.
   */
  kind?: PropKind;
  /**
   * For `kind: "event-list"`: the name of the field inside each array
   * item that holds the event key. Defaults to `"event"` when
   * omitted. Only meaningful alongside `kind: "event-list"`.
   */
  eventField?: string;
}
