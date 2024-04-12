import type { DataManagerCallback } from '@genshin-optimizer/common/database'
import { deepClone } from '@genshin-optimizer/common/util'
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
  type MultiOptHitModeKey,
} from '@genshin-optimizer/gi/consts'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import type { BuildTc, ICachedArtifact, ICachedWeapon } from '../../Interfaces'
import type { InputPremodKey } from '../../legacy/keys'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { Build } from './BuildDataManager'
import { initCharTC, toBuildTc } from './BuildTcDataManager'
import { validateCustomMultiTarget } from './CustomMultiTarget'
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

export interface CustomTarget {
  weight: number
  path: string[]
  hitMode: MultiOptHitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElementKey
  bonusStats: Partial<Record<InputPremodKey, number>>
}

export const BinaryOperations = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
] as const
export type BinaryOperation = (typeof BinaryOperations)[number]

export const EnclosingOperations = [
  'minimum',
  'maximum',
  'average',
  'grouping',
] as const
export type EnclosingOperation = (typeof EnclosingOperations)[number]

export const NonenclosingOperations = [...BinaryOperations] as const
export type NonenclosingOperation = (typeof NonenclosingOperations)[number]

export const ExpressionOperations = [
  ...NonenclosingOperations,
  ...EnclosingOperations,
] as const
export type ExpressionOperation = (typeof ExpressionOperations)[number]

export const ExpressionUnitTypes = [
  'constant',
  'target',
  'operation',
  'enclosing',
  'null',
] as const
export type ExpressionUnitType = (typeof ExpressionUnitTypes)[number]

export type ExpressionUnit =
  | ConstantUnit
  | TargetUnit
  | OperationUnit
  | EnclosingUnit
  | NullUnit

export interface ConstantUnit {
  type: 'constant'
  value: number
}

export interface TargetUnit {
  type: 'target'
  target: CustomTarget
}

export interface OperationUnit {
  type: 'operation'
  operation: NonenclosingOperation
}

export type EnclosingUnit =
  | EnclosingUnitHead
  | EnclosingUnitComma
  | EnclosingUnitTail

export interface EnclosingUnitHead {
  type: 'enclosing'
  operation: EnclosingOperation
  part: 'head'
}

export interface EnclosingUnitComma {
  type: 'enclosing'
  part: 'comma'
}

export interface EnclosingUnitTail {
  type: 'enclosing'
  part: 'tail'
}

export interface NullUnit {
  type: 'null'
  kind: 'operand' | 'operation'
}

export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
  expression?: ExpressionUnit[]
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
    arts: Array<ICachedArtifact | undefined> = []
  ): string | undefined {
    if (!this.get(teamcharId)) return undefined
    const buildTc = initCharTC(
      weapon?.key ?? defaultInitialWeaponKey(weaponTypeKey)
    )
    toBuildTc(buildTc, weapon, arts)
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
