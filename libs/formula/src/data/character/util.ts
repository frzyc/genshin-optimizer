import { AnyNode, constant, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider';
import { AllTag, BetterRead, characters, Data, moves, reader, regions, stats, team } from '../util';

export function dmgNode(base: typeof stats[number], levelScaling: number[], move: typeof moves[number]): AnyNode {
  throw "TODO"
}

export function customDmgNode(base: AnyNode, move: typeof moves[number]): AnyNode {
  throw "TODO"
}

export function entriesForChar(
  char: typeof characters[number],
  element: AllTag['ele'],
  region: typeof regions[number],
  gen: {
    weaponType: string, // TODO: Weapon Type
    lvlCurves: { key: string, base: number, curve: string /* TODO: key of char curves */ }[],
    ascensionBonus: { key: string, values: number[] }[],
  }
): RawTagMapEntries<AnyNode> {
  const specials = new Set(Object.keys(gen.lvlCurves) as AllTag['q'][])
  specials.delete('atk')
  specials.delete('def')
  specials.delete('hp')

  const r = reader.src(char)
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      r.base[key as any as typeof stats[number]].addNode(prod(base, r.custom[curve]))),
    ...gen.ascensionBonus.map(({ key, values }) =>
      r.base[key as any as typeof stats[number]].addNode(subscript(r.q.ascension, values))),

    // Constants
    ...[...specials].map(s => r.q.special.addNode(constant(s))),
    r.q.weaponType.addNode(constant(gen.weaponType)),

    // Team counters
    team[element].q.count.addNode(constant(1)),
    team[region].q.count.addNode(constant(1)),
  ]
}
