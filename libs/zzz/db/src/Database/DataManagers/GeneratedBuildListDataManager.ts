import { zodTypedRecord } from '@genshin-optimizer/common/database'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'
import type { DiscIds, ZzzDatabase } from '../..'
import { DataManager } from '../DataManager'


const discIdValueSchema = z.union([z.string(), z.undefined()])
const discIdsSchema = zodTypedRecord(allDiscSlotKeys, discIdValueSchema) as z.ZodType<DiscIds>

const generatedBuildSchema = z.object({
  value: z.number(),
  wengineId: z.string().optional(),
  discIds: discIdsSchema,
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
  constructor(database: ZzzDatabase) {
    super(database, 'generatedBuildList')
  }
  override validate(obj: unknown): GeneratedBuildList | undefined {
    const result = generatedBuildListSchema.safeParse(obj)
    if (!result.success) return undefined

    const { builds: rawBuilds, buildDate } = result.data

    // Validate builds with database lookups
    const builds: GeneratedBuild[] = rawBuilds.map((build) => {
      const { discIds: discIdsRaw, value } = build
      let { wengineId } = build

      // Validate wengineId exists in database
      if (wengineId && !this.database.wengines.get(wengineId))
        wengineId = undefined

      // Validate discIds - ensure each disc exists and matches its slot
      const discIds = objKeyMap(allDiscSlotKeys, (slotKey) =>
        this.database.discs.get(discIdsRaw[slotKey])?.slotKey === slotKey
          ? discIdsRaw[slotKey]
          : undefined
      )

      return { discIds, wengineId, value }
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
