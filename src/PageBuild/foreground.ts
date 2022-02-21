import Artifact from "../Data/Artifacts/Artifact";
import { input } from "../Formula";
import { computeUIData } from "../Formula/api";
import { formulaString } from "../Formula/debug";
import { Data, NumNode } from "../Formula/type";
import { constant, setReadNodeKeys } from "../Formula/utils";
import { allMainStatKeys, allSubstats, ICachedArtifact } from "../Types/artifact";
import { SetFilter } from "../Types/Build";
import { allSlotKeys, ArtifactSetKey } from "../Types/consts";
import { deepClone, objectKeyMap, objectMap } from "../Util/Util";
import type { ArtifactBuildData, ArtifactsBySlot, DynStat, RequestFilter } from "./background";
import { countBuilds, filterArts } from "./common";

const dynamic = setReadNodeKeys(deepClone({ dyn: { ...input.art, ...input.artSet } }))
export const dynamicData = {
  art: objectKeyMap([...allMainStatKeys, ...allSubstats], key => dynamic.dyn[key]),
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
  return result
}
export function* artSetPerm(filters: SetFilter[]): Iterable<RequestFilter> {
  function* check(request: RequestFilter, filters: Dict<ArtifactSetKey, number>[], remainingSlots: number) {
    if (!filters.length) return
    if (filters.some(filter => !Object.keys(filter).length)) {
      yield request
      return
    }

    const slot = allSlotKeys[remainingSlots - 1]
    const keys = new Set(filters.flatMap(filter => Object.keys(filter)))
    for (const key of keys) {
      const newRequest = { ...request, [slot]: { kind: "required", sets: new Set([key]) } }
      const newFilters = filters
        .filter(filter => filter[key])
        .map(filter => {
          const result = { ...filter }
          result[key]! -= 1
          if (!result[key]) delete result[key]
          return result
        })
      yield* check(newRequest, newFilters, remainingSlots - 1)
    }
    {
      const newRequest = { ...request, [slot]: { kind: "exclude", sets: keys } }
      const newFilters = filters.filter(filter =>
        Object.values(filter).reduce((a, b) => a + b, 0) < remainingSlots)
      yield* check(newRequest, newFilters, remainingSlots - 1)
    }
  }
  yield* check(objectKeyMap(allSlotKeys, _ => noFilter), filters.map(filter => {
    const result: Dict<ArtifactSetKey, number> = {}
    filter.forEach(({ key, num }) => key && num && (result[key] = (result[key] ?? 0) + num))
    return result
  }), 5)
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

const noFilter = { kind: "exclude" as const, sets: new Set<ArtifactSetKey>() }

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
