import { clamp, objKeyMap, objMap } from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  MainStatKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allArtifactSlotKeys,
  allSubstatKeys,
  allWeaponKeys,
  artMaxLevel,
  substatTypeKeys,
  weaponMaxAscension,
  weaponMaxLevel,
} from '@genshin-optimizer/gi/consts'
import type { ICharacter, IGOOD } from '@genshin-optimizer/gi/good'
import { getWeaponStat } from '@genshin-optimizer/gi/stats'
import { validateLevelAsc, validateTalent } from '@genshin-optimizer/gi/util'
import type { ICachedArtifact, ICachedWeapon } from '../../Interfaces'
import type { BuildTc } from '../../Interfaces/BuildTc'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { IGO, ImportResult } from '../exim'

export class BuildTcDataManager extends DataManager<
  string,
  'buildTcs',
  BuildTc,
  BuildTc,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'buildTcs')
    for (const key of this.database.storage.keys) {
      if (key.startsWith('buildTc_') && !this.set(key, {}))
        database.storage.remove(key)
    }
  }
  override validate(obj: unknown): BuildTc | undefined {
    if (typeof obj !== 'object') return undefined
    let { name, description } = obj as BuildTc
    const { character, weapon, artifact, optimization } = obj as BuildTc
    const _character = validateBuildTCChar(character)
    if (typeof name !== 'string') name = 'Build(TC) Name'
    if (typeof description !== 'string') description = 'Build(TC) Description'
    const _weapon = validateBuildTCWeapon(weapon)
    if (!_weapon) return undefined

    const _artifact = validateBuildTCArtifact(artifact)
    if (!_artifact) return undefined
    const _optimization = validateBuildTcOptimization(optimization)
    if (!_optimization) return undefined
    return {
      name,
      description,
      character: _character,
      artifact: _artifact,
      weapon: _weapon,
      optimization: _optimization,
    }
  }
  new(data: Partial<BuildTc>) {
    const id = this.generateKey()
    this.set(id, data)
    return id
  }
  duplicate(buildTcId: string): string {
    const buildTc = this.get(buildTcId)
    if (!buildTc) return ''
    return this.new(structuredClone(buildTc))
  }
  override remove(key: string, notify?: boolean): BuildTc | undefined {
    const buildTc = super.remove(key, notify)
    // remove data from teamChar first
    this.database.teamChars.entries.forEach(
      ([teamCharId, teamChar]) =>
        teamChar.buildTcIds.includes(key) &&
        this.database.teamChars.set(teamCharId, {}),
    )
    // once teamChars are validated, teams can be validated as well
    this.database.teams.entries.forEach(
      ([teamId, team]) =>
        team.loadoutData?.some(
          (loadoutDatum) =>
            loadoutDatum?.buildTcId === key ||
            loadoutDatum?.compareBuildTcId === key,
        ) && this.database.teams.set(teamId, {}), // trigger a validation
    )

    return buildTc
  }
  export(buildTcId: string): object | undefined {
    const buildTc = this.database.buildTcs.get(buildTcId)
    if (!buildTc) return undefined
    return buildTc
  }
  import(data: object): string {
    const id = this.generateKey()
    if (!this.set(id, data)) return ''
    return id
  }
  override importGOOD(good: IGOOD & IGO, result: ImportResult): void {
    result.buildTcs.beforeImport = this.entries.length

    const buildTcs = good[this.dataKey]
    if (buildTcs && Array.isArray(buildTcs)) {
      result.buildTcs.import = buildTcs.length
    }

    super.importGOOD(good, result)
  }
}

export function initCharTC(weaponKey: WeaponKey): BuildTc {
  return {
    name: 'Build(TC) Name',
    description: 'Build(TC) Description',
    weapon: {
      key: weaponKey,
      level: 1,
      ascension: 0,
      refinement: 1,
    },
    artifact: {
      slots: initCharTCArtifactSlots(),
      substats: {
        type: 'max',
        stats: objKeyMap(allSubstatKeys, () => 0),
        rarity: 5,
      },
      sets: {},
    },
    optimization: {
      distributedSubstats: 45,
      maxSubstats: initBuildTcOptimizationMaxSubstats(),
    },
  }
}
function initCharTCArtifactSlots() {
  return objKeyMap(allArtifactSlotKeys, (s) => ({
    level: 20,
    rarity: 5 as ArtifactRarity,
    statKey: (s === 'flower'
      ? 'hp'
      : s === 'plume'
        ? 'atk'
        : 'atk_') as MainStatKey,
  }))
}
function validateBuildTCChar(char: unknown): BuildTc['character'] {
  if (typeof char !== 'object' || typeof char === 'undefined') return undefined
  const { level: rawLevel, ascension: rawAscension } = char as Omit<
    ICharacter,
    'key'
  >
  let { constellation, talent } = char as Omit<ICharacter, 'key'>
  if (
    typeof constellation !== 'number' &&
    constellation < 0 &&
    constellation > 6
  )
    constellation = 0

  const { level, ascension } = validateLevelAsc(rawLevel, rawAscension)
  talent = validateTalent(ascension, talent)

  return {
    level,
    ascension,
    talent,
    constellation,
  }
}
function validateBuildTCWeapon(weapon: unknown): BuildTc['weapon'] | undefined {
  if (typeof weapon !== 'object') return undefined
  const { key } = weapon as BuildTc['weapon']
  let { level, ascension, refinement } = weapon as BuildTc['weapon']

  if (!allWeaponKeys.includes(key)) return undefined
  const { rarity } = getWeaponStat(key)
  if (level > weaponMaxLevel[rarity]) {
    level = weaponMaxLevel[rarity]
    ascension = weaponMaxAscension[rarity]
  }
  if (typeof refinement !== 'number' || refinement < 1 || refinement > 5)
    refinement = 1
  const { level: _level, ascension: _ascension } = validateLevelAsc(
    level,
    ascension,
  )
  ;[level, ascension] = [_level, _ascension]
  return { key, level, ascension, refinement }
}
function validateBuildTCArtifact(
  artifact: unknown,
): BuildTc['artifact'] | undefined {
  if (typeof artifact !== 'object') return undefined
  let {
    slots,
    substats: { type, stats, rarity },
    sets,
  } = artifact as BuildTc['artifact']
  const _slots = validateBuildTCArtifactSlots(slots)
  if (!_slots) return undefined
  slots = _slots
  if (!substatTypeKeys.includes(type)) type = 'max'
  if (!allArtifactRarityKeys.includes(rarity)) rarity = 5
  if (typeof stats !== 'object') stats = objKeyMap(allSubstatKeys, () => 0)
  stats = objKeyMap(allSubstatKeys, (k) =>
    typeof stats[k] === 'number' ? stats[k] : 0,
  )

  if (typeof sets !== 'object') sets = {}
  // TODO: validate sets

  return { slots, substats: { type, stats, rarity }, sets }
}
function validateBuildTCArtifactSlots(
  slots: unknown,
): BuildTc['artifact']['slots'] | undefined {
  if (typeof slots !== 'object') return initCharTCArtifactSlots()

  if (
    Object.keys(slots as BuildTc['artifact']['slots']).length !==
      allArtifactSlotKeys.length ||
    Object.keys(slots as BuildTc['artifact']['slots']).some(
      (s) => !allArtifactSlotKeys.includes(s as ArtifactSlotKey),
    )
  )
    return initCharTCArtifactSlots()
  return objMap(
    slots as BuildTc['artifact']['slots'],
    ({ level, rarity, ...rest }) => {
      return {
        level: clamp(level, 0, artMaxLevel[rarity]),
        rarity,
        ...rest,
      }
    },
  )
}
function validateBuildTcOptimization(
  optimization: unknown,
): BuildTc['optimization'] | undefined {
  if (typeof optimization !== 'object') return undefined
  let { distributedSubstats, maxSubstats } =
    optimization as BuildTc['optimization']
  if (typeof distributedSubstats !== 'number') distributedSubstats = 20
  if (typeof maxSubstats !== 'object')
    maxSubstats = initBuildTcOptimizationMaxSubstats()
  maxSubstats = objKeyMap([...allSubstatKeys], (k) =>
    typeof maxSubstats[k] === 'number' ? maxSubstats[k] : 0,
  )
  return { distributedSubstats, maxSubstats }
}
function initBuildTcOptimizationMaxSubstats(): BuildTc['optimization']['maxSubstats'] {
  return objKeyMap(
    allSubstatKeys,
    (k) => 6 * (k === 'hp' || k === 'atk' ? 4 : k === 'atk_' ? 2 : 5),
  )
}
export function toBuildTc(
  charTC: BuildTc,
  eWeapon: ICachedWeapon | undefined = undefined,
  artifacts: Array<ICachedArtifact | undefined> = [],
) {
  if (eWeapon) {
    charTC.weapon.key = eWeapon.key
    charTC.weapon.level = eWeapon.level
    charTC.weapon.ascension = eWeapon.ascension
    charTC.weapon.refinement = eWeapon.refinement
  }

  const oldType = charTC.artifact.substats.type
  charTC.artifact.substats.type = oldType
  charTC.artifact.slots = initCharTCArtifactSlots()
  charTC.artifact.substats.stats = objKeyMap(allSubstatKeys, () => 0)
  const sets: Partial<Record<ArtifactSetKey, number>> = {}
  artifacts.forEach((art) => {
    if (!art) return
    const { slotKey, setKey, substats, mainStatKey, level, rarity } = art
    charTC.artifact.slots[slotKey].level = level
    charTC.artifact.slots[slotKey].statKey = mainStatKey
    charTC.artifact.slots[slotKey].rarity = rarity
    sets[setKey] = (sets[setKey] ?? 0) + 1
    substats.forEach((substat) => {
      if (substat.key)
        charTC.artifact.substats.stats[substat.key] =
          (charTC.artifact.substats.stats[substat.key] ?? 0) +
          substat.accurateValue
    })
  })
  charTC.artifact.sets = Object.fromEntries(
    Object.entries(sets)
      .map(([key, value]) => [
        key,
        value === 3
          ? 2
          : value === 5
            ? 4
            : value === 1 && !(key as string).startsWith('PrayersFor')
              ? 0
              : value,
      ])
      .filter(([, value]) => value),
  )
  return charTC
}
