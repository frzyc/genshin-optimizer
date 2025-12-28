import { z } from 'zod'
import { characterSchema } from './character'
import { discSchema } from './disc'
import { wengineSchema } from './wengine'

/**
 * Full ZOD (Zenless Object Description) import/export format schema
 *
 * This schema validates the entire import file format,
 * including metadata, version info, and all entities.
 */

// Metadata schema
const zodMetadataSchema = z.object({
  format: z.literal('ZOD'),
  version: z.number().int().min(1),
  source: z.string().optional(),
  exportDate: z.number().optional(),
})

// Full import format - can be used for:
// 1. Validating imported files before processing
// 2. Generating typed export objects
// 3. Documentation/API contracts
export const zodFormatSchema = z.object({
  ...zodMetadataSchema.shape,
  wengines: z.array(wengineSchema.extend({ id: z.string() })).optional(),
  characters: z.array(characterSchema).optional(),
  discs: z.array(discSchema.extend({ id: z.string() })).optional(),
})

export type ZODFormat = z.infer<typeof zodFormatSchema>

/**
 * Validate an import file and get detailed errors
 */
export function validateZODImport(obj: unknown) {
  const result = zodFormatSchema.safeParse(obj)
  if (result.success) {
    return { success: true as const, data: result.data }
  }
  return {
    success: false as const,
    errors: result.error.issues.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    })),
  }
}
