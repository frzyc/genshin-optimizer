import type {
  ArtifactSetKey,
  CharacterKey,
  WeaponKey,
} from '@genshin-optimizer/consts'
import { cmpEq } from '@genshin-optimizer/waverider'
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

export function charData(data: {
  name: CharacterKey
  lvl: number
  ascension: number
  constellation: number
  conds: Record<string, number | string>
}): Data {
  const { lvl, ascension, constellation } = selfBuff.char,
    conds = allConditionals(data.name)

  return [
    reader.withTag({ src: 'agg' }).reread(reader.withTag({ src: data.name })),
    reader
      .withTag({ src: 'iso', et: 'self' })
      .reread(reader.withTag({ src: data.name })),

    lvl.add(data.lvl),
    ascension.add(data.ascension),
    constellation.add(data.constellation),
    ...Object.entries(data.conds).map(([k, v]) => conds[k].add(v)),

    // Default char
    selfBuff.base.critRate_.add(0.05),
    selfBuff.base.critDMG_.add(0.5),
  ]
}

export function weaponData(data: {
  name: WeaponKey
  lvl: number
  ascension: number
  refinement: number
  conds: Record<string, number | string>
}): Data {
  const { lvl, ascension, refinement } = selfBuff.weapon,
    conds = allConditionals(data.name)

  return [
    reader.withTag({ src: 'agg' }).reread(reader.withTag({ src: data.name })),

    lvl.add(data.lvl),
    ascension.add(data.ascension),
    refinement.add(data.refinement),
    ...Object.entries(data.conds).map(([k, v]) => conds[k].add(v)),
  ]
}

export function artifactsData(
  data: {
    set: ArtifactSetKey
    stats: readonly { key: Stat; value: number }[]
  }[],
  conds: Partial<Record<ArtifactSetKey, Record<string, number | string>>>
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
    reader
      .withTag({ src: 'agg', et: 'self' })
      .reread(reader.withTag({ src: 'art' })),

    ...Object.entries(sets).map(([k, v]) =>
      count.with('src', k as ArtifactSetKey).add(v)
    ),
    ...Object.entries(stats).map(([k, v]) => premod[k as Stat].add(v)),
    ...Object.entries(conds).flatMap(([art, v]) => {
      const conds = allConditionals(art as ArtifactSetKey)
      return Object.entries(v).map(([k, v]) => conds[k].add(v))
    }),
  ]
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
