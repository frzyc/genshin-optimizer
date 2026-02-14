import { zodTypedRecord } from '@genshin-optimizer/common/database'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
import type { RelicIds } from './BuildDataManager'

const relicIdValueSchema = z.union([z.string(), z.undefined()])
const relicIdsSchema = zodTypedRecord(
  allRelicSlotKeys,
  relicIdValueSchema
) as z.ZodType<RelicIds>

const generatedBuildSchema = z.object({
  value: z.number(),
  lightConeId: z.string().optional(),
  relicIds: relicIdsSchema,
})

export type GeneratedBuild = z.infer<typeof generatedBuildSchema>

const generatedBuildListSchema = z.object({
  builds: z.array(generatedBuildSchema).catch([]),
  buildDate: z.number().int().catch(0),
})

export type GeneratedBuildList = z.infer<typeof generatedBuildListSchema>

export class GeneratedBuildListDataManager extends DataManager<
  string,
  'generatedBuildList',
  GeneratedBuildList,
  GeneratedBuildList
> {
  constructor(database: SroDatabase) {
    super(database, 'generatedBuildList')
  }
  override validate(obj: unknown): GeneratedBuildList | undefined {
    const result = generatedBuildListSchema.safeParse(obj)
    if (!result.success) return undefined

    const { builds: rawBuilds, buildDate } = result.data

    // Validate builds with database lookups
    const builds: GeneratedBuild[] = rawBuilds.map((build) => {
      const { relicIds: relicIdsRaw, value } = build
      let { lightConeId } = build

      // Validate lightConeId exists in database
      if (lightConeId && !this.database.lightCones.get(lightConeId))
        lightConeId = undefined

      // Validate relicIds - ensure each relic exists and matches its slot
      const relicIds = objKeyMap(allRelicSlotKeys, (slotKey) =>
        this.database.relics.get(relicIdsRaw[slotKey])?.slotKey === slotKey
          ? relicIdsRaw[slotKey]
          : undefined
      )

      return { relicIds, lightConeId, value }
    })

    return {
      builds,
      buildDate,
    }
  }
  new(data: GeneratedBuildList) {
    const id = this.generateKey()
    this.set(id, { ...data })
    return id
  }
}
