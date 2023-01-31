import { Artifact, Character, convert, customQueries, Data, Member, members, Preset, reader, selfTag, Stat, Weapon } from './data/util'

export function withPreset(preset: Preset, data: Data): Data {
  return data.map(({ tag, value }) => ({ tag: { ...tag, preset }, value }))
}

export function charData(member: Member, data: {
  name: Character, lvl: number, ascension: number, constellation: number
  custom: Record<string, number | string>
}): Data {
  const { lvl, ascension, constellation } = convert(selfTag, { member, et: 'self' }).char
  const custom = customQueries({ member, src: data.name })

  return [
    reader.withTag({ src: 'agg', member }).reread(reader.withTag({ src: data.name })),
    reader.withTag({ src: 'iso', et: 'self', member }).reread(reader.withTag({ src: data.name })),

    lvl.add(data.lvl),
    ascension.add(data.ascension),
    constellation.add(data.constellation),
    ...Object.entries(data.custom).map(([k, v]) => custom[k].add(v)),
  ]
}

export function weaponData(member: Member, data: {
  name: Weapon, lvl: number, ascension: number, refinement: number
  custom: Record<string, number | string>
}): Data {
  const { lvl, ascension, refinement } = convert(selfTag, { member, et: 'self' }).weapon
  const custom = customQueries({ member, src: data.name })

  return [
    reader.withTag({ src: 'agg', member }).reread(reader.withTag({ src: data.name })),

    lvl.add(data.lvl),
    ascension.add(data.ascension),
    refinement.add(data.refinement),
    ...Object.entries(data.custom).map(([k, v]) => custom[k].add(v)),
  ]
}

export function artifactsData(member: Member, data: {
  set: Artifact, stats: { key: Stat, value: number }[]
}[]): Data {
  const { common: { count }, premod } = convert(selfTag, { member, src: 'art', et: 'self' })
  const sets: Partial<Record<Artifact, number>> = {}, stats: Partial<Record<Stat, number>> = {}
  for (const { set, stats: stat } of data) {
    if (!(set in sets)) sets[set] = 1
    else sets[set]! += 1
    for (const { key, value } of stat)
      if (!(key in stats)) stats[key] = value
      else stats[key]! += value
  }
  return [
    // Opt-in for artifact buffs, instead of enabling it by default to reduce `read` traffic
    reader.withTag({ member, src: 'agg', et: 'self' }).reread(reader.withTag({ src: 'art' })),

    ...Object.entries(sets).map(([k, v]) => count.with('src', k as Artifact).add(v)),
    ...Object.entries(stats).map(([k, v]) => premod[k as Stat].add(v)),
  ]
}

export function teamData(active: Member[], members: Member[]): Data {
  const teamEntry = reader.withTag({ et: 'team' })
  return [
    // Active Member Buff
    ...active.flatMap(dst => {
      const entry = reader.withTag({ member: dst, src: 'agg', et: 'self' })
      return members.map(src =>
        entry.reread(reader.withTag({ dst, member: src, src: 'agg', et: 'active' })))
    }),
    // Team Buff
    ...members.flatMap(dst => {
      const entry = reader.withTag({ member: dst, src: 'agg', et: 'self' })
      return members.map(src =>
        entry.reread(reader.withTag({ dst, member: src, src: 'agg', et: 'teamBuff' })))
    }),
    // Total Team Stat

    // CAUTION:
    // This formula only works for queries with default `undefined` or `sum` accumulators.
    // Using this on queries with other accumulators, e.g., `ampMulti` may results in an
    // incorrect result. We cannot use `reread` here because the outer `team` query may
    // use different accumulators from the inner query. Such is the case for maximum team
    // final eleMas, where the outer query uses a `max` accumulator, while final eleMas
    // must use `sum` accumulator for a correct result.
    ...members.map(member => teamEntry.add(reader.withTag({ member, et: 'self' }).sum)),
  ]
}
