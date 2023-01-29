import { AnyNode, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider'
import { custom, self, selfBuff, Stat } from '../util'

export function entriesForWeapon(
  gen: {
    weaponType: string, // TODO: Weapon Type
    lvlCurves: { key: string, base: number, curve: string /* TODO: key of char curves */ }[],
    ascensionBonus: { key: string, values: number[] }[],
    refinementBonus: { key: string, values: number[] }[],
  }
): RawTagMapEntries<AnyNode> {
  const { refinement, ascension } = self.weapon
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as any as Stat].add(prod(base, custom[curve]))),
    ...gen.ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as any as Stat].add(subscript(ascension, values))),
    ...gen.refinementBonus.map(({ key, values }) =>
      selfBuff.premod[key as any as Stat].add(subscript(refinement, values))),
  ]
}
