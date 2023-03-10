import { validateLevelAsc } from '../../Data/LevelData'
import type { MainStatKey } from '../../Types/artifact'
import { allSubstatKeys } from '../../Types/artifact'
import type { ICharTC } from '../../Types/character'
import type {
  ArtifactRarity,
  CharacterKey,
  WeaponKey,
} from '../../Types/consts'
import { allSlotKeys, allWeaponKeys, substatType } from '../../Types/consts'
import { objectKeyMap } from '../../Util/Util'
import type { ArtCharDatabase } from '../Database'
import { DataManager } from '../DataManager'

export class CharacterTCDataManager extends DataManager<
  CharacterKey,
  'charTCs',
  ICharTC,
  ICharTC
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
  validate(obj: any): ICharTC | undefined {
    if (typeof obj !== 'object') return
    const weapon = validateCharTCWeapon(obj.weapon)
    if (!weapon) return
    const artifact = validateCharTCArtifact(obj.artifact)
    if (!artifact) return
    return { artifact, weapon }
  }
  toStorageKey(key: CharacterKey): string {
    return `charTC_${key}`
  }
  remove(key: CharacterKey) {
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
        stats: objectKeyMap(allSubstatKeys, () => 0),
      },
      sets: {},
    },
  }
}
function initCharTCArtifactSlots() {
  return objectKeyMap(allSlotKeys, (s) => ({
    level: 20,
    rarity: 5 as ArtifactRarity,
    statKey: (s === 'flower'
      ? 'hp'
      : s === 'plume'
      ? 'atk'
      : 'atk_') as MainStatKey,
  }))
}

function validateCharTCWeapon(weapon: any): ICharTC['weapon'] | undefined {
  if (typeof weapon !== 'object') return
  const { key, level: rawLevel, ascension: rawAscension } = weapon
  let { refinement } = weapon
  if (!allWeaponKeys.includes(key)) return
  if (typeof refinement !== 'number' || refinement < 1 || refinement > 5)
    refinement = 1
  const { level, ascension } = validateLevelAsc(rawLevel, rawAscension)
  return { key, level, ascension, refinement }
}
function validateCharTCArtifact(
  artifact: any
): ICharTC['artifact'] | undefined {
  if (typeof artifact !== 'object') return
  let {
    slots,
    substats: { type, stats },
  } = artifact
  const { sets } = artifact
  slots = validateCharTCArtifactSlots(slots)
  if (!slots) return
  if (!substatType.includes(type)) type = 'max'
  if (typeof stats !== 'object') stats = objectKeyMap(allSubstatKeys, () => 0)
  stats = objectKeyMap(allSubstatKeys, (k) =>
    typeof stats[k] === 'number' ? stats[k] : 0
  )
  return { slots, substats: { type, stats }, sets }
}
function validateCharTCArtifactSlots(
  slots: any
): ICharTC['artifact']['slots'] | undefined {
  if (typeof slots !== 'object') return initCharTCArtifactSlots()
  if (
    Object.keys(slots).length !== allSlotKeys.length ||
    Object.keys(slots).some((s) => !allSlotKeys.includes(s as any))
  )
    return initCharTCArtifactSlots()
  return slots
}
