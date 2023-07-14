import type {
  WeaponGrowCurveKey,
  CharacterGrowCurveKey,
} from '@genshin-optimizer/dm'
import {
  avatarCurveExcelConfigData,
  weaponCurveExcelConfigData,
} from '@genshin-optimizer/dm'

export const weaponExpCurve = Object.fromEntries(
  Object.entries(weaponCurveExcelConfigData).map(([k, v]) => {
    const result = [-1]
    Object.entries(v).forEach(([lvl, v]) => (result[+lvl] = v))
    return [k, result]
  })
) as Record<WeaponGrowCurveKey, number[]>

export const charExpCurve = Object.fromEntries(
  Object.entries(avatarCurveExcelConfigData).map(([k, v]) => {
    const result = [-1]
    Object.entries(v).forEach(([lvl, v]) => (result[+lvl] = v))
    return [k, result]
  })
) as Record<CharacterGrowCurveKey, number[]>
