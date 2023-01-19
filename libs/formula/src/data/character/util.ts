import { AnyNode, constant, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider';
import { AllTag, characters, reader, regions, stats, team } from '../util';

export function entriesForChar(
  char: typeof characters[number],
  element: AllTag['ele'],
  region: typeof regions[number],
  gen: {
    weaponType: string, // TODO: Weapon Type
    lvlCurves: { [key in typeof stats[number]]?: { base: number, curve: string /* TODO: key of char curves */ } },
    ascensionBonus: { [key in typeof stats[number]]?: number[] },
  }
): RawTagMapEntries<AnyNode> {
  const specials = new Set(Object.keys(gen.lvlCurves) as AllTag['q'][])
  specials.delete('atk')
  specials.delete('def')
  specials.delete('hp')

  const r = reader.src(char)
  return [
    // Stats
    ...Object.entries(gen.lvlCurves).flatMap(([k, { base, curve }]) =>
      r.base[k as typeof stats[number]].addNode(prod(base, r.custom[curve]))),
    ...Object.entries(gen.ascensionBonus).flatMap(([k, ascs]) =>
      r.base[k as typeof stats[number]].addNode(subscript(r.base.ascension, ascs))),

    // Constants
    ...[...specials].map(s => r.q.special.addNode(constant(s))),
    r.q.weaponType.addNode(constant(gen.weaponType)),

    // Team counters
    team[element].base.count.addNode(constant(1)),
    team[region].base.count.addNode(constant(1)),
  ]
}
