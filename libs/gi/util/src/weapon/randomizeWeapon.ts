import {
  getRandBool,
  getRandomElementFromArray,
  getRandomIntInclusive,
} from '@genshin-optimizer/common/util'
import {
  allWeaponKeys,
  type RefinementKey,
  validateWeaponLevelAsc,
} from '@genshin-optimizer/gi/consts'
import type { IWeapon } from '@genshin-optimizer/gi/schema'
import { allStats } from '@genshin-optimizer/gi/stats'

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
  const { ascension } = validateWeaponLevelAsc(
    level,
    base.ascension ?? 0,
    allStats.weapon.data[key].rarity
  )
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
