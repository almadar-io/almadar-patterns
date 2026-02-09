import { describe, it, expect } from 'vitest';
import {
    patternsRegistry,
    componentMapping,
    eventContracts,
    getPatternDefinition,
    getComponentForPattern,
    isEntityAwarePattern,
    PatternType,
    PATTERN_TYPES,
    isValidPatternType,
} from '../src/index';

// ============================================================================
// Registry Structure
// ============================================================================

describe('patterns-registry.json', () => {
    it('has valid JSON structure with version and patterns', () => {
        expect(patternsRegistry).toHaveProperty('version');
        expect(patternsRegistry).toHaveProperty('patterns');
        expect(typeof (patternsRegistry as any).patterns).toBe('object');
    });

    it('contains a non-trivial number of patterns', () => {
        const count = Object.keys((patternsRegistry as any).patterns).length;
        expect(count).toBeGreaterThan(100);
    });

    it('each pattern has required fields', () => {
        const patterns = (patternsRegistry as any).patterns;
        for (const [key, pattern] of Object.entries(patterns)) {
            const p = pattern as any;
            expect(p.type, `pattern "${key}" must have type`).toBe(key);
            expect(p.category, `pattern "${key}" must have category`).toBeDefined();
        }
    });

    it('all type values are unique (no duplicates)', () => {
        const patterns = (patternsRegistry as any).patterns;
        const types = Object.values(patterns).map((p: any) => p.type);
        const unique = new Set(types);
        expect(unique.size).toBe(types.length);
    });
});

// ============================================================================
// PatternType union matches registry
// ============================================================================

describe('PatternType ↔ registry sync', () => {
    it('PATTERN_TYPES array is non-empty', () => {
        expect(PATTERN_TYPES.length).toBeGreaterThan(100);
    });

    it('isValidPatternType validates known patterns', () => {
        expect(isValidPatternType('button')).toBe(true);
        expect(isValidPatternType('card')).toBe(true);
        expect(isValidPatternType('nonexistent-xyz')).toBe(false);
    });
});

// ============================================================================
// Lookup functions
// ============================================================================

describe('getPatternDefinition', () => {
    it('returns definition for known patterns', () => {
        const def = getPatternDefinition('button');
        expect(def).not.toBeNull();
        expect(def.type).toBe('button');
    });

    it('returns null for unknown patterns', () => {
        expect(getPatternDefinition('does-not-exist')).toBeNull();
    });
});

describe('getComponentForPattern', () => {
    it('returns component mapping for known patterns', () => {
        // At least some patterns should have component mappings
        const allMappings = (componentMapping as any).mappings || {};
        const firstKey = Object.keys(allMappings)[0];
        if (firstKey) {
            const result = getComponentForPattern(firstKey);
            expect(result).not.toBeNull();
        }
    });

    it('returns null for unknown patterns', () => {
        expect(getComponentForPattern('does-not-exist')).toBeNull();
    });
});

describe('isEntityAwarePattern', () => {
    it('returns false for unknown patterns', () => {
        expect(isEntityAwarePattern('nonexistent')).toBe(false);
    });

    it('returns true for patterns with entityAware flag', () => {
        // Find a pattern with entityAware: true
        const patterns = (patternsRegistry as any).patterns;
        const entityAwarePattern = Object.values(patterns).find((p: any) => p.entityAware === true) as any;
        if (entityAwarePattern) {
            expect(isEntityAwarePattern(entityAwarePattern.type)).toBe(true);
        }
    });
});

// ============================================================================
// Component Mapping
// ============================================================================

describe('component-mapping.json', () => {
    it('has valid structure', () => {
        expect(componentMapping).toBeDefined();
        expect(typeof componentMapping).toBe('object');
    });
});

// ============================================================================
// Event Contracts
// ============================================================================

describe('event-contracts.json', () => {
    it('has valid structure', () => {
        expect(eventContracts).toBeDefined();
        expect(typeof eventContracts).toBe('object');
    });
});
