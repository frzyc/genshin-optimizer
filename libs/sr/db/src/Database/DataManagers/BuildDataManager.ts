import { zodString, zodTypedRecord } from '@genshin-optimizer/common/database'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import {
  allCharacterKeys,
  allRelicSlotKeys,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

const relicIdValueSchema = z.union([z.string(), z.undefined()])
const relicIdsSchema = zodTypedRecord(allRelicSlotKeys, relicIdValueSchema)

const buildSchema = z.object({
  name: z.string().catch('Build Name'),
  description: zodString(),
  characterKey: z.enum(allCharacterKeys),
  teamId: z.string().optional(),
  lightConeId: z.string().optional(),
  relicIds: relicIdsSchema.catch(objKeyMap(allRelicSlotKeys, () => undefined)),
})

export type Build = z.infer<typeof buildSchema>
export type RelicIds = Build['relicIds']

export class BuildDataManager extends DataManager<
  string,
  'builds',
  Build,
  Build
> {
  constructor(database: SroDatabase) {
    super(database, 'builds')
  }
  override validate(obj: unknown): Build | undefined {
    const result = buildSchema.safeParse(obj)
    if (!result.success) return undefined

    const {
      name,
      description,
      characterKey,
      teamId,
      lightConeId: rawLightConeId,
      relicIds: rawRelicIds,
    } = result.data

    // Validate lightConeId exists in database
    let lightConeId = rawLightConeId
    if (lightConeId && !this.database.lightCones.get(lightConeId))
      lightConeId = undefined

    // Validate relicIds - ensure each relic exists and matches its slot
    const relicIds = objKeyMap(allRelicSlotKeys, (sk): string | undefined => {
      const id = rawRelicIds?.[sk]
      if (!id) return undefined
      const relic = this.database.relics.get(id)
      if (!relic || relic.slotKey !== sk) return undefined
      return id
    })

    return {
      name,
      characterKey,
      teamId,
      description,
      lightConeId,
      relicIds,
    }
  }

  new(build: Partial<Build> = {}): string {
    const id = this.generateKey()
    this.set(id, build)
    return id
  }
  duplicate(buildId: string): string {
    const build = this.get(buildId)
    if (!build) return ''
    return this.new(structuredClone(build))
  }
  getBuildIds(characterKey: CharacterKey) {
    return this.keys.filter(
      (key) => this.get(key)?.characterKey === characterKey
    )
  }
}
