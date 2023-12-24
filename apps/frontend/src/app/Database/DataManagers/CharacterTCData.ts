import type {
  ArtifactRarity,
  ArtifactSlotKey,
  CharacterKey,
  MainStatKey,
  WeaponKey,
} from '@genshin-optimizer/consts'
import {
  allArtifactRarityKeys,
  allArtifactSlotKeys,
  allSubstatKeys,
  allWeaponKeys,
  substatTypeKeys,
} from '@genshin-optimizer/consts'
import { validateLevelAsc } from '@genshin-optimizer/gi-util'
import { objKeyMap } from '@genshin-optimizer/util'
import type { ICharTC } from '../../Types/character'
import type { ArtCharDatabase } from '../Database'
import { DataManager } from '../DataManager'

export class CharacterTCDataManager extends DataManager<
  CharacterKey,
  'charTCs',
  ICharTC,
  ICharTC,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'charTCs')
    for (const key of this.database.storage.keys) {
      if (
        key.startsWith('charTC_') &&
        !this.set(key.split('charTC_')[1] as CharacterKey, {})
      )
        database.storage.remove(key)
    }
  }
  override validate(obj: unknown): ICharTC | undefined {
    if (typeof obj !== 'object') return undefined
    const { weapon, artifact, optimization } = obj as ICharTC
    const _weapon = validateCharTCWeapon(weapon)
    if (!_weapon) return undefined

    const _artifact = validateCharTCArtifact(artifact)
    if (!_artifact) return undefined
    const _optimization = validateCharTcOptimization(optimization)
    if (!_optimization) return undefined
    return { artifact: _artifact, weapon: _weapon, optimization: _optimization }
  }
  override toStorageKey(key: CharacterKey): string {
    return `charTC_${key}`
  }
  override remove(key: CharacterKey) {
    const char = this.get(key)
    if (!char) return
    super.remove(key)
  }
  getWithInit(key: CharacterKey, weaponKey: WeaponKey): ICharTC {
    const charTc = key ? this.data[key] : undefined
    return charTc ?? initCharTC(weaponKey)
  }
}

export function initCharTC(weaponKey: WeaponKey): ICharTC {
  return {
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
      target: undefined,
      distributedSubstats: 45,
      maxSubstats: initCharTcOptimizationMaxSubstats(),
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

function validateCharTCWeapon(weapon: unknown): ICharTC['weapon'] | undefined {
  if (typeof weapon !== 'object') return undefined
  const { key } = weapon as ICharTC['weapon']
  let { level, ascension, refinement } = weapon as ICharTC['weapon']
  if (!allWeaponKeys.includes(key)) return undefined
  if (typeof refinement !== 'number' || refinement < 1 || refinement > 5)
    refinement = 1
  const { level: _level, ascension: _ascension } = validateLevelAsc(
    level,
    ascension
  )
  ;[level, ascension] = [_level, _ascension]
  return { key, level, ascension, refinement }
}
function validateCharTCArtifact(
  artifact: unknown
): ICharTC['artifact'] | undefined {
  if (typeof artifact !== 'object') return undefined
  let {
    slots,
    substats: { type, stats, rarity },
    sets,
  } = artifact as ICharTC['artifact']
  const _slots = validateCharTCArtifactSlots(slots)
  if (!_slots) return undefined
  slots = _slots
  if (!substatTypeKeys.includes(type)) type = 'max'
  if (!allArtifactRarityKeys.includes(rarity)) rarity = 5
  if (typeof stats !== 'object') stats = objKeyMap(allSubstatKeys, () => 0)
  stats = objKeyMap(allSubstatKeys, (k) =>
    typeof stats[k] === 'number' ? stats[k] : 0
  )

  if (typeof sets !== 'object') sets = {}
  // TODO: validate sets

  return { slots, substats: { type, stats, rarity }, sets }
}
function validateCharTCArtifactSlots(
  slots: unknown
): ICharTC['artifact']['slots'] | undefined {
  if (typeof slots !== 'object') return initCharTCArtifactSlots()
  if (
    Object.keys(slots as ICharTC['artifact']['slots']).length !==
      allArtifactSlotKeys.length ||
    Object.keys(slots as ICharTC['artifact']['slots']).some(
      (s) => !allArtifactSlotKeys.includes(s as ArtifactSlotKey)
    )
  )
    return initCharTCArtifactSlots()
  return slots as ICharTC['artifact']['slots']
}
function validateCharTcOptimization(
  optimization: unknown
): ICharTC['optimization'] | undefined {
  if (typeof optimization !== 'object') return undefined
  let { target, distributedSubstats, maxSubstats } =
    optimization as ICharTC['optimization']
  if (!Array.isArray(target)) target = undefined
  if (typeof distributedSubstats !== 'number') distributedSubstats = 20
  if (typeof maxSubstats !== 'object')
    maxSubstats = initCharTcOptimizationMaxSubstats()
  maxSubstats = objKeyMap([...allSubstatKeys], (k) =>
    typeof maxSubstats[k] === 'number' ? maxSubstats[k] : 0
  )
  return { target, distributedSubstats, maxSubstats }
}
function initCharTcOptimizationMaxSubstats(): ICharTC['optimization']['maxSubstats'] {
  return objKeyMap(allSubstatKeys, () => 30)
}
