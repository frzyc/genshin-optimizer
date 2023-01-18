import { AnyNode, constant, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider';
import { AllTag, characters, reader, regions, stats, team } from '../util';

export function entriesForChar(
  char: typeof characters[number],
  element: AllTag['ele'],
  region: typeof regions[number],
  gen: {
    weaponType: string, // TODO: Weapon Type
    curves: { [key in typeof stats[number]]?: { base: number, curve: string /* TODO: key of char curves */ } },
    ascensions: { [key in typeof stats[number]]?: number[] },
  }
): RawTagMapEntries<AnyNode> {
  const specials = new Set(Object.keys(gen.curves) as AllTag['q'][])
  specials.delete('atk')
  specials.delete('def')
  specials.delete('hp')

  const r = reader.src(char), ascension = reader.base.ascension
  return [
    // Stats
    ...Object.entries(gen.curves).flatMap(([k, { base, curve }]) =>
      r.base[k as typeof stats[number]].addNode(prod(base, reader.custom[curve]))),
    ...Object.entries(gen.ascensions).flatMap(([k, ascs]) =>
      r.base[k as typeof stats[number]].addNode(subscript(ascension, ascs))),

    // Constants
    ...[...specials].map(s => r.q.special.addNode(constant(s))),
    r.q.weaponType.addNode(constant(gen.weaponType)),

    // Team counters
    team.with('ele', element).base.count.addNode(constant(1)),
    team.with('region', region).base.count.addNode(constant(1)),
  ]
}
