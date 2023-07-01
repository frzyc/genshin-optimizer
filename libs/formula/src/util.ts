import type {
  ArtifactSetKey,
  CharacterKey,
  WeaponKey,
} from '@genshin-optimizer/consts'
import type { IWeapon, ICharacter } from '@genshin-optimizer/gi-good'
import { cmpEq } from '@genshin-optimizer/pando'
import type { Data, Member, Preset, Stat } from './data/util'
import {
  allConditionals,
  convert,
  reader,
  selfBuff,
  selfTag,
} from './data/util'

export function withPreset(preset: Preset, ...data: Data): Data {
  return data.map(({ tag, value }) => ({ tag: { ...tag, preset }, value }))
}
export function withMember(member: Member, ...data: Data): Data {
  return data.map(({ tag, value }) => ({ tag: { ...tag, member }, value }))
}

export function charData(data: ICharacter): Data {
  const { lvl, auto, skill, burst, ascension, constellation } = selfBuff.char

  return [
    reader.withTag({ src: 'agg' }).reread(reader.withTag({ src: data.key })),
    reader
      .withTag({ src: 'iso', et: 'self' })
      .reread(reader.withTag({ src: data.key })),

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

export function weaponData(data: IWeapon): Data {
  const { lvl, ascension, refinement } = selfBuff.weapon

  return [
    reader.withTag({ src: 'agg' }).reread(reader.withTag({ src: data.key })),

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
): Data {
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
    reader.withTag({ src: 'agg' }).reread(reader.withTag({ src: 'art' })),

    ...Object.entries(sets).map(([k, v]) =>
      count.with('src', k as ArtifactSetKey).add(v)
    ),
    ...Object.entries(stats).map(([k, v]) => premod[k as Stat].add(v)),
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
  active: readonly Member[],
  members: readonly Member[]
): Data {
  const teamEntry = reader.withTag({ et: 'team' })
  const stack = {
    in: reader.withTag({ qt: 'stackIn' }),
    int: reader.withTag({ qt: 'stackInt' }),
    out: reader.withTag({ qt: 'stackOut' }),
  }
  return [
    // Active Member Buff
    ...active.flatMap((dst) => {
      const entry = reader.withTag({ member: dst, src: 'agg', et: 'self' })
      return members.map((src) =>
        entry.reread(
          reader.withTag({ dst, member: src, src: 'agg', et: 'active' })
        )
      )
    }),
    // Team Buff
    ...members.flatMap((dst) => {
      const entry = reader.withTag({ member: dst, src: 'agg', et: 'self' })
      return members.map((src) =>
        entry.reread(
          reader.withTag({ dst, member: src, src: 'agg', et: 'teamBuff' })
        )
      )
    }),
    // Stacking
    ...members.map((member, i) =>
      stack.int.add(cmpEq(stack.in.withTag({ member }).sum, 1, i + 1))
    ),
    ...members.map((member, i) =>
      stack.out.withTag({ member }).add(cmpEq(stack.int.max, i + 1, 1))
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
    ...members.map((member) =>
      teamEntry.add(reader.withTag({ member, et: 'self' }).sum)
    ),
  ]
}
