import type {
  ArtifactSetKey,
  ElementWithPhyKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import { cmpEq, cmpNE } from '@genshin-optimizer/pando/engine'
import type {
  Member,
  Preset,
  Sheet,
  Stat,
  TagMapNodeEntries,
} from './data/util'
import { conditionalEntries, convert, reader, self, selfTag } from './data/util'

export function withPreset(
  preset: Preset,
  ...data: TagMapNodeEntries
): TagMapNodeEntries {
  return data.map(({ tag, value }) => ({ tag: { ...tag, preset }, value }))
}
export function withMember(
  src: Member,
  ...data: TagMapNodeEntries
): TagMapNodeEntries {
  return data.map(({ tag, value }) => ({ tag: { ...tag, src }, value }))
}

export function charData(data: ICharacter): TagMapNodeEntries {
  const { lvl, auto, skill, burst, ascension, constellation } = self.char

  return [
    reader.sheet('agg').reread(reader.sheet(data.key)),
    reader.withTag({ sheet: 'iso', et: 'self' }).reread(reader.sheet(data.key)),

    lvl.add(data.level),
    auto.add(data.talent.auto),
    skill.add(data.talent.skill),
    burst.add(data.talent.burst),
    ascension.add(data.ascension),
    constellation.add(data.constellation),

    // Default char
    self.premod.critRate_.add(0.05),
    self.premod.critDMG_.add(0.5),
  ]
}

export function weaponData(data: IWeapon): TagMapNodeEntries {
  const { lvl, ascension, refinement } = self.weapon

  return [
    reader.sheet('agg').reread(reader.sheet(data.key)),

    lvl.add(data.level),
    ascension.add(data.ascension),
    refinement.add(data.refinement),
  ]
}

export function artifactsData(
  data: {
    set: ArtifactSetKey
    stats: readonly { key: MainStatKey | SubstatKey; value: number }[]
  }[]
): TagMapNodeEntries {
  const {
    common: { count },
    premod,
  } = convert(selfTag, { sheet: 'art', et: 'self' })
  const sets: Partial<Record<ArtifactSetKey, number>> = {},
    stats: Partial<Record<MainStatKey | SubstatKey, number>> = {}
  for (const { set: setKey, stats: stat } of data) {
    const set = sets[setKey]
    if (set === undefined) sets[setKey] = 1
    else sets[setKey] = set + 1
    for (const { key, value } of stat) {
      const stat = stats[key]
      if (stat === undefined) stats[key] = value
      else stats[key] = stat + value
    }
  }
  return [
    // Opt-in for artifact buffs, instead of enabling it by default to reduce `read` traffic
    reader.sheet('agg').reread(reader.sheet('art')),

    // Add `sheet:dyn` between the stat and the buff so that we can `detach` them easily
    reader.withTag({ sheet: 'art', qt: 'premod' }).reread(reader.sheet('dyn')),
    ...Object.entries(stats).map(([k, v]) => {
      if (k.endsWith('_dmg_'))
        return premod['dmg_'][k.slice(-5) as ElementWithPhyKey].sheet('dyn').add(v)
      else return premod[k as Stat].sheet('dyn').add(v)
    }),

    ...Object.entries(sets).map(([k, v]) =>
      count.sheet(k as ArtifactSetKey).add(v)
    ),
  ]
}

export function conditionalData(
  dst: Member,
  data: Partial<
    Record<Member, Partial<Record<Sheet, Record<string, string | number>>>>
  >
) {
  return Object.entries(data).flatMap(([src, entries]) =>
    Object.entries(entries).flatMap(([key, entries]) => {
      const conds = conditionalEntries(key as Sheet, src as Member, dst)
      return Object.entries(entries).map(([k, v]) => conds(k, v))
    })
  )
}

export function teamData(members: readonly Member[]): TagMapNodeEntries {
  const teamEntry = reader.with('et', 'team')
  const { self, teamBuff, notSelfBuff } = reader.sheet('agg').withAll('et', [])
  return [
    // Target Entries
    members.map((dst) =>
      reader
        .withTag({ et: 'target', dst })
        .reread(reader.withTag({ et: 'self', dst: null, src: dst }))
    ),
    // Self Buff
    members.flatMap((src) =>
      self.with('src', src).reread(reader.withTag({ et: 'selfBuff', dst: src }))
    ),
    // Team Buff
    members.flatMap((dst) => {
      const entry = self.with('src', dst)
      return members.map((src) => entry.reread(teamBuff.withTag({ dst, src })))
    }),
    // Not Self Buff
    members.flatMap((dst) => {
      const entry = self.with('src', dst)
      return members
        .map((src) => entry.reread(notSelfBuff.withTag({ dst, src })))
        .filter(({ value }) => value.tag!['dst'] != value.tag!['src'])
    }),
    // Non-stacking
    members.slice(0, 4).flatMap((_, i) => {
      const { stackIn, stackTmp } = reader.withAll('qt', [])
      const src = `${i}` as '0' | '1' | '2' | '3'
      // Make sure not to use `sheet:agg` here to match `stackOut` on the `reader.addOnce` side
      const self = reader.withTag({ src, et: 'self' })
      // Use `i + 1` for priority so that `0` means no buff
      return [
        self.with('qt', 'stackTmp').add(cmpNE(stackIn, 0, i + 1)),
        self
          .with('qt', 'stackOut')
          .add(cmpEq(stackTmp.max.with('et', 'team'), i + 1, stackIn)),
      ]
    }),

    // Total Team Stat
    //
    // CAUTION:
    // This formula only works for queries with default `undefined` or `sum` accumulator.
    // Using this on queries with other accumulators, e.g., `ampMulti` may results in an
    // incorrect result. We cannot use `reread` here because the outer `team` query may
    // use different accumulators from the inner query. Such is the case for maximum team
    // final eleMas, where the outer query uses a `max` accumulator, while final eleMas
    // must use `sum` accumulator for a correct result.
    members.map((src) =>
      teamEntry.add(reader.withTag({ src, et: 'self' }).sum)
    ),
  ].flat()
}
