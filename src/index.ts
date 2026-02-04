import registry from './registry.json';
import componentMapping from './component-mapping.json';
import eventContracts from './event-contracts.json';

export { registry, componentMapping, eventContracts };
export const PATTERN_REGISTRY = registry;
export const COMPONENT_MAPPING = componentMapping;
export const EVENT_CONTRACTS = eventContracts;

export function getPatternDefinition(patternType: string) {
  return (registry as any).patterns?.[patternType] ?? null;
}

export function getComponentForPattern(patternType: string) {
  return (componentMapping as any)[patternType] ?? null;
}
