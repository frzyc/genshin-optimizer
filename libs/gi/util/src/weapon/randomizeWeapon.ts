import {
  getRandBool,
  getRandomElementFromArray,
  getRandomIntInclusive,
} from '@genshin-optimizer/common/util'
import {
  type RefinementKey,
  allWeaponKeys,
  validateWeaponLevelAsc,
} from '@genshin-optimizer/gi/consts'
import type { IWeapon } from '@genshin-optimizer/gi/schema'

const weaponKeys = allWeaponKeys.filter(
  (k) =>
    ![
      'DullBlade',
      'SilverSword',
      'WasterGreatsword',
      'OldMercsPal',
      'BeginnersProtector',
      'IronPoint',
      'ApprenticesNotes',
      'PocketGrimoire',
      'HuntersBow',
      'SeasonedHuntersBow',
    ].includes(k)
)
export function randomizeWeapon(base: Partial<IWeapon> = {}): IWeapon {
  const key = base.key ?? getRandomElementFromArray(weaponKeys)
  const level = base.level ?? getRandomIntInclusive(1, 90)
  const { ascension } = validateWeaponLevelAsc(level, base.ascension ?? 0)
  const refinement =
    base.refinement ?? (getRandomIntInclusive(1, 5) as RefinementKey)
  const lock = base.lock ?? getRandBool()
  return {
    key,
    level,
    ascension,
    refinement,
    location: base.location ?? '',
    lock,
  }
}
