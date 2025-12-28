import { z } from 'zod'
import { artifactSchema, type IArtifact } from './artifact'
import { characterSchema, type ICharacter } from './character'
import { weaponSchema, type IWeapon } from './weapon'

/**
 * GOOD (Genshin Open Object Description) format schema
 *
 * This schema validates the entire import file format,
 * including metadata, version info, and all entities.
 */

// Version enum
const goodVersionSchema = z.union([z.literal(1), z.literal(2), z.literal(3)])

// Full GOOD format schema
export const goodFormatSchema = z.object({
  format: z.literal('GOOD'),
  source: z.string(),
  version: goodVersionSchema,
  characters: z.array(characterSchema).optional(),
  artifacts: z.array(artifactSchema).optional(),
  weapons: z.array(weaponSchema).optional(),
})

// TypeScript type
export interface IGOOD {
  format: 'GOOD'
  source: string
  version: 1 | 2 | 3
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
}

/**
 * Validate a GOOD import file and get detailed errors
 */
export function validateGOODImport(obj: unknown) {
  const result = goodFormatSchema.safeParse(obj)
  if (result.success) {
    return { success: true as const, data: result.data as IGOOD }
  }
  return {
    success: false as const,
    errors: result.error.issues.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    })),
  }
}

/**
 * Parse GOOD import (strict - throws on invalid)
 */
export function parseGOODImport(obj: unknown): IGOOD {
  return goodFormatSchema.parse(obj) as IGOOD
}
