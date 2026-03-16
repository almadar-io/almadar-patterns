import patternsRegistry from './patterns-registry.json' with { type: 'json' };
import integratorsRegistry from './integrators-registry.json' with { type: 'json' };
import componentMapping from './component-mapping.json' with { type: 'json' };
import eventContracts from './event-contracts.json' with { type: 'json' };

// Export both registries
export { patternsRegistry, integratorsRegistry, componentMapping, eventContracts };

// Export pattern types for compile-time validation
export {
  PatternType,
  PatternPropsMap,
  PatternProps,
  PatternConfig,
  AnyPatternConfig,
  PATTERN_TYPES,
  isValidPatternType,
} from './pattern-types.js';

// Backwards compatible alias - registry refers to patterns registry
export const registry = patternsRegistry;

export const PATTERN_REGISTRY = patternsRegistry;
export const INTEGRATORS_REGISTRY = integratorsRegistry;
export const COMPONENT_MAPPING = componentMapping;
export const EVENT_CONTRACTS = eventContracts;

type PatternEntry = {
  type: string;
  category: string;
  description?: string;
  suggestedFor?: string[];
  typicalSize?: string;
  propsSchema?: Record<string, { types?: string[]; required?: boolean }>;
  entityAware?: boolean;
};

type PatternsRegistry = {
  version?: string;
  exportedAt?: string;
  patterns: Record<string, PatternEntry>;
  categories?: string[];
};

type ComponentMapping = {
  version?: string;
  exportedAt?: string;
  mappings: Record<string, string>;
};

export function getPatternDefinition(patternType: string): PatternEntry | null {
  return (patternsRegistry as PatternsRegistry).patterns?.[patternType] ?? null;
}

export function getComponentForPattern(patternType: string): string | null {
  return (componentMapping as unknown as ComponentMapping).mappings?.[patternType] ?? null;
}

/**
 * Check if a pattern is entity-aware (requires data injection).
 *
 * A pattern is entity-aware when it declares an `entity` prop in its
 * propsSchema, regardless of the declared type. Display patterns like
 * DataGrid and Timeline declare entity as "string" or "unknown" but
 * still need entity data injected at runtime.
 *
 * @param patternType - Pattern type to check
 * @returns true if the pattern is entity-aware
 */
export function isEntityAwarePattern(patternType: string): boolean {
  const definition = getPatternDefinition(patternType);
  if (!definition) return false;

  // Explicit flag takes precedence
  if (definition.entityAware === true) return true;

  const propsSchema = definition.propsSchema;
  if (!propsSchema) return false;

  // Any pattern with an entity prop needs data injection
  return 'entity' in propsSchema;
}

// Export prompt helpers for @almadar/skills
export {
  getPatternsGroupedByCategory,
  getPatternPropsCompact,
  getPatternActionsRef,
  generatePatternDescription,
  getAllPatternTypes,
  getPatternMetadata,
  getOrbAllowedPatterns,
  getOrbAllowedPatternsCompact,
  getOrbAllowedPatternsSlim,
  getOrbAllowedPatternsFiltered,
} from './helpers/prompt-helpers.js';

// Export pattern recommender for @almadar/agent design tool
export {
  recommendPatterns,
  buildRecommendationContext,
  formatRecommendationsForPrompt,
  type RecommendationContext,
  type PatternRecommendation,
} from './helpers/pattern-recommender.js';
