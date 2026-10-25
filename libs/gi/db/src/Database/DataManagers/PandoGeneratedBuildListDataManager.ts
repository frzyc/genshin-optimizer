import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  type ArtifactSlotKey,
  allArtifactSlotKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'

const artIdsSchema = z
  .object({
    flower: z.string().optional(),
    plume: z.string().optional(),
    sands: z.string().optional(),
    goblet: z.string().optional(),
    circlet: z.string().optional(),
  })
  .catch({
    flower: undefined,
    plume: undefined,
    sands: undefined,
    goblet: undefined,
    circlet: undefined,
  })

const pandoGeneratedBuildSchema = z.object({
  value: z.number(),
  weaponId: z.string().optional(),
  artIds: artIdsSchema,
})

export type PandoGeneratedBuild = z.infer<typeof pandoGeneratedBuildSchema>
export type PandoArtIds = Record<ArtifactSlotKey, string | undefined>

const pandoGeneratedBuildListSchema = z.object({
  builds: z.array(pandoGeneratedBuildSchema).catch([]),
  buildDate: z.number().int().catch(0),
})

export type PandoGeneratedBuildList = z.infer<
  typeof pandoGeneratedBuildListSchema
>

const storageHash = 'pandoGeneratedBuildList_'

export class PandoGeneratedBuildListDataManager extends DataManager<
  string,
  'pandoGeneratedBuildList',
  PandoGeneratedBuildList,
  PandoGeneratedBuildList,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'pandoGeneratedBuildList')
    for (const key of this.database.storage.keys)
      if (key.startsWith(storageHash) && !this.set(key, {}))
        this.database.storage.remove(key)
  }

  override validate(obj: unknown): PandoGeneratedBuildList | undefined {
    const result = pandoGeneratedBuildListSchema.safeParse(obj)
    if (!result.success) return undefined

    const { builds: rawBuilds, buildDate } = result.data

    const builds: PandoGeneratedBuild[] = rawBuilds.map((build) => {
      const { artIds: artIdsRaw, value } = build
      let { weaponId } = build

      if (weaponId && !this.database.weapons.get(weaponId)) weaponId = undefined

      const artIds = objKeyMap(allArtifactSlotKeys, (slotKey) =>
        this.database.arts.get(artIdsRaw[slotKey])?.slotKey === slotKey
          ? artIdsRaw[slotKey]
          : undefined
      )

      return { artIds, weaponId, value }
    })

    return {
      builds,
      buildDate,
    }
  }

  new(data: PandoGeneratedBuildList) {
    const id = this.generateKey()
    this.set(id, { ...data })
    return id
  }
}
