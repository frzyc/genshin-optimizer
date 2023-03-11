import type { WeaponKey, WeaponTypeKey } from '../Types/consts'
import type { ICachedWeapon } from '../Types/weapon'

export function defaultInitialWeaponKey(type: WeaponTypeKey): WeaponKey {
  switch (type) {
    case 'sword':
      return 'DullBlade'
    case 'bow':
      return 'HuntersBow'
    case 'claymore':
      return 'WasterGreatsword'
    case 'polearm':
      return 'BeginnersProtector'
    case 'catalyst':
      return 'ApprenticesNotes'
    default:
      return 'DullBlade'
  }
}
export const defaultInitialWeapon = (
  type: WeaponTypeKey = 'sword'
): ICachedWeapon => initialWeapon(defaultInitialWeaponKey(type))

export const initialWeapon = (key: WeaponKey): ICachedWeapon => ({
  id: '',
  key,
  level: 1,
  ascension: 0,
  refinement: 1,
  location: '',
  lock: false,
})
