import type { WeaponKey, WeaponTypeKey } from '@genshin-optimizer/consts'
import type { AnyNode, RawTagMapEntries } from '@genshin-optimizer/waverider'
import { prod, subscript } from '@genshin-optimizer/waverider'
import type { Stat } from '../util'
import { allStatics, self, selfBuff } from '../util'

export type WeaponDataGen = {
  weaponKey: WeaponKey
  weaponType: WeaponTypeKey
  lvlCurves: {
    key: string
    base: number
    curve: string /* TODO: key of char curves */
  }[]
  ascensionBonus: { key: string; values: number[] }[]
  refinementBonus: { key: string; values: number[] }[]
}
export function entriesForWeapon(
  gen: WeaponDataGen
): RawTagMapEntries<AnyNode> {
  const { refinement, ascension } = self.weapon
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as Stat].add(prod(base, allStatics('static')[curve]))
    ),
    ...gen.ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as Stat].add(subscript(ascension, values))
    ),
    ...gen.refinementBonus.map(({ key, values }) =>
      selfBuff.premod[key as Stat].add(subscript(refinement, values))
    ),
  ]
}
