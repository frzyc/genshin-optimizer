import { AnyNode, constant, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider';
import { Character, Data, Element, moves, read, reader, Region, regions, Stat } from '../util';

export function dmgNode(base: Stat, levelScaling: number[], move: typeof moves[number]): AnyNode {
  // TODO
  return constant(NaN)
}

export function customDmgNode(base: AnyNode, move: typeof moves[number]): AnyNode {
  // TODO
  return constant(NaN)
}

export function entriesForChar(
  name: Character,
  element: Element,
  region: Region,
  gen: {
    weaponType: string, // TODO: Weapon Type
    lvlCurves: { key: string, base: number, curve: string /* TODO: key of char curves */ }[],
    ascensionBonus: { key: string, values: number[] }[],
  }
): RawTagMapEntries<AnyNode> {
  const specials = new Set(Object.keys(gen.lvlCurves) as Stat[])
  specials.delete('atk')
  specials.delete('def')
  specials.delete('hp')

  const { input: { char: { ascension } }, custom, output: { selfBuff } } = read(name)
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as any as Stat].addNode(prod(base, custom[curve]))),
    ...gen.ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as any as Stat].addNode(subscript(ascension, values))),

    // Constants
    ...[...specials].map(s => selfBuff.common.special.addNode(constant(s))),
    selfBuff.common.weaponType.addNode(constant(gen.weaponType)),

    // Team counters
    selfBuff[element].team.count.addNode(constant(1)),
    selfBuff[region].team.count.addNode(constant(1)),
  ]
}
