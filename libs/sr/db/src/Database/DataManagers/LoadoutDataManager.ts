import type { DataManagerCallback } from '@genshin-optimizer/common/database'
import { deepClone } from '@genshin-optimizer/common/util'
import type { CharacterKey, HitModeKey } from '@genshin-optimizer/sr/consts'
import { allCharacterKeys, allHitModeKeys } from '@genshin-optimizer/sr/consts'
import type { ICachedLightCone, ICachedRelic } from '../../Interfaces'
import type { IBuildTc } from '../../Interfaces/IBuildTc'
import type { ConditionalValues } from '../../Types/conditional'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
import type { Build } from './BuildDataManager'
import { initCharTC, toBuildTc } from './BuildTcDataManager'

export interface Loadout {
  key: CharacterKey

  name: string
  description: string

  conditional: ConditionalValues

  hitMode: HitModeKey

  buildIds: string[]

  buildTcIds: string[]
  optConfigId: string
}

// Same as TeamCharDataManager in GO
export class LoadoutDataManager extends DataManager<
  string,
  'loadouts',
  Loadout,
  Loadout
> {
  constructor(database: SroDatabase) {
    super(database, 'loadouts')

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
  override validate(obj: unknown): Loadout | undefined {
    const { key: characterKey } = obj as Loadout
    let {
      name,
      description,

      conditional,

      hitMode,

      buildIds,
      buildTcIds,
      optConfigId,
    } = obj as Loadout
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

  new(key: CharacterKey, data: Partial<Loadout> = {}): string {
    const optConfigId = this.database.optConfigs.new()
    const id = this.generateKey()
    this.set(id, { key, optConfigId, ...data })
    return id
  }
  override remove(loadoutId: string, notify?: boolean): Loadout | undefined {
    const rem = super.remove(loadoutId, notify)
    if (!rem) return
    const { optConfigId, buildIds, buildTcIds } = rem
    this.database.optConfigs.remove(optConfigId)
    this.database.teams.keys.forEach((teamId) => {
      if (
        this.database.teams
          .get(teamId)!
          .loadoutMetadata.some(
            (loadoutMetadatum) => loadoutMetadatum?.loadoutId === loadoutId
          )
      )
        this.database.teams.set(teamId, {}) // use validator to remove loadoutId entries
    })

    buildIds.forEach((buildId) => this.database.builds.remove(buildId))
    buildTcIds.forEach((buildTcId) => this.database.buildTcs.remove(buildTcId))
    return rem
  }
  override clear(): void {
    super.clear()
  }
  duplicate(teamcharId: string): string {
    const loadoutRaw = this.get(teamcharId)
    if (!loadoutRaw) return ''
    const loadout = deepClone(loadoutRaw)

    loadout.buildIds = loadout.buildIds.map((buildId) =>
      this.database.builds.duplicate(buildId)
    )

    loadout.buildTcIds = loadout.buildTcIds.map((buildTcId) =>
      this.database.buildTcs.duplicate(buildTcId)
    )

    loadout.optConfigId = this.database.optConfigs.duplicate(
      loadout.optConfigId
    )
    loadout.name = `${loadout.name} (duplicated)`
    return this.new(loadout.key, loadout)
  }
  newBuild(loadoutId: string, build: Partial<Build> = {}) {
    if (!this.get(loadoutId)) return

    const buildId = this.database.builds.new(build)
    if (!buildId) return
    this.set(loadoutId, (loadout) => {
      loadout.buildIds.unshift(buildId)
    })
  }
  newBuildTc(loadoutId: string, data: Partial<IBuildTc> = {}) {
    if (!this.get(loadoutId)) return

    const buildTcId = this.database.buildTcs.new(data)
    if (!buildTcId) return
    this.set(loadoutId, (loadout) => {
      loadout.buildTcIds.unshift(buildTcId)
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
    this.set(teamcharId, (loadout) => {
      loadout.buildTcIds.unshift(buildTcId)
    })
    return buildTcId
  }

  export(loadoutId: string): object {
    const loadout = this.database.loadouts.get(loadoutId)
    if (!loadout) return {}
    const { buildIds, buildTcIds, optConfigId, ...rest } = loadout
    return {
      ...rest,
      buildTcs: buildTcIds.map((buildTcId) =>
        this.database.buildTcs.export(buildTcId)
      ),
      optConfig: this.database.optConfigs.export(optConfigId),
    }
  }
  import(data: object): string {
    const { buildTcs, optConfig, ...rest } = data as Loadout & {
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
  followChar(loadoutId: string, callback: DataManagerCallback<CharacterKey>) {
    const loadout = this.database.loadouts.get(loadoutId)
    if (!loadout) return () => {}
    return this.database.chars.follow(loadout.key, callback)
  }
}
