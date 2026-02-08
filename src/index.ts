import patternsRegistry from './patterns-registry.json';
import integratorsRegistry from './integrators-registry.json';
import componentMapping from './component-mapping.json';
import eventContracts from './event-contracts.json';

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

export function getPatternDefinition(patternType: string) {
  return (patternsRegistry as any).patterns?.[patternType] ?? null;
}

export function getComponentForPattern(patternType: string) {
  return (componentMapping as any).mappings?.[patternType] ?? null;
}

/**
 * Check if a pattern is entity-aware (requires data injection).
 *
 * Entity-aware patterns:
 * 1. Have `entityAware: true` in the registry (explicit flag)
 * 2. OR have both `entity` and `data` props in propsSchema (auto-detection fallback)
 *
 * @param patternType - Pattern type to check
 * @returns true if the pattern is entity-aware
 */
export function isEntityAwarePattern(patternType: string): boolean {
  const definition = getPatternDefinition(patternType);
  if (!definition) return false;

  // Explicit flag takes precedence
  if (definition.entityAware === true) return true;

  // Auto-detect based on props (fallback)
  const propsSchema = definition.propsSchema;
  if (!propsSchema) return false;

  // If pattern has both 'entity' and ('data' or 'items') props, it's likely entity-aware
  const hasEntityProp = 'entity' in propsSchema;
  const hasDataProp = 'data' in propsSchema || 'items' in propsSchema;

  return hasEntityProp && hasDataProp;
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
