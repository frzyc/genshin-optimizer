import { WeaponKey, WeaponTypeKey } from '@genshin-optimizer/consts'
import { AnyNode, NumNode, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider'
import { allCustoms, convert, Data, self, selfBuff, selfTag, Stat, usedNames } from '../util'

export type WeaponDataGen = {
  weaponKey: WeaponKey
  weaponType: WeaponTypeKey
  lvlCurves: { key: string, base: number, curve: string /* TODO: key of char curves */ }[]
  ascensionBonus: { key: string, values: number[] }[]
  refinementBonus: { key: string, values: number[] }[]
}
export function entriesForWeapon(gen: WeaponDataGen): RawTagMapEntries<AnyNode> {
  const { refinement, ascension } = self.weapon
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as Stat].add(prod(base, allCustoms('static')[curve]))),
    ...gen.ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as Stat].add(subscript(ascension, values))),
    ...gen.refinementBonus.map(({ key, values }) =>
      selfBuff.premod[key as Stat].add(subscript(refinement, values))),
  ]
}

export function customHeal(name: string, wepKey: WeaponKey, base: NumNode): Data {
  usedNames.add(name)

  const entry = convert(selfTag, { name, et: 'self', src: wepKey })
  return [
    entry.formula.base.add(base)
  ]
}
