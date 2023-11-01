import type { RefinementKey } from '@genshin-optimizer/consts'
import { allWeaponKeys } from '@genshin-optimizer/consts'
import type { IWeapon } from '@genshin-optimizer/gi-good'
import {
  getRandBool,
  getRandomElementFromArray,
  getRandomIntInclusive,
} from '@genshin-optimizer/util'
import { validateLevelAsc } from '../level'

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
  const { ascension } = validateLevelAsc(level, base.ascension ?? 0)
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
