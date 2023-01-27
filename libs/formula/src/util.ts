import { Artifact, Character, convert, Data, Preset, reader, selfTag, Stat, Weapon } from './data/util'
import { write as writeChar } from './data/char/util'
import { write as writeWeapon } from './data/weapon/util'

export function charData(preset: Preset, data: {
  name: Character, lvl: number, ascension: number, constellation: number
  custom: Record<string, number | string>
}): Data {
  const { lvl, ascension, constellation } = convert(selfTag, { preset, et: 'self' }).char
  const { custom } = writeChar(data.name, { preset })

  return [
    reader.withTag({ src: 'agg', preset }).reread(reader.with('src', data.name)),
    reader.withTag({ src: 'isoSum', preset }).reread(reader.with('src', data.name)),

    lvl.addNode(data.lvl),
    ascension.addNode(data.ascension),
    constellation.addNode(data.constellation),
    ...Object.entries(data.custom).map(([k, v]) =>
      custom[k].addNode(v)),
  ]
}

export function weaponData(preset: Preset, data: {
  name: Weapon, lvl: number, ascension: number, refinement: number
  custom: Record<string, number | string>
}): Data {
  const { lvl, ascension, refinement } = convert(selfTag, { preset, et: 'self' }).weapon
  const { custom } = writeWeapon(data.name, { preset })

  return [
    reader.withTag({ src: 'agg', preset }).reread(reader.with('src', data.name)),
    reader.withTag({ src: 'isoSum', preset }).reread(reader.with('src', data.name)),

    lvl.addNode(data.lvl),
    ascension.addNode(data.ascension),
    refinement.addNode(data.refinement),
    ...Object.entries(data.custom).map(([k, v]) =>
      custom[k].addNode(v)),
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
    ...Object.entries(sets).map(([k, v]) => count.with('src', k as Artifact).addNode(v)),
    ...Object.entries(stats).map(([k, v]) => premod[k as Stat].addNode(v)),
  ]
}

export function teamData(team: Preset[], active: Preset[]): Data {
  return [
    // Team Buff
    ...team.flatMap(dst => {
      const entry = reader.withTag({ preset: dst, et: 'self', src: 'agg' })
      return team.map(src =>
        entry.reread(reader.withTag({ dst, preset: src, et: 'teamBuff' })))
    }),
    // Active Member Buff
    ...active.flatMap(dst => {
      const entry = reader.withTag({ preset: dst, et: 'self', src: 'agg' })
      return team.map(src =>
        entry.reread(reader.withTag({ dst, preset: src, et: 'active' })))
    }),
    // Total Team Stat
    ...(['agg', 'isoSum'] as const).flatMap(src =>
      team.flatMap(dst => {
        const entry = reader.withTag({ preset: dst, et: 'team', src })
        return team.map(preset => entry.reread(reader.withTag({ preset, et: 'self' })))
      })),
  ]
}
