/**
 * ZZZ Database Schemas
 *
 * This is the single source of truth for:
 * - TypeScript types (via z.infer)
 * - Validation logic
 * - Import/export parsing
 *
 * Benefits:
 * 1. Types and validation are always in sync
 * 2. Single place to update when data shapes change
 * 3. Clear distinction between strict (import) and lenient (recovery) modes
 * 4. Reusable schemas across the codebase
 *
 * Usage patterns:
 *
 * 1. Strict validation (for imports):
 *    const result = wengineSchema.safeParse(importedData)
 *    if (!result.success) return showErrors(result.error)
 *
 * 2. Recovery validation (for database repair):
 *    const wengine = validateWengine(corruptData) // defaults invalid fields
 *
 * 3. Type inference:
 *    import type { IWengine } from './schemas'
 *
 * 4. Import file validation:
 *    const result = validateZODImport(fileContents)
 *    if (!result.success) showValidationErrors(result.errors)
 */

export * from './wengine'
export * from './character'
export * from './disc'
export * from './zod-format'
