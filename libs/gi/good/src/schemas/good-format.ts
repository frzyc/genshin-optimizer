import {
  type IArtifact,
  type ICharacter,
  type IWeapon,
  artifactSchema,
  characterSchema,
  weaponSchema,
} from '@genshin-optimizer/gi/schema'
import { z } from 'zod'

const goodVersionSchema = z.union([z.literal(1), z.literal(2), z.literal(3)])

export const goodFormatSchema = z.object({
  format: z.literal('GOOD'),
  source: z.string(),
  version: goodVersionSchema,
  characters: z.array(characterSchema).optional(),
  artifacts: z.array(artifactSchema).optional(),
  weapons: z.array(weaponSchema).optional(),
})

export interface IGOOD {
  format: 'GOOD'
  source: string
  version: 1 | 2 | 3
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
}

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

export function parseGOODImport(obj: unknown): IGOOD {
  return goodFormatSchema.parse(obj) as IGOOD
}
