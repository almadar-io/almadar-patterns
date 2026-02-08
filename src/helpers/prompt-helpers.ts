/**
 * Prompt Helpers for @almadar/patterns
 * 
 * Helper functions for generating prompts/documentation from pattern registry.
 * Used by @almadar/skills package and other tools.
 * 
 * @packageDocumentation
 */

import { patternsRegistry } from '../index.js';
import type { PatternType } from '../pattern-types.js';

/**
 * Get patterns grouped by category.
 * Categories are derived from pattern registry metadata.
 */
export function getPatternsGroupedByCategory(): Record<string, PatternType[]> {
  const patterns = patternsRegistry.patterns || {};
  const grouped: Record<string, PatternType[]> = {};

  for (const [patternName, patternDef] of Object.entries(patterns)) {
    const category = (patternDef as any).category || 'uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(patternName as PatternType);
  }

  return grouped;
}

/**
 * Get compact pattern props reference table.
 * Generates markdown table of pattern names and their key props.
 */
export function getPatternPropsCompact(): string {
  const patterns = patternsRegistry.patterns || {};
  const lines: string[] = [
    '| Pattern | Key Props |',
    '|---------|-----------|',
  ];

  for (const [patternName, patternDef] of Object.entries(patterns)) {
    const propsSchema = (patternDef as any).propsSchema || {};
    const requiredProps = Object.keys(propsSchema).filter(
      (key) => propsSchema[key]?.required === true
    );
    const keyProps = requiredProps.length > 0 
      ? requiredProps.join(', ') 
      : Object.keys(propsSchema).slice(0, 3).join(', ');
    
    lines.push(`| ${patternName} | ${keyProps} |`);
  }

  return lines.join('\n');
}

/**
 * Get pattern action props reference.
 * Lists patterns that have action/event props (buttons, forms, etc.).
 */
export function getPatternActionsRef(): string {
  const patterns = patternsRegistry.patterns || {};
  const lines: string[] = [
    '## Pattern Action Props',
    '',
    '| Pattern | Action Props | Notes |',
    '|---------|-------------|-------|',
  ];

  for (const [patternName, patternDef] of Object.entries(patterns)) {
    const propsSchema = (patternDef as any).propsSchema || {};
    const actionProps: string[] = [];

    // Check for common action prop patterns
    for (const [propName, propDef] of Object.entries(propsSchema)) {
      if (
        propName.includes('action') ||
        propName.includes('Action') ||
        propName.includes('event') ||
        propName.includes('Event') ||
        propName === 'onSubmit' ||
        propName === 'onClick'
      ) {
        actionProps.push(propName);
      }
    }

    if (actionProps.length > 0) {
      const notes = (patternDef as any).description || '';
      lines.push(`| ${patternName} | ${actionProps.join(', ')} | ${notes.slice(0, 50)} |`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate pattern description from metadata.
 * Auto-generates human-readable description from pattern props schema.
 */
export function generatePatternDescription(patternType: string): string {
  const patterns = patternsRegistry.patterns as Record<string, any> || {};
  const patternDef = patterns[patternType];
  
  if (!patternDef) {
    return patternType;
  }

  const desc = patternDef.description;
  if (desc) {
    return desc;
  }

  // Auto-generate from props
  const propsSchema = patternDef.propsSchema || {};
  const propCount = Object.keys(propsSchema).length;
  const requiredProps = Object.keys(propsSchema).filter(
    (key) => propsSchema[key]?.required === true
  );

  if (requiredProps.length > 0) {
    return `${patternType} (requires: ${requiredProps.join(', ')})`;
  }

  return `${patternType} (${propCount} props)`;
}

/**
 * Get all pattern types as array.
 */
export function getAllPatternTypes(): PatternType[] {
  const patterns = patternsRegistry.patterns as Record<string, any> || {};
  return Object.keys(patterns) as PatternType[];
}

/**
 * Get pattern metadata for a specific pattern.
 */
export function getPatternMetadata(patternType: string) {
  const patterns = patternsRegistry.patterns as Record<string, any> || {};
  return patterns[patternType] || null;
}
