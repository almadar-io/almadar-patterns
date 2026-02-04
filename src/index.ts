import patternsRegistry from './patterns-registry.json';
import integratorsRegistry from './integrators-registry.json';
import componentMapping from './component-mapping.json';
import eventContracts from './event-contracts.json';

// Export both registries
export { patternsRegistry, integratorsRegistry, componentMapping, eventContracts };

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
