import type { DataManagerCallback } from '@genshin-optimizer/common/database'
import { deepClone } from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  HitModeKey,
  LightConeKey,
  RelicSetKey,
} from '@genshin-optimizer/sr/consts'
import { allCharacterKeys, allHitModeKeys } from '@genshin-optimizer/sr/consts'
import type { ICachedLightCone, ICachedRelic } from '../../Interfaces'
import type { IBuildTc } from '../../Interfaces/IBuildTc'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
import type { Build } from './BuildDataManager'
import { initCharTC, toBuildTc } from './BuildTcDataManager'

type CondKey = CharacterKey | RelicSetKey | LightConeKey
export type IConditionalValues = Partial<
  Record<CondKey, { [key: string]: string }>
>
export interface TeamCharacter {
  key: CharacterKey

  name: string
  description: string

  conditional: IConditionalValues

  hitMode: HitModeKey

  buildIds: string[]

  buildTcIds: string[]
  optConfigId: string
}

export class TeamCharacterDataManager extends DataManager<
  string,
  'teamchars',
  TeamCharacter,
  TeamCharacter
> {
  constructor(database: SroDatabase) {
    super(database, 'teamchars')

    // Since this and optConfig have a 1:1 relationship, validate whether there are any orphaned optConfigs
    // const optConfigKeys = new Set(this.database.optConfigs.keys)
    // this.values.forEach(({ optConfigId }) => optConfigKeys.delete(optConfigId))
    // Array.from(optConfigKeys).forEach((optConfigId) =>
    //   this.database.optConfigs.remove(optConfigId)
    // )
  }
  newName(characterKey: CharacterKey) {
    const existingUndercKey = this.values.filter(
      ({ key }) => key === characterKey
    )
    for (
      let num = existingUndercKey.length + 1;
      num <= existingUndercKey.length * 2;
      num++
    ) {
      const name = `${characterKey} Loadout ${num}`
      if (existingUndercKey.some((tc) => tc.name !== name)) return name
    }
    return `${characterKey} Loadout`
  }
  override validate(obj: unknown): TeamCharacter | undefined {
    const { key: characterKey } = obj as TeamCharacter
    let {
      name,
      description,

      conditional,

      hitMode,

      buildIds,
      buildTcIds,
      optConfigId,
    } = obj as TeamCharacter
    if (!allCharacterKeys.includes(characterKey)) return undefined // non-recoverable

    if (typeof name !== 'string') name = this.newName(characterKey)

    if (typeof description !== 'string') description = ''

    // create a character if it doesnt exist
    if (!this.database.chars.keys.includes(characterKey))
      this.database.chars.getOrCreate(characterKey)

    if (!conditional) conditional = {}

    if (!allHitModeKeys.includes(hitMode)) hitMode = 'avgHit'

    if (!Array.isArray(buildIds)) buildIds = []
    buildIds = buildIds.filter((buildId) =>
      this.database.builds.keys.includes(buildId)
    )

    if (!Array.isArray(buildTcIds)) buildTcIds = []
    buildTcIds = buildTcIds.filter((buildTcId) =>
      this.database.buildTcs.keys.includes(buildTcId)
    )

    if (!optConfigId || !this.database.optConfigs.keys.includes(optConfigId))
      optConfigId = this.database.optConfigs.new()

    return {
      key: characterKey,
      name,
      description,
      conditional,
      hitMode,

      buildIds,
      buildTcIds,
      optConfigId,
    }
  }

  new(key: CharacterKey, data: Partial<TeamCharacter> = {}): string {
    const optConfigId = this.database.optConfigs.new()
    const id = this.generateKey()
    this.set(id, { key, optConfigId, ...data })
    return id
  }
  override remove(
    teamCharId: string,
    notify?: boolean
  ): TeamCharacter | undefined {
    const rem = super.remove(teamCharId, notify)
    if (!rem) return
    const { optConfigId, buildIds, buildTcIds } = rem
    this.database.optConfigs.remove(optConfigId)
    this.database.teams.keys.forEach((teamId) => {
      if (
        this.database.teams
          .get(teamId)!
          .loadoutData.some(
            (loadoutDatum) => loadoutDatum?.teamCharId === teamCharId
          )
      )
        this.database.teams.set(teamId, {}) // use validator to remove teamCharId entries
    })

    buildIds.forEach((buildId) => this.database.builds.remove(buildId))
    buildTcIds.forEach((buildTcId) => this.database.buildTcs.remove(buildTcId))
    return rem
  }
  override clear(): void {
    super.clear()
  }
  duplicate(teamcharId: string): string {
    const teamCharRaw = this.get(teamcharId)
    if (!teamCharRaw) return ''
    const teamChar = deepClone(teamCharRaw)

    teamChar.buildIds = teamChar.buildIds.map((buildId) =>
      this.database.builds.duplicate(buildId)
    )

    teamChar.buildTcIds = teamChar.buildTcIds.map((buildTcId) =>
      this.database.buildTcs.duplicate(buildTcId)
    )

    teamChar.optConfigId = this.database.optConfigs.duplicate(
      teamChar.optConfigId
    )
    teamChar.name = `${teamChar.name} (duplicated)`
    return this.new(teamChar.key, teamChar)
  }
  newBuild(teamCharId: string, build: Partial<Build> = {}) {
    if (!this.get(teamCharId)) return

    const buildId = this.database.builds.new(build)
    if (!buildId) return
    this.set(teamCharId, (teamChar) => {
      teamChar.buildIds.unshift(buildId)
    })
  }
  newBuildTc(teamCharId: string, data: Partial<IBuildTc> = {}) {
    if (!this.get(teamCharId)) return

    const buildTcId = this.database.buildTcs.new(data)
    if (!buildTcId) return
    this.set(teamCharId, (teamChar) => {
      teamChar.buildTcIds.unshift(buildTcId)
    })
  }
  newBuildTcFromBuild(
    teamcharId: string,
    lightCone?: ICachedLightCone,
    relics: Array<ICachedRelic | undefined> = []
  ): string | undefined {
    if (!this.get(teamcharId)) return undefined
    const buildTc = initCharTC()
    toBuildTc(buildTc, lightCone, relics)
    const buildTcId = this.database.buildTcs.new(buildTc)
    if (!buildTcId) return undefined
    this.set(teamcharId, (teamChar) => {
      teamChar.buildTcIds.unshift(buildTcId)
    })
    return buildTcId
  }

  export(teamCharId: string): object {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return {}
    const { buildIds, buildTcIds, optConfigId, ...rest } = teamChar
    return {
      ...rest,
      buildTcs: buildTcIds.map((buildTcId) =>
        this.database.buildTcs.export(buildTcId)
      ),
      optConfig: this.database.optConfigs.export(optConfigId),
    }
  }
  import(data: object): string {
    const { buildTcs, optConfig, ...rest } = data as TeamCharacter & {
      buildTcs: object[]
      optConfig: object
    }
    const id = this.generateKey()

    if (
      !this.set(id, {
        ...rest,
        buildTcIds: buildTcs.map((obj) => this.database.buildTcs.import(obj)),
        optConfigId: this.database.optConfigs.import(optConfig),
      })
    )
      return ''
    return id
  }
  followChar(teamCharId: string, callback: DataManagerCallback<CharacterKey>) {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return () => {}
    return this.database.chars.follow(teamChar.key, callback)
  }
}
