import type { DataManagerCallback } from '@genshin-optimizer/common/database'
import { deepClone, notEmpty } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  HitModeKey,
  WeaponKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import {
  allAdditiveReactions,
  allAmpReactionKeys,
  allCharacterKeys,
  allHitModeKeys,
  allInfusionAuraElementKeys,
  type AdditiveReactionKey,
  type AmpReactionKey,
  type CharacterKey,
  type InfusionAuraElementKey,
} from '@genshin-optimizer/gi/consts'
import type { IGOOD } from '@genshin-optimizer/gi/good'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import type {
  BuildTc,
  CustomMultiTarget,
  ICachedArtifact,
  ICachedWeapon,
} from '../../Interfaces'
import type { InputPremodKey } from '../../legacy/keys'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { IGO, ImportResult } from '../exim'
import type { Build } from './BuildDataManager'
import { initCharTC, toBuildTc } from './BuildTcDataManager'
import { validateCustomMultiTarget } from './CustomMultiTarget'
import type { LoadoutExportSetting } from './TeamDataManager'
import { defaultInitialWeaponKey, initialWeapon } from './WeaponDataManager'

type CondKey = CharacterKey | ArtifactSetKey | WeaponKey
export type IConditionalValues = Partial<
  Record<CondKey, { [key: string]: string }>
>
const validReactionKeys = [
  ...allAmpReactionKeys,
  ...allAdditiveReactions,
] as const
export interface TeamCharacter {
  key: CharacterKey

  name: string
  description: string

  customMultiTargets: CustomMultiTarget[]
  conditional: IConditionalValues

  bonusStats: Partial<Record<InputPremodKey, number>>
  infusionAura?: InfusionAuraElementKey | ''

  hitMode: HitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey

  buildIds: string[]

  buildTcIds: string[]
  optConfigId: string
}

export class TeamCharacterDataManager extends DataManager<
  string,
  'teamchars',
  TeamCharacter,
  TeamCharacter,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'teamchars')
    for (const key of this.database.storage.keys)
      if (key.startsWith('teamchar_') && !this.set(key, {}))
        this.database.storage.remove(key)

    // Since this and optConfig have a 1:1 relationship, validate whether there are any orphaned optConfigs
    // const optConfigKeys = new Set(this.database.optConfigs.keys)
    // this.values.forEach(({ optConfigId }) => optConfigKeys.delete(optConfigId))
    // Array.from(optConfigKeys).forEach((optConfigId) =>
    //   this.database.optConfigs.remove(optConfigId)
    // )
  }
  newName(characterKey: CharacterKey) {
    const existingUndercKey = this.values.filter(
      ({ key }) => key === characterKey,
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

      customMultiTargets,
      conditional,
      bonusStats,
      infusionAura,

      hitMode,
      reaction,

      buildIds,
      buildTcIds,
      optConfigId,
    } = obj as TeamCharacter
    if (!allCharacterKeys.includes(characterKey)) return undefined // non-recoverable

    if (typeof name !== 'string') name = this.newName(characterKey)

    if (typeof description !== 'string') description = ''

    // create a character if it doesnt exist
    if (!this.database.chars.keys.includes(characterKey))
      this.database.chars.getWithInitWeapon(characterKey)
    if (!customMultiTargets) customMultiTargets = []
    customMultiTargets = customMultiTargets
      .map((cmt) => validateCustomMultiTarget(cmt))
      .filter((t) => t) as CustomMultiTarget[]

    if (!conditional) conditional = {}

    // Resonance conditionals have been moved to teams
    if ((conditional as any)['resonance'])
      delete (conditional as any)['resonance']

    // TODO: validate bonusStats
    if (
      typeof bonusStats !== 'object' ||
      !Object.entries(bonusStats).map(([_, num]) => typeof num === 'number')
    )
      bonusStats = {}

    if (
      infusionAura &&
      !allInfusionAuraElementKeys.includes(
        infusionAura as InfusionAuraElementKey,
      )
    )
      infusionAura = undefined

    if (!allHitModeKeys.includes(hitMode)) hitMode = 'avgHit'
    if (
      reaction &&
      !validReactionKeys.includes(
        reaction as (typeof validReactionKeys)[number],
      )
    )
      reaction = undefined

    if (!Array.isArray(buildIds)) buildIds = []
    buildIds = buildIds.filter((buildId) =>
      this.database.builds.keys.includes(buildId),
    )

    if (!Array.isArray(buildTcIds)) buildTcIds = []
    buildTcIds = buildTcIds.filter((buildTcId) =>
      this.database.buildTcs.keys.includes(buildTcId),
    )

    if (!optConfigId || !this.database.optConfigs.keys.includes(optConfigId))
      optConfigId = this.database.optConfigs.new()

    return {
      key: characterKey,
      name,
      description,
      customMultiTargets,
      conditional,
      bonusStats,
      infusionAura,
      hitMode,
      reaction,

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
    notify?: boolean,
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
            (loadoutDatum) => loadoutDatum?.teamCharId === teamCharId,
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
      this.database.builds.duplicate(buildId),
    )

    teamChar.buildTcIds = teamChar.buildTcIds.map((buildTcId) =>
      this.database.buildTcs.duplicate(buildTcId),
    )

    teamChar.optConfigId = this.database.optConfigs.duplicate(
      teamChar.optConfigId,
    )
    teamChar.name = `${teamChar.name} (duplicated)`
    return this.new(teamChar.key, teamChar)
  }
  newBuild(teamCharId: string, build: Partial<Build> = {}) {
    if (!this.get(teamCharId)) return

    // force the build to have a valid weapon
    if (!build.weaponId) {
      const teamChar = this.database.teamChars.get(teamCharId)
      if (!teamChar) return
      const weaponTypeKey = getCharStat(teamChar.key).weaponType
      const defWeaponKey = defaultInitialWeaponKey(weaponTypeKey)

      build.weaponId = this.database.weapons.keys.find((weaponId) => {
        const { key, location } = this.database.weapons.get(weaponId)!
        return !location && key === defWeaponKey
      })
      if (!build.weaponId)
        build.weaponId = this.database.weapons.new(initialWeapon(defWeaponKey))
    }

    const buildId = this.database.builds.new(build)
    if (!buildId) return
    this.set(teamCharId, (teamChar) => {
      teamChar.buildIds.unshift(buildId)
    })
  }
  newBuildTc(teamCharId: string, data: Partial<BuildTc> = {}) {
    if (!this.get(teamCharId)) return

    const buildTcId = this.database.buildTcs.new(data)
    if (!buildTcId) return
    this.set(teamCharId, (teamChar) => {
      teamChar.buildTcIds.unshift(buildTcId)
    })
  }
  newBuildTcFromBuild(
    teamcharId: string,
    weaponTypeKey: WeaponTypeKey,
    weapon?: ICachedWeapon,
    arts: Array<ICachedArtifact | undefined> = [],
  ): string | undefined {
    if (!this.get(teamcharId)) return undefined
    const buildTc = initCharTC(
      weapon?.key ?? defaultInitialWeaponKey(weaponTypeKey),
    )
    toBuildTc(buildTc, weapon, arts)
    const buildTcId = this.database.buildTcs.new(buildTc)
    if (!buildTcId) return undefined
    this.set(teamcharId, (teamChar) => {
      teamChar.buildTcIds.unshift(buildTcId)
    })
    return buildTcId
  }

  export(teamCharId: string, settings: LoadoutExportSetting): object {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return {}
    const { buildIds, buildTcIds, optConfigId, customMultiTargets, ...rest } =
      teamChar
    const { optimizationTarget } = this.database.optConfigs.get(optConfigId)!
    const { weaponType } = getCharStat(teamChar.key)
    const {
      convertEquipped,
      convertbuilds,
      convertTcBuilds,
      exportCustomMultiTarget,
    } = settings

    const equippedBuildToTCBuild = () => {
      const char = this.database.chars.get(teamChar.key)
      if (!char) return
      const { equippedArtifacts, equippedWeapon } = char
      const weapon = this.database.weapons.get(equippedWeapon)
      const arts = Object.values(equippedArtifacts).map((id) =>
        this.database.arts.get(id),
      )
      const buildTC = toBuildTc(
        initCharTC(defaultInitialWeaponKey(weaponType)),
        weapon,
        arts,
      )
      buildTC.name = 'Equipped(Converted)'
      buildTC.description = 'Converted from Equipped'
      return buildTC
    }
    const convertedBuilds = convertbuilds
      .filter((id) => buildIds.includes(id))
      .map((buildId) => {
        const build = this.database.builds.get(buildId)
        if (!build) return
        const { name, description, weaponId, artifactIds } = build
        const weapon = this.database.weapons.get(weaponId)
        const arts = Object.values(artifactIds).map((id) =>
          this.database.arts.get(id),
        )
        const buildTC = toBuildTc(
          initCharTC(defaultInitialWeaponKey(weaponType)),
          weapon,
          arts,
        )
        buildTC.name = name
        buildTC.description = description
        return buildTC
      })
    const convertedTcBuilds = convertTcBuilds
      .filter((id) => buildTcIds.includes(id))
      .map((buildTcId) => this.database.buildTcs.export(buildTcId))

    let overrideOptTarget: string[] | undefined = undefined
    if (optimizationTarget?.[0] === 'custom') {
      const ind = parseInt(optimizationTarget[1])
      if (!isNaN(ind)) {
        const newInd = exportCustomMultiTarget.findIndex((i) => i === ind)
        if (newInd !== -1) {
          overrideOptTarget = structuredClone(optimizationTarget)
          overrideOptTarget[1] = newInd.toString()
        }
      }
    }

    return {
      ...rest,
      buildTcs: [
        ...(convertEquipped ? [equippedBuildToTCBuild()] : []),
        ...convertedBuilds,
        ...convertedTcBuilds,
      ].filter(notEmpty),
      customMultiTargets: customMultiTargets.filter((_, i) =>
        exportCustomMultiTarget.includes(i),
      ),
      optConfig: this.database.optConfigs.export(
        optConfigId,
        overrideOptTarget,
      ),
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
  override importGOOD(good: IGOOD & IGO, result: ImportResult): void {
    result.teamChars.beforeImport = this.entries.length

    const loadouts = good[this.dataKey]
    if (loadouts && Array.isArray(loadouts)) {
      result.teamChars.import = loadouts.length
    }

    super.importGOOD(good, result)
  }
}
