import { Artifact, Character, convert, customQueries, Data, Preset, reader, selfTag, Stat, Weapon } from './data/util'

export function charData(preset: Preset, data: {
  name: Character, lvl: number, ascension: number, constellation: number
  custom: Record<string, number | string>
}): Data {
  const { lvl, ascension, constellation } = convert(selfTag, { preset, et: 'self' }).char
  const custom = customQueries({ preset })

  return [
    reader.withTag({ at: 'agg', preset }).reread(reader.withTag({ at: 'comp', src: data.name })),
    reader.withTag({ at: 'iso', et: 'self', preset }).reread(reader.withTag({ at: 'comp', src: data.name })),

    lvl.add(data.lvl),
    ascension.add(data.ascension),
    constellation.add(data.constellation),
    ...Object.entries(data.custom).map(([k, v]) => custom[k].add(v)),
  ]
}

export function weaponData(preset: Preset, data: {
  name: Weapon, lvl: number, ascension: number, refinement: number
  custom: Record<string, number | string>
}): Data {
  const { lvl, ascension, refinement } = convert(selfTag, { preset, et: 'self' }).weapon
  const custom = customQueries({ preset })

  return [
    reader.withTag({ at: 'agg', preset }).reread(reader.withTag({ at: 'comp', src: data.name })),

    lvl.add(data.lvl),
    ascension.add(data.ascension),
    refinement.add(data.refinement),
    ...Object.entries(data.custom).map(([k, v]) => custom[k].add(v)),
  ]
}

export function artifactsData(preset: Preset, data: {
  set: Artifact, stats: { key: Stat, value: number }[]
}[]): Data {
  const { common: { count }, premod } = convert(selfTag, { preset, src: 'art', et: 'self' })
  const sets: Partial<Record<Artifact, number>> = {}, stats: Partial<Record<Stat, number>> = {}
  for (const { set, stats: stat } of data) {
    if (!(set in sets)) sets[set] = 1
    else sets[set]! += 1
    for (const { key, value } of stat)
      if (!(key in stats)) stats[key] = value
      else stats[key]! += value
  }
  return [
    ...Object.entries(sets).map(([k, v]) => count.with('src', k as Artifact).add(v)),
    ...Object.entries(stats).map(([k, v]) => premod[k as Stat].add(v)),
  ]
}

export function teamData(team: Preset[], active: Preset[]): Data {
  return [
    // Team Buff
    ...team.flatMap(dst => {
      const entry = reader.withTag({ preset: dst, at: 'agg', et: 'self' })
      return team.map(src =>
        entry.reread(reader.withTag({ dst, preset: src, at: 'agg', et: 'teamBuff' })))
    }),
    // Active Member Buff
    ...active.flatMap(dst => {
      const entry = reader.withTag({ preset: dst, at: 'agg', et: 'self' })
      return team.map(src =>
        entry.reread(reader.withTag({ dst, preset: src, at: 'agg', et: 'active' })))
    }),
    // Total Team Stat
    ...team.flatMap(dst => {
      const entry = reader.withTag({ preset: dst, at: 'comp', et: 'team' })
      return team.map(preset => entry.reread(reader.withTag({ preset, at: 'agg', et: 'self' })))
    }),
  ]
}
