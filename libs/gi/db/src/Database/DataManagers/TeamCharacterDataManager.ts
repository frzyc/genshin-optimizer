import type { DataManagerCallback } from '@genshin-optimizer/common/database'
import { deepClone, objKeyMap, objMap } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  HitModeKey,
  WeaponKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import {
  allAdditiveReactions,
  allAmpReactionKeys,
  allArtifactSlotKeys,
  allCharacterKeys,
  allHitModeKeys,
  allInfusionAuraElementKeys,
  charKeyToLocCharKey,
  type AdditiveReactionKey,
  type AmpReactionKey,
  type CharacterKey,
  type InfusionAuraElementKey,
  type MultiOptHitModeKey,
} from '@genshin-optimizer/gi/consts'
import { getCharData } from '@genshin-optimizer/gi/stats'
import type { BuildTc, ICachedArtifact, ICachedWeapon } from '../../Interfaces'
import type { InputPremodKey } from '../../legacy/keys'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { Build } from './BuildDataManager'
import { initCharTC, toBuildTc } from './BuildTcDataManager'
import { validateCustomMultiTarget } from './CustomMultiTarget'
import {
  defaultInitialWeapon,
  defaultInitialWeaponKey,
  initialWeapon,
} from './WeaponDataManager'
const buildTypeKeys = ['equipped', 'real', 'tc'] as const
type buildTypeKey = (typeof buildTypeKeys)[number]
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

  buildType: buildTypeKey
  buildId: string
  buildIds: string[]
  buildTcId: string
  buildTcIds: string[]
  optConfigId: string

  compare: boolean
  compareType: buildTypeKey
  compareBuildId: string
  compareBuildTcId: string
}

export interface CustomTarget {
  weight: number
  path: string[]
  hitMode: MultiOptHitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElementKey
  bonusStats: Partial<Record<InputPremodKey, number>>
}
export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
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

      buildType,
      buildId,
      buildIds,
      buildTcId,
      buildTcIds,
      optConfigId,

      compare,
      compareType,
      compareBuildId,
      compareBuildTcId,
    } = obj as TeamCharacter
    if (!allCharacterKeys.includes(characterKey)) return undefined // non-recoverable

    if (typeof name !== 'string') name = this.newName(characterKey)

    if (typeof description !== 'string') description = 'Loadout Description'

    // create a character if it doesnt exist
    if (!this.database.chars.keys.includes(characterKey))
      this.database.chars.getWithInitWeapon(characterKey)
    if (!customMultiTargets) customMultiTargets = []
    customMultiTargets = customMultiTargets
      .map((cmt) => validateCustomMultiTarget(cmt))
      .filter((t) => t) as CustomMultiTarget[]

    if (!conditional) conditional = {}

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

    if (!buildTypeKeys.includes(buildType)) buildType = 'equipped'

    if (
      typeof buildId !== 'string' ||
      !this.database.builds.keys.includes(buildId)
    )
      buildId = ''
    if (!Array.isArray(buildIds)) buildIds = []
    buildIds = buildIds.filter((buildId) =>
      this.database.builds.keys.includes(buildId)
    )

    if (
      typeof buildTcId !== 'string' ||
      !this.database.buildTcs.keys.includes(buildTcId)
    )
      buildTcId = ''
    if (!Array.isArray(buildTcIds)) buildTcIds = []
    buildTcIds = buildTcIds.filter((buildTcId) =>
      this.database.buildTcs.keys.includes(buildTcId)
    )
    if (
      (!buildId && !buildTcId) ||
      (buildType === 'real' && !buildId) ||
      (buildType === 'tc' && !buildTcId)
    )
      buildType = 'equipped'

    if (!optConfigId || !this.database.optConfigs.keys.includes(optConfigId))
      optConfigId = this.database.optConfigs.new()

    if (typeof compare !== 'boolean') compare = false
    if (!buildTypeKeys.includes(compareType)) compareType = 'equipped'

    if (
      typeof compareBuildId !== 'string' ||
      !buildIds.includes(compareBuildId) ||
      !this.database.builds.get(compareBuildId)?.weaponId
    ) {
      compareBuildId = ''
      if (compareType === 'real') compareType = 'equipped'
    }

    if (
      typeof compareBuildTcId !== 'string' ||
      !buildTcIds.includes(compareBuildTcId)
    ) {
      compareBuildTcId = ''
      if (compareType === 'tc') compareType = 'equipped'
    }

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
      buildType,
      buildId,
      buildIds,
      buildTcId,
      buildTcIds,
      optConfigId,
      compare,
      compareType,
      compareBuildId,
      compareBuildTcId,
    }
  }

  new(key: CharacterKey, data: Partial<TeamCharacter> = {}): string {
    const optConfigId = this.database.optConfigs.new()
    const id = this.generateKey()
    this.set(id, { key, optConfigId, ...data })
    return id
  }
  override remove(key: string, notify?: boolean): TeamCharacter | undefined {
    const rem = super.remove(key, notify)
    if (!rem) return
    const { optConfigId, buildIds, buildTcIds } = rem
    this.database.optConfigs.remove(optConfigId)
    this.database.teams.keys.forEach((teamId) => {
      if (this.database.teams.get(teamId)!.teamCharIds.includes(key))
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
    const buildIdInd = teamChar.buildIds.findIndex(
      (buildId) => buildId === teamChar.buildId
    )
    teamChar.buildIds = teamChar.buildIds.map((buildId) =>
      this.database.builds.duplicate(buildId)
    )
    if (buildIdInd >= 0) teamChar.buildId = teamChar.buildIds[buildIdInd]

    const buildTcIdInd = teamChar.buildTcIds.findIndex(
      (buildTcId) => buildTcId === teamChar.buildTcId
    )
    teamChar.buildTcIds = teamChar.buildTcIds.map((buildTcId) =>
      this.database.buildTcs.duplicate(buildTcId)
    )
    if (buildTcIdInd >= 0)
      teamChar.buildTcId = teamChar.buildTcIds[buildTcIdInd]

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
      const weaponTypeKey = getCharData(teamChar.key).weaponType
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
      teamChar.buildIds.unshift(buildTcId)
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
  /**
   *
   * @param teamCharId
   * @returns a ICached weapon, because in WR a lack of a weapon can have strange effects
   */
  getLoadoutWeapon(teamCharId: string): ICachedWeapon {
    const teamChar = this.get(teamCharId)
    if (!teamChar) return defaultInitialWeapon()
    const { key: characterKey, buildType, buildId, buildTcId } = teamChar
    switch (buildType) {
      case 'equipped': {
        const char = this.database.chars.get(characterKey)
        if (!char) return defaultInitialWeapon()
        return (
          this.database.weapons.get(char.equippedWeapon) ??
          defaultInitialWeapon()
        )
      }
      case 'real': {
        const build = this.database.builds.get(buildId)
        if (!build) return defaultInitialWeapon()
        return (
          this.database.weapons.get(build.weaponId) ?? defaultInitialWeapon()
        )
      }
      case 'tc': {
        const buildTc = this.database.buildTcs.get(buildTcId)
        if (!buildTc) return defaultInitialWeapon()
        return {
          ...buildTc.weapon,
          location: charKeyToLocCharKey(teamChar.key),
          lock: false,
          id: 'invalid',
        }
      }
    }
    return defaultInitialWeapon()
  }

  /**
   * Note: this doesnt return any artifacts(all undefined) when the current teamchar is using a TC Build.
   */
  getLoadoutArtifacts(
    teamCharId: string
  ): Record<ArtifactSlotKey, ICachedArtifact | undefined> {
    const teamChar = this.get(teamCharId)
    if (!teamChar) return objKeyMap(allArtifactSlotKeys, () => undefined)
    const { key: characterKey, buildType, buildId } = teamChar
    switch (buildType) {
      case 'equipped': {
        const char = this.database.chars.get(characterKey)
        if (!char) return objKeyMap(allArtifactSlotKeys, () => undefined)
        return objMap(char.equippedArtifacts, (id) =>
          this.database.arts.get(id)
        )
      }
      case 'real': {
        const build = this.database.builds.get(buildId)
        if (!build) return objKeyMap(allArtifactSlotKeys, () => undefined)
        return objMap(build.artifactIds, (id) => this.database.arts.get(id))
      }
    }
    return objKeyMap(allArtifactSlotKeys, () => undefined)
  }
  export(teamCharId: string): object {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return {}
    const {
      buildType,
      buildId,
      buildIds,
      buildTcId,
      buildTcIds,
      optConfigId,
      compareType,
      compareBuildId: comareBuildId,
      compareBuildTcId,
      ...rest
    } = teamChar
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
  followBuild(teamCharId: string, callback: () => void) {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return () => {}
    // in the case of buildType ==='equipped', that is covered by following the char with `followChar`
    if (teamChar.buildType === 'real') {
      const build = this.database.builds.get(teamChar.buildId)
      if (!build) return () => {}
      const unfollowBuild = this.database.builds.follow(
        teamChar.buildId,
        callback
      )
      const unfollowWeapon = build.weaponId
        ? this.database.weapons.follow(build.weaponId, callback)
        : () => {}
      const unfollowArts = Object.values(build.artifactIds).map((id) =>
        id ? this.database.arts.follow(id, callback) : () => {}
      )
      return () => {
        unfollowBuild()
        unfollowWeapon()
        unfollowArts.forEach((unfollow) => unfollow())
      }
    } else if (teamChar.buildType === 'tc')
      return this.database.buildTcs.follow(teamChar.buildTcId, callback)
    return () => {}
  }
  followCompareBuild(teamCharId: string, callback: () => void) {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return () => {}
    if (!teamChar.compare) return () => {}
    // in the case of teamChar.compareType ==='equipped', that is covered by following the char with `followChar`
    if (teamChar.compareType === 'real') {
      const build = this.database.builds.get(teamChar.compareBuildId)
      if (!build) return () => {}
      const unfollowBuild = this.database.builds.follow(
        teamChar.compareBuildId,
        callback
      )
      const unfollowWeapon = build.weaponId
        ? this.database.weapons.follow(build.weaponId, callback)
        : () => {}
      const unfollowArts = Object.values(build.artifactIds).map((id) =>
        id ? this.database.arts.follow(id, callback) : () => {}
      )
      return () => {
        unfollowBuild()
        unfollowWeapon()
        unfollowArts.forEach((unfollow) => unfollow())
      }
    } else if (teamChar.buildType === 'tc')
      return this.database.buildTcs.follow(teamChar.compareBuildTcId, callback)
    return () => {}
  }
  getActiveBuildName(teamCharId: string, equippedName = 'Equipped Build') {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return
    const { buildType, buildId, buildTcId } = teamChar
    switch (buildType) {
      case 'equipped':
        return equippedName
      case 'real':
        return this.database.builds.get(buildId)?.name ?? ''
      case 'tc':
        return this.database.buildTcs.get(buildTcId)?.name ?? ''
    }
  }
}
