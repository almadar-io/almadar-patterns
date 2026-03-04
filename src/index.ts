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
  return (componentMapping as ComponentMapping).mappings?.[patternType] ?? null;
}

/**
 * Check if a pattern is entity-aware (requires data injection).
 *
 * Entity-aware patterns have an `entity` prop typed as `array` or `object`
 * in the registry propsSchema. String-typed entity props are metadata only.
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

  // Entity-aware = entity prop type is array or object (carries data, not a name string)
  const entityTypes: string[] = propsSchema.entity?.types || [];
  return entityTypes.includes('array') || entityTypes.includes('object');
}

// Export prompt helpers for @almadar/skills
export {
  getPatternsGroupedByCategory,
  getPatternPropsCompact,
  getPatternActionsRef,
  generatePatternDescription,
  getAllPatternTypes,
  getPatternMetadata,
} from './helpers/prompt-helpers.js';

// Export pattern recommender for @almadar/agent design tool
export {
  recommendPatterns,
  buildRecommendationContext,
  formatRecommendationsForPrompt,
  type RecommendationContext,
  type PatternRecommendation,
} from './helpers/pattern-recommender.js';
