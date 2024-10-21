import {
  objKeyMap,
  objMap,
  pruneOrPadArray,
  range,
} from '@genshin-optimizer/common/util'
import type { CharacterKey, RelicSlotKey } from '@genshin-optimizer/sr/consts'
import {
  allCharacterKeys,
  allRelicSlotKeys,
} from '@genshin-optimizer/sr/consts'
import type { Member, Read, Sheet, Tag } from '@genshin-optimizer/sr/formula'
import type { ICachedRelic } from '../../Interfaces'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

const buildTypeKeys = ['equipped', 'real', 'tc'] as const
type BuildTypeKey = (typeof buildTypeKeys)[number]
export type ComboMetaDataum = {
  characterKey: CharacterKey

  buildType: BuildTypeKey
  buildId: string
  buildTcId: string
  compare: boolean
  compareType: BuildTypeKey
  compareBuildId: string
  compareBuildTcId: string
}
export interface Combo {
  name: string
  description: string

  lastEdit: number

  // frames, store data as a "sparse 2d array"
  frames: Array<Read>
  conditionals: Array<{
    sheet: Sheet
    src: Member | 'all'
    dst: Member | 'all'
    condKey: string
    condValues: number[] // should be the same length as `frames`
  }>
  bonusStats: Array<{
    tag: Tag
    values: number[] // should be the same length as `frames`
  }>
  statConstraints: Array<{ read: Read; values: number[]; isMaxs: boolean[] }>

  // TODO enemy base stats
  comboMetadata: Array<ComboMetaDataum | undefined>
}

export class ComboDataManager extends DataManager<
  string,
  'combos',
  Combo,
  Combo
> {
  constructor(database: SroDatabase) {
    super(database, 'combos')
  }
  newName() {
    const existing = this.values
    for (let num = existing.length + 1; num <= existing.length * 2; num++) {
      const name = `Combo Name ${num}`
      if (existing.some((tc) => tc.name !== name)) return name
    }
    return `Combo Name`
  }
  override validate(obj: unknown): Combo | undefined {
    let {
      name,
      description,
      comboMetadata,
      lastEdit,
      frames,
      conditionals: conditional,
      bonusStats,
      statConstraints,
    } = obj as Combo
    if (typeof name !== 'string') name = this.newName()
    if (typeof description !== 'string') description = ''

    // Validate comboMetadata
    {
      // validate loadoutIds
      if (!Array.isArray(comboMetadata))
        comboMetadata = range(0, 3).map(() => undefined)

      comboMetadata = range(0, 3).map((ind) => {
        const comboMetadatum = comboMetadata[ind]
        if (!comboMetadatum || typeof comboMetadatum !== 'object')
          return undefined
        const { characterKey } = comboMetadatum
        let {
          buildType,
          buildId,
          buildTcId,
          compare,
          compareType,
          compareBuildId,
          compareBuildTcId,
        } = comboMetadatum

        if (!allCharacterKeys.includes(characterKey)) return undefined
        if (!buildTypeKeys.includes(buildType)) buildType = 'equipped'
        if (
          typeof buildId !== 'string' ||
          !this.database.builds.keys.includes(buildId)
        )
          buildId = ''

        if (
          typeof buildTcId !== 'string' ||
          !this.database.buildTcs.keys.includes(buildTcId)
        )
          buildTcId = ''

        if (
          (!buildId && !buildTcId) ||
          (buildType === 'real' && !buildId) ||
          (buildType === 'tc' && !buildTcId)
        )
          buildType = 'equipped'

        if (typeof compare !== 'boolean') compare = false
        if (!buildTypeKeys.includes(compareType)) compareType = 'equipped'

        if (
          typeof compareBuildId !== 'string' ||
          !this.database.builds.keys.includes(compareBuildId)
        ) {
          compareBuildId = ''
          if (compareType === 'real') compareType = 'equipped'
        }

        if (
          typeof compareBuildTcId !== 'string' ||
          !this.database.buildTcs.keys.includes(compareBuildTcId)
        ) {
          compareBuildTcId = ''
          if (compareType === 'tc') compareType = 'equipped'
        }

        return {
          characterKey,
          buildType,
          buildId,
          buildTcId,
          compare,
          compareType,
          compareBuildId,
          compareBuildTcId,
        } as ComboMetaDataum
      })
    }

    if (typeof lastEdit !== 'number') lastEdit = Date.now()

    if (!Array.isArray(frames)) frames = []
    const framesLength = frames.length
    if (!framesLength) {
      conditional = []
      bonusStats = []
    } else {
      if (!Array.isArray(conditional)) conditional = []
      if (!Array.isArray(bonusStats)) bonusStats = []
      if (!Array.isArray(statConstraints)) statConstraints = []
      conditional = conditional.filter(({ condValues }) => {
        // TODO: validate conditionals src dst condKey
        if (!Array.isArray(condValues)) return false
        pruneOrPadArray(condValues, framesLength, 0)
        // If all values are false, remove the conditional
        if (condValues.every((v) => !v)) return false
        return true
      })
      bonusStats = bonusStats.filter(({ values }) => {
        // TODO: validate bonusStats tag
        if (!Array.isArray(values)) return false
        pruneOrPadArray(values, framesLength, 0)
        return true
      })

      statConstraints = statConstraints.filter(({ values, isMaxs }) => {
        // TODO: validate statConstraints read
        if (!Array.isArray(values)) return false
        pruneOrPadArray(values, framesLength, 0)
        if (!Array.isArray(isMaxs)) return false
        pruneOrPadArray(isMaxs, framesLength, false)
        return true
      })
    }
    // TODO: validate frames

    // TODO: validate bonusStats

    return {
      name,
      description,
      comboMetadata: comboMetadata,
      lastEdit,
      frames,
      conditionals: conditional,
      bonusStats,
      statConstraints,
    }
  }

  new(value: Partial<Combo> = {}): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override clear(): void {
    super.clear()
  }

  //TODO: dup + i/o
  // duplicate(teamId: string): string {
  //   const teamRaw = this.database.teams.get(teamId)
  //   if (!teamRaw) return ''
  //   const team = deepClone(teamRaw)
  //   team.name = `${team.name} (duplicated)`
  //   return this.new(team)
  // }
  // export(teamId: string): object {
  //   const team = this.database.teams.get(teamId)
  //   if (!team) return {}
  //   const { loadoutMetadata, ...rest } = team
  //   return {
  //     ...rest,
  //     loadoutMetadata: loadoutMetadata.map(
  //       (loadoutMetadatum) =>
  //         loadoutMetadatum?.loadoutId &&
  //         this.database.loadouts.export(loadoutMetadatum?.loadoutId)
  //     ),
  //   }
  // }
  // import(data: object): string {
  //   const { comboMetadata: loadoutMetadata, ...rest } = data as Combo & {
  //     loadoutMetadata: object[]
  //   }
  //   const id = this.generateKey()
  //   if (
  //     !this.set(id, {
  //       ...rest,
  //       name: `${rest.name ?? ''} (Imported)`,
  //       comboMetadata: loadoutMetadata.map(
  //         (obj) =>
  //           obj && {
  //             loadoutId: this.database.loadouts.import(obj),
  //           }
  //       ),
  //     } as Combo)
  //   )
  //     return ''
  //   return id
  // }

  /**
   * Note: this doesnt return any relics (all undefined) when the current teamchar is using a TC Build.
   */
  getComboRelics({
    characterKey,
    buildType,
    buildId,
  }: ComboMetaDataum): Record<RelicSlotKey, ICachedRelic | undefined> {
    switch (buildType) {
      case 'equipped': {
        const char = this.database.chars.get(characterKey)
        if (!char) return objKeyMap(allRelicSlotKeys, () => undefined)
        return objMap(char.equippedRelics, (id) => this.database.relics.get(id))
      }
      case 'real': {
        const build = this.database.builds.get(buildId)
        if (!build) return objKeyMap(allRelicSlotKeys, () => undefined)
        return objMap(build.relicIds, (id) => this.database.relics.get(id))
      }
    }
    return objKeyMap(allRelicSlotKeys, () => undefined)
  }

  followComboDatum(
    { buildType, buildId, buildTcId }: ComboMetaDataum,
    callback: () => void
  ) {
    if (buildType === 'real') {
      const build = this.database.builds.get(buildId)
      if (!build) return () => {}
      const unfollowBuild = this.database.builds.follow(buildId, callback)
      const unfollowLightCone = build.lightConeId
        ? this.database.lightCones.follow(build.lightConeId, callback)
        : () => {}
      const unfollowRelics = Object.values(build.relicIds).map((id) =>
        id ? this.database.relics.follow(id, callback) : () => {}
      )
      return () => {
        unfollowBuild()
        unfollowLightCone()
        unfollowRelics.forEach((unfollow) => unfollow())
      }
    } else if (buildType === 'tc')
      return this.database.buildTcs.follow(buildTcId, callback)
    return () => {}
  }
  followComboDatumCompare(
    { compareType, compareBuildId, compareBuildTcId }: ComboMetaDataum,
    callback: () => void
  ) {
    if (compareType === 'real') {
      const build = this.database.builds.get(compareBuildId)
      if (!build) return () => {}
      const unfollowBuild = this.database.builds.follow(
        compareBuildId,
        callback
      )
      const unfollowLightCone = build.lightConeId
        ? this.database.lightCones.follow(build.lightConeId, callback)
        : () => {}
      const unfollowRelics = Object.values(build.relicIds).map((id) =>
        id ? this.database.relics.follow(id, callback) : () => {}
      )
      return () => {
        unfollowBuild()
        unfollowLightCone()
        unfollowRelics.forEach((unfollow) => unfollow())
      }
    } else if (compareType === 'tc')
      return this.database.buildTcs.follow(compareBuildTcId, callback)
    return () => {}
  }
  getActiveBuildName(
    { buildType, buildId, buildTcId }: ComboMetaDataum,
    equippedName = 'Equipped Build'
  ) {
    switch (buildType) {
      case 'equipped':
        return equippedName
      case 'real':
        return this.database.builds.get(buildId)?.name ?? ''
      case 'tc':
        return this.database.buildTcs.get(buildTcId)?.name ?? ''
    }
  }

  setConditional(
    comboId: string,
    sheet: Sheet,
    src: Member | 'all',
    dst: Member | 'all',
    condKey: string,
    condValue: number,
    frameIndex: number
  ) {
    this.set(comboId, (combo) => {
      const condIndex = combo.conditionals.findIndex(
        (c) => c.src === src && c.dst === dst && c.condKey === condKey
      )
      if (frameIndex > combo.frames.length) return
      if (condIndex === -1) {
        const condValues = new Array(combo.frames.length).fill(0)
        condValues[frameIndex] = condValue
        combo.conditionals.push({
          sheet,
          src,
          dst,
          condKey,
          condValues,
        })
      } else {
        combo.conditionals[condIndex].condValues[frameIndex] = condValue
      }
    })
  }
  /**
   *
   * @param comboId
   * @param tag
   * @param value number or null, null to delete
   * @param frameIndex
   */
  setBonusStat(
    comboId: string,
    tag: Tag,
    value: number | null,
    frameIndex: number
  ) {
    this.set(comboId, (combo) => {
      if (frameIndex > combo.frames.length) return
      //TODO: quick and dirty tag comparasion
      const statIndex = combo.bonusStats.findIndex(
        (s) => JSON.stringify(s.tag) === JSON.stringify(tag)
      )
      if (statIndex === -1 && value !== null) {
        const values = new Array(combo.frames.length).fill(0)
        values[frameIndex] = value
        combo.bonusStats.push({ tag, values })
      } else if (value === null && statIndex > -1) {
        combo.bonusStats.splice(statIndex, 1)
      } else if (value !== null && statIndex > -1) {
        combo.bonusStats[statIndex].values[frameIndex] = value
      }
    })
  }
  /**
   *
   * @param comboId
   * @param read
   * @param value number or null, null to delete
   * @param isMax
   * @param frameIndex
   */
  setStatConstraint(
    comboId: string,
    read: Read,
    value: number | null,
    isMax: boolean,
    frameIndex: number
  ) {
    this.set(comboId, (combo) => {
      if (frameIndex > combo.frames.length) return
      const statIndex = combo.statConstraints.findIndex((s) => s.read === read)
      if (statIndex === -1 && value !== null) {
        const values = new Array(combo.frames.length).fill(0)
        values[frameIndex] = value
        const isMaxs = new Array(combo.frames.length).fill(false)
        isMaxs[frameIndex] = isMax
        combo.statConstraints.push({ read, values, isMaxs })
      } else if (value === null && statIndex > -1) {
        combo.statConstraints.splice(statIndex, 1)
      } else if (value !== null && statIndex > -1) {
        combo.statConstraints[statIndex].values[frameIndex] = value
        combo.statConstraints[statIndex].isMaxs[frameIndex] = isMax
      }
    })
  }
}
