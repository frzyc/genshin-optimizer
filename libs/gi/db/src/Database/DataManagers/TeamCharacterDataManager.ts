import type { DataManagerCallback } from '@genshin-optimizer/common/database'
import { deepClone, notEmpty } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  HitModeKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  type AdditiveReactionKey,
  type AmpReactionKey,
  allAdditiveReactions,
  allAmpReactionKeys,
  allCharacterKeys,
  allHitModeKeys,
  allInfusionAuraElementKeys,
  type CharacterKey,
  type InfusionAuraElementKey,
} from '@genshin-optimizer/gi/consts'
import type { IGOOD } from '@genshin-optimizer/gi/good'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import type { InputPremodKey } from '@genshin-optimizer/gi/wr-types'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { IGO, ImportResult } from '../exim'
import { initCharTC, toBuildTc } from './BuildTcDataManager'
import type { CustomMultiTarget } from './CustomMultiTarget'
import { validateCustomMultiTarget } from './CustomMultiTarget'
import type { LoadoutExportSetting } from './TeamDataManager'
import { defaultInitialWeaponKey } from './WeaponDataManager'

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

      customMultiTargets,
      conditional,
      bonusStats,
      infusionAura,

      hitMode,
      reaction,

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

    // Resonance/reaction conditionals have been moved to teams
    if ((conditional as any)['resonance'])
      delete (conditional as any)['resonance']
    if ((conditional as any)['reaction'])
      delete (conditional as any)['reaction']

    // TODO: validate bonusStats
    if (
      typeof bonusStats !== 'object' ||
      !Object.entries(bonusStats).map(([_, num]) => typeof num === 'number')
    )
      bonusStats = {}

    if (
      infusionAura &&
      !allInfusionAuraElementKeys.includes(
        infusionAura as InfusionAuraElementKey
      )
    )
      infusionAura = undefined

    if (!allHitModeKeys.includes(hitMode)) hitMode = 'avgHit'
    if (
      reaction &&
      !validReactionKeys.includes(
        reaction as (typeof validReactionKeys)[number]
      )
    )
      reaction = undefined

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
    const { optConfigId } = rem
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

    return rem
  }
  override clear(): void {
    super.clear()
  }
  duplicate(teamcharId: string): string {
    const teamCharRaw = this.get(teamcharId)
    if (!teamCharRaw) return ''
    const teamChar = deepClone(teamCharRaw)

    teamChar.optConfigId = this.database.optConfigs.duplicate(
      teamChar.optConfigId
    )
    teamChar.name = `${teamChar.name} (duplicated)`
    return this.new(teamChar.key, teamChar)
  }
  export(teamCharId: string, settings: LoadoutExportSetting): object {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return {}
    const { optConfigId, customMultiTargets, ...rest } = teamChar
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
        this.database.arts.get(id)
      )
      const buildTC = toBuildTc(
        initCharTC(teamChar.key, defaultInitialWeaponKey(weaponType)),
        weapon,
        arts
      )
      buildTC.name = 'Equipped(Converted)'
      buildTC.description = 'Converted from Equipped'
      return buildTC
    }
    const convertedBuilds = convertbuilds
      .filter(
        (id) => this.database.builds.get(id)?.characterKey === teamChar.key
      )
      .map((buildId) => {
        const build = this.database.builds.get(buildId)
        if (!build) return
        const { name, description, weaponId, artifactIds } = build
        const weapon = this.database.weapons.get(weaponId)
        const arts = Object.values(artifactIds).map((id) =>
          this.database.arts.get(id)
        )
        const buildTC = toBuildTc(
          initCharTC(teamChar.key, defaultInitialWeaponKey(weaponType)),
          weapon,
          arts
        )
        buildTC.name = name
        buildTC.description = description
        return buildTC
      })
    const convertedTcBuilds = convertTcBuilds
      .filter(
        (id) => this.database.buildTcs.get(id)?.characterKey === teamChar.key
      )
      .map((buildTcId) => this.database.buildTcs.export(buildTcId))

    let overrideOptTarget: string[] | undefined
    if (optimizationTarget?.[0] === 'custom') {
      const ind = Number.parseInt(optimizationTarget[1])
      if (!Number.isNaN(ind)) {
        const newInd = exportCustomMultiTarget.indexOf(ind)
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
        exportCustomMultiTarget.includes(i)
      ),
      optConfig: this.database.optConfigs.export(
        optConfigId,
        overrideOptTarget
      ),
    }
  }
  import(data: object): string {
    const { buildTcs, optConfig, ...rest } = data as TeamCharacter & {
      buildTcs: object[]
      optConfig: object
    }
    const id = this.generateKey()
    const { key: characterKey } = rest

    if (
      !this.set(id, {
        ...rest,
        optConfigId: this.database.optConfigs.import(optConfig),
      })
    )
      return ''

    buildTcs?.forEach((obj) =>
      this.database.buildTcs.import({ ...obj, characterKey })
    )
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
