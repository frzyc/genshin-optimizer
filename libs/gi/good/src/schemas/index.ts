/**
 * GI Database Schemas
 *
 * This is the single source of truth for:
 * - TypeScript types (via interfaces aligned with schemas)
 * - Validation logic
 * - Import/export parsing
 *
 * Benefits:
 * 1. Types and validation are always in sync
 * 2. Single place to update when data shapes change
 * 3. Clear distinction between strict (import) and lenient (recovery) modes
 * 4. Reusable schemas across the codebase
 *
 * Architecture:
 * - Schemas handle STRUCTURAL validation (types, ranges, enums)
 * - DataManagers handle BUSINESS RULES (using gi/util functions)
 *   - validateCharLevelAsc, validateTalent for characters
 *   - validateWeaponLevelAsc for weapons
 *   - artSlotMainKeys, getSubstatRange for artifacts
 */

export * from './artifact'
export * from './character'
export * from './weapon'
export * from './good-format'
