import { AnyNode, constant, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider';
import { read, Stat, Weapon } from '../util';

export function entriesForWeapon(
  name: Weapon,
  gen: {
    weaponType: string, // TODO: Weapon Type
    lvlCurves: { key: string, base: number, curve: string /* TODO: key of char curves */ }[],
    ascensionBonus: { key: string, values: number[] }[],
    refinementBonus: { key: string, values: number[] }[],
  }
): RawTagMapEntries<AnyNode> {
  const {
    input: { weapon: { refinement, ascension } },
    custom,
    output: { selfBuff }
  } = read(name)
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as any as Stat].addNode(prod(base, custom[curve]))),
    ...gen.ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as any as Stat].addNode(subscript(ascension, values))),
    ...gen.refinementBonus.map(({ key, values }) =>
      selfBuff.premod[key as any as Stat].addNode(subscript(refinement, values))),

    // Constants
    selfBuff.common.weaponType.addNode(constant(gen.weaponType)),
  ]
}
