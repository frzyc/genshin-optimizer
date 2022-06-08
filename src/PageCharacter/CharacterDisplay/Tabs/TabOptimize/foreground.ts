import Artifact from "../../../../Data/Artifacts/Artifact";
import { input } from "../../../../Formula";
import { computeUIData } from "../../../../Formula/api";
import { formulaString } from "../../../../Formula/debug";
import { Data, NumNode } from "../../../../Formula/type";
import { constant, setReadNodeKeys } from "../../../../Formula/utils";
import { allMainStatKeys, allSubstatKeys, ICachedArtifact } from "../../../../Types/artifact";
import { allSlotKeys, ArtifactSetKey } from "../../../../Types/consts";
import { deepClone, objectKeyMap, objectMap } from "../../../../Util/Util";
import type { ArtifactBuildData, ArtifactsBySlot, DynStat, RequestFilter } from "./background";
import { countBuilds, filterArts } from "./common";

const dynamic = setReadNodeKeys(deepClone({ dyn: { ...input.art, ...input.artSet } }))
export const dynamicData = {
  art: objectKeyMap([...allMainStatKeys, ...allSubstatKeys], key => dynamic.dyn[key]),
  artSet: objectMap(input.artSet, (_, key) => dynamic.dyn[key]),
}

export function compactArtifacts(arts: ICachedArtifact[], mainStatAssumptionLevel: number): ArtifactsBySlot {
  const result: ArtifactsBySlot = {
    base: {},
    values: { flower: [], plume: [], goblet: [], circlet: [], sands: [] }
  }
  const keys = new Set<string>()

  for (const art of arts) {
    const mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level))

    const data: ArtifactBuildData = {
      id: art.id, set: art.setKey,
      values: {
        [art.setKey]: 1,
        [art.mainStatKey]: art.mainStatKey.endsWith('_') ? mainStatVal / 100 : mainStatVal,
        ...Object.fromEntries(art.substats.map(substat =>
          [substat.key, substat.key.endsWith('_') ? substat.accurateValue / 100 : substat.accurateValue]))
      },
    }
    delete data.values[""]
    result.values[art.slotKey].push(data)
    Object.keys(data.values).forEach(x => keys.add(x))
  }
  result.base = objectKeyMap([...keys], _ => 0)
  for (const value of Object.values(result.values))
    value.push({ id: "", values: {} })
  return result
}
// TODO: Use this as the new set filter
type _SetFilter = { key: ArtifactSetKey | "", min?: number, max?: number }[]
/**
 * Computes a (disjoint) list of all request filters that satisfy `filter`.
 * `filters` is expressed as a disjunctive normal form, e.g., a request filter
 * satisfies `filter` of
 *
 * ```
 * [
 *   [ condition1, condition2 ],
 *   [ condition3, condition4 ],
 * ]
 * ```
 *
 * if
 * - Both `condition1` AND `condition2` are met, or
 * - Both `condition3` and `condition4` are met.
 */
export function* artSetPerm(_filters: _SetFilter[]): Iterable<RequestFilter> {
  type Filters = Dict<ArtifactSetKey, { min: number, max: number }>

  const allFilters: Filters[] = _filters.map(fs => {
    const result: Dict<ArtifactSetKey, { min: number, max: number }> = {}
    fs.forEach(({ key, min, max }) => {
      if (!key) return
      if (!result[key]) result[key] = { min: 0, max: 5 }
      const obj = result[key]!
      obj.min = Math.max(obj.min, min ?? 0)
      obj.max = Math.min(obj.max, max ?? 5)
    })
    return result
  }).filter(fs => Object.values(fs).every(f => f.min <= f.max))

  // Remove unnecessary or impossible filters
  function cleanFilters(result: Filters[], remainingSlots: number): Filters[] {
    return result.map(result => {
      result = { ...result }
      for (const [key, value] of Object.entries(result)) {
        if (value.min === 0 && value.max >= remainingSlots)
          // Unnecessary filter
          delete result[key]
      }
      return result
    }).filter(fs =>
      // Keep only possible filters
      Object.values(fs).reduce((a, b) => a + b.min, 0) <= remainingSlots
    )
  }

  const noFilter = { kind: "exclude" as const, sets: new Set<ArtifactSetKey>() }
  const result: RequestFilter = objectKeyMap(allSlotKeys, _ => noFilter)
  function* check(_filters: Filters[], remainingSlots: number) {
    const filters = cleanFilters(_filters, remainingSlots)
    if (!filters.length) return
    if (filters.some(fs => !Object.keys(fs).length)) {
      yield { ...result }
      return
    }

    const slot = allSlotKeys[remainingSlots - 1]
    const relevantSets = new Set(filters.flatMap(fs => Object.keys(fs)))
    for (const set of relevantSets) {
      result[slot] = { kind: "required", sets: new Set([set]) }
      const newFilters = filters.map(fs => {
        const obj = fs[set]
        if (obj)
          return { ...fs, [set]: { min: obj.min ? obj.min - 1 : 0, max: obj.max - 1 } }
        return fs
      })
      yield* check(newFilters, remainingSlots - 1)
    }
    result[slot] = { kind: "exclude", sets: relevantSets }
    yield* check(filters, remainingSlots - 1)
    result[slot] = noFilter
  }
  yield* check(allFilters, 5)
}
export function* splitFiltersBySet(_arts: ArtifactsBySlot, filters: Iterable<RequestFilter>, limit: number): Iterable<RequestFilter> {
  if (limit < 10000) limit = 10000

  for (const filter of filters) {
    const filters = [filter]

    while (filters.length) {
      const filter = filters.pop()!
      const arts = filterArts(_arts, filter)
      const count = countBuilds(arts)
      if (count <= limit) {
        if (count) yield filter
        continue
      }

      const candidates = allSlotKeys
        // TODO: Cache this loop
        .map(slot => ({ slot, sets: new Set(arts.values[slot].map(x => x.set)) }))
        .filter(({ sets }) => sets.size > 1)
      if (!candidates.length) {
        yield* splitFilterByIds(arts, filter, limit)
        continue
      }
      const { sets, slot } = candidates.reduce((a, b) => a.sets.size < b.sets.size ? a : b)
      sets.forEach(set => filters.push({ ...filter, [slot]: { kind: "required", sets: new Set([set]) } }))
    }
  }
}
function* splitFilterByIds(_arts: ArtifactsBySlot, filter: RequestFilter, limit: number): Iterable<RequestFilter> {
  const filters = [filter]

  while (filters.length) {
    const filter = filters.pop()!
    const arts = filterArts(_arts, filter)
    const count = countBuilds(arts)
    if (count <= limit) {
      if (count) yield filter
      continue
    }

    const candidates = allSlotKeys
      .map(slot => ({ slot, length: arts.values[slot].length }))
      .filter(x => x.length > 1)
    const { slot, length } = candidates.reduce((a, b) => a.length < b.length ? a : b)

    const numChunks = Math.ceil(count / limit)
    const boundedNumChunks = Math.min(numChunks, length)
    const chunk = Array(boundedNumChunks).fill(0).map(_ => new Set<string>())
    arts.values[slot].forEach(({ id }, i) => chunk[i % boundedNumChunks].add(id))
    if (numChunks > length) {
      chunk.forEach(ids => filters.push({ ...filter, [slot]: { kind: "id", ids } }))
    } else {
      for (const ids of chunk)
        yield { ...filter, [slot]: { kind: "id", ids } }
    }
  }
}

// const noFilter = { kind: "exclude" as const, sets: new Set<ArtifactSetKey>() }

export function debugCompute(nodes: NumNode[], base: DynStat, arts: ArtifactBuildData[]) {
  const stats = { ...base }
  for (const art of arts) {
    for (const [key, value] of Object.entries(art.values)) {
      stats[key] = (stats[key] ?? 0) + value
    }
  }
  const data = { dyn: Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, constant(value)])) } as Data
  const uiData = computeUIData([data])
  return {
    base, arts, stats,
    data, uiData,
    nodes: nodes.map(formulaString),
    results: nodes.map(node => uiData.get(node)),
  }
}
