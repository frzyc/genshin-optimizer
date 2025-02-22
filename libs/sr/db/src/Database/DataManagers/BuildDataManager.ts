import { objKeyMap } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import {
  allCharacterKeys,
  allRelicSlotKeys,
} from '@genshin-optimizer/sr/consts'
import type { RelicIds } from '../../Types'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
export interface Build {
  name: string
  description: string
  characterKey: CharacterKey
  teamId?: string

  lightConeId?: string
  relicIds: RelicIds
}

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
    const { characterKey, teamId } = obj as Build
    if (!allCharacterKeys.includes(characterKey)) return undefined

    let { name, description, lightConeId, relicIds } = obj as Build

    // Cannot validate teamId, since on db init database.teams do not exist yet.
    // if (teamId && !this.database.teams.get(teamId)) teamId = undefined
    if (typeof name !== 'string') name = 'Build Name'
    if (typeof description !== 'string') description = ''
    if (lightConeId && !this.database.lightCones.get(lightConeId))
      lightConeId = undefined

    if (typeof relicIds !== 'object')
      relicIds = objKeyMap(allRelicSlotKeys, () => '')
    else
      relicIds = objKeyMap(allRelicSlotKeys, (sk) => {
        const id = relicIds[sk]
        if (!id) return ''
        const relic = this.database.relics.get(id)
        if (!relic) return ''
        if (relic.slotKey !== sk) return ''
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
