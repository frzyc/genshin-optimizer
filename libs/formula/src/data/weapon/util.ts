import { AnyNode, constant, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider';
import { reader, stats, weapons } from '../util';

export function entriesForWeapon(
  weapon: typeof weapons[number],
  gen: {
    weaponType: string, // TODO: Weapon Type
    lvlCurves: { key: string, base: number, curve: string /* TODO: key of char curves */ }[],
    ascensionBonus: { key: string, values: number[] }[],
    refinementBonus: { key: string, values: number[] }[],
  }
): RawTagMapEntries<AnyNode> {
  const r = reader.src(weapon)
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      r.base[key as any as typeof stats[number]].addNode(prod(base, r.custom[curve]))),
    ...gen.ascensionBonus.map(({ key, values }) =>
      r.base[key as any as typeof stats[number]].addNode(subscript(r.q.ascension, values))),
    ...gen.refinementBonus.map(({ key, values }) =>
      r.base[key as any as typeof stats[number]].addNode(subscript(r.q.refinement, values))),

    // Constants
    r.q.weaponType.addNode(constant(gen.weaponType)),
  ]
}
