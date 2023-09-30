import type {
  ArtifactSetKey,
  CharacterKey,
  WeaponKey,
} from '@genshin-optimizer/consts'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi-good'
import { cmpEq, cmpGE } from '@genshin-optimizer/pando'
import type { Member, Preset, Stat, TagMapNodeEntries } from './data/util'
import {
  allConditionals,
  convert,
  reader,
  selfBuff,
  selfTag,
} from './data/util'

export function withPreset(
  preset: Preset,
  ...data: TagMapNodeEntries
): TagMapNodeEntries {
  return data.map(({ tag, value }) => ({ tag: { ...tag, preset }, value }))
}
export function withMember(
  member: Member,
  ...data: TagMapNodeEntries
): TagMapNodeEntries {
  return data.map(({ tag, value }) => ({ tag: { ...tag, member }, value }))
}

export function charData(data: ICharacter): TagMapNodeEntries {
  const { lvl, auto, skill, burst, ascension, constellation } = selfBuff.char

  return [
    reader.src('agg').reread(reader.src(data.key)),
    reader.withTag({ src: 'iso', et: 'self' }).reread(reader.src(data.key)),

    lvl.add(data.level),
    auto.add(data.talent.auto),
    skill.add(data.talent.skill),
    burst.add(data.talent.burst),
    ascension.add(data.ascension),
    constellation.add(data.constellation),

    // Default char
    selfBuff.base.critRate_.add(0.05),
    selfBuff.base.critDMG_.add(0.5),
  ]
}

export function weaponData(data: IWeapon): TagMapNodeEntries {
  const { lvl, ascension, refinement } = selfBuff.weapon

  return [
    reader.src('agg').reread(reader.src(data.key)),

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
  } = convert(selfTag, { src: 'art', et: 'self' })
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
    reader.src('agg').reread(reader.src('art')),

    // Add `src:dyn` between the stat and the buff so that we can `detach` them easily
    reader.withTag({ src: 'art', qt: 'premod' }).reread(reader.src('dyn')),
    ...Object.entries(stats).map(([k, v]) =>
      premod[k as Stat].src('dyn').add(v)
    ),

    ...Object.entries(sets).map(([k, v]) =>
      count.src(k as ArtifactSetKey).add(v)
    ),
  ]
}

type CondKey = CharacterKey | WeaponKey | ArtifactSetKey
export function conditionalData(
  data: Partial<Record<CondKey, Record<string, string | number>>>
) {
  return Object.entries(data).flatMap(([key, entries]) => {
    const conds = allConditionals(key as CondKey)
    return Object.entries(entries).map(([k, v]) => conds[k].add(v))
  })
}

export function teamData(
  activeMembers: readonly Member[],
  members: readonly Member[]
): TagMapNodeEntries {
  const teamEntry = reader.with('et', 'team')
  const { active, self, teamBuff } = reader.src('agg').withAll('et', [])
  const { stackIn, stackInt, stackOut } = reader.withAll('qt', [])
  return [
    // Active Member Buff
    activeMembers.flatMap((dst) => {
      const entry = self.with('member', dst)
      return members.map((src) =>
        entry.reread(active.withTag({ dst, member: src }))
      )
    }),
    // Team Buff
    members.flatMap((dst) => {
      const entry = self.with('member', dst)
      return members.map((src) =>
        entry.reread(teamBuff.withTag({ dst, member: src }))
      )
    }),
    // Stacking
    members.map((member, i) =>
      stackInt.add(cmpGE(stackIn.withTag({ member }).max, 1, i + 1))
    ),
    members.map((member, i) =>
      stackOut.withTag({ member }).add(cmpEq(stackInt.max, i + 1, 1))
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
    members.map((member) =>
      teamEntry.add(reader.withTag({ member, et: 'self' }).sum)
    ),
  ].flat()
}
