import { z } from 'zod'

/**
 * Relationship validation schemas
 *
 * These schemas define and validate relationships between entities.
 * They can be used to:
 * 1. Validate that referenced entities exist
 * 2. Ensure referential integrity during import
 * 3. Cascade updates when entities change
 */

/**
 * Create a schema that validates entity references exist in a collection
 * @param getKeys - Function to get valid keys from the database
 */
export function createEntityRefSchema<T extends string>(
  getKeys: () => T[]
) {
  return z.string().refine(
    (val) => val === '' || getKeys().includes(val as T),
    { message: 'Referenced entity does not exist' }
  )
}

/**
 * Relationship definitions for validation
 */
export const relationships = {
  // Wengine can be equipped on one character
  wengineToCharacter: {
    from: 'wengine',
    to: 'character',
    type: 'many-to-one' as const,
    field: 'location',
  },
  // Disc can be equipped on one character
  discToCharacter: {
    from: 'disc',
    to: 'character',
    type: 'many-to-one' as const,
    field: 'location',
  },
  // Character can have one wengine equipped
  characterToWengine: {
    from: 'character',
    to: 'wengine',
    type: 'one-to-one' as const,
    field: 'equippedWengine',
  },
  // Character can have 6 discs equipped
  characterToDiscs: {
    from: 'character',
    to: 'disc',
    type: 'one-to-many' as const,
    field: 'equippedDiscs',
    maxCount: 6,
  },
} as const

export type RelationshipType = typeof relationships
