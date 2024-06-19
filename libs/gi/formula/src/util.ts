import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
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
    stats: readonly { key: Stat; value: number }[]
  }[]
): TagMapNodeEntries {
  const {
    common: { count },
    premod,
  } = convert(selfTag, { sheet: 'art', et: 'self' })
  const sets: Partial<Record<ArtifactSetKey, number>> = {},
    stats: Partial<Record<Stat, number>> = {}
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
    ...Object.entries(stats).map(([k, v]) =>
      premod[k as Stat].sheet('dyn').add(v)
    ),

    ...Object.entries(sets).map(([k, v]) =>
      count.sheet(k as ArtifactSetKey).add(v)
    ),
  ]
}

export function conditionalData(
  data: Partial<Record<Sheet, Record<string, string | number>>>
) {
  return Object.entries(data).flatMap(([key, entries]) => {
    const conds = conditionalEntries(key as Sheet)
    return Object.entries(entries).map(([k, v]) => conds(k, v))
  })
}

export function teamData(members: readonly Member[]): TagMapNodeEntries {
  const teamEntry = reader.with('et', 'team')
  const { self, teamBuff } = reader.sheet('agg').withAll('et', [])
  const { stackIn, stackInt, stackOut } = reader.withAll('qt', [])
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
    // Stacking
    members.map((src, i) =>
      stackInt.add(cmpGE(stackIn.withTag({ src }).max, 1, i + 1))
    ),
    members.map((src, i) =>
      stackOut.withTag({ src }).add(cmpEq(stackInt.max, i + 1, 1))
    ),
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
