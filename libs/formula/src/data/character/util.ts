import { AnyNode, constant, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider';
import { AllTag, BetterRead, reader, todo } from '../util';

export const team = reader.char('team'), enemy = reader.char('enemy')
export const activeChar = todo

export function entriesForChar(
  reader: BetterRead,
  element: AllTag['ele'],
  region: AllTag['region'],
  gen: {
    weaponType: string, // TODO: Weapon Type
    curves: { [key in AllTag['q']]?: { base: number, curve: string /* TODO: key of char curves */ } },
    ascensions: { [key in AllTag['q']]?: number[] },
  }
): RawTagMapEntries<AnyNode> {
  const specials = new Set(Object.keys(gen.curves) as AllTag['q'][])
  specials.delete('atk')
  specials.delete('def')
  specials.delete('hp')

  const ascension = reader.q('ascension')
  return [
    // Stats
    ...Object.entries(gen.curves).flatMap(([k, { base, curve }]) =>
      reader.base.q(k as any).addNode(prod(base, reader.customQ[curve]))),
    ...Object.entries(gen.ascensions).flatMap(([k, ascs]) =>
      reader.base.q(k as any).addNode(subscript(ascension, ascs))),

    // Constants
    ...[...specials].map(s => reader.q('special').addNode(constant(s))),
    reader.q('weaponType').addNode(constant(gen.weaponType)),

    // Team counters
    reader.char('team')[element].q('count').addNode(constant(1)),
    reader.char('team')[region].q('count').addNode(constant(1)),
  ]
}
