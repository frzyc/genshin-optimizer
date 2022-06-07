import Artifact from "../../../../Data/Artifacts/Artifact";
import { input } from "../../../../Formula";
import { computeUIData } from "../../../../Formula/api";
import { formulaString } from "../../../../Formula/debug";
import { Data, NumNode } from "../../../../Formula/type";
import { constant, setReadNodeKeys } from "../../../../Formula/utils";
import { allMainStatKeys, allSubstatKeys, ICachedArtifact } from "../../../../Types/artifact";
import { allSlotKeys, ArtifactSetKey } from "../../../../Types/consts";
import { deepClone, objectKeyMap, objectMap, range } from "../../../../Util/Util";
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
export function* artSetPerm(exclusion: Dict<ArtifactSetKey, number[]>, _artSets: ArtifactSetKey[], excludeRainbow: number = 6): Iterable<RequestFilter> {
  const artSets = [...new Set(_artSets)]
  let shapes: number[][] = []
  function populateShapes(current: number[], list: Set<number>, rainbows: number[]) {
    if (current.length === 5) {
      if (rainbows.length < excludeRainbow)
        shapes.push(current)
      return
    }
    for (const i of list) populateShapes([...current, i], list, rainbows.filter(j => j !== i))
    populateShapes([...current, current.length], new Set([...list, current.length]), [...rainbows, current.length])
  }
  populateShapes([0], new Set([0]), [0])
  function indexOfShape(shape: number[], replacing: number) {
    shape = [...shape]
    let newIndex: number | undefined = undefined
    for (let i = replacing + 1; i < 5; i++) {
      if (shape[i] === replacing) {
        if (!newIndex) newIndex = i
        shape[i] = newIndex
      }
    }
    shape[replacing] = 5
    return shape.reduce((a, b) => a * 6 + b, 0)
  }
  function shapeOfIndex(index: number) {
    const shape: number[] = []
    for (let i = 0; i < 5; i++) {
      shape.push(index % 6)
      index = Math.floor(index / 6)
    }
    return shape.reverse()
  }
  for (let index = 4; index > 0; index--) {
    const required: Map<number, number> = new Map()
    for (const shape of shapes) {
      const id = indexOfShape(shape, index)
      required.set(id, (required.get(id) ?? new Set(shape.slice(0, index)).size + 1) - 1)
    }
    for (const [id, remaining] of required.entries()) {
      if (remaining === 0) {
        shapes = shapes.filter(shape => indexOfShape(shape, index) !== id)
        shapes.push(shapeOfIndex(id))
      }
    }
  }

  const noFilter = { kind: "exclude" as const, sets: new Set<ArtifactSetKey>() }
  const result: RequestFilter = objectKeyMap(allSlotKeys, _ => noFilter)

  const setCounts = { ...objectMap(exclusion, _ => 0), ...objectKeyMap(artSets, _ => 0) }
  const allowedSets = objectMap(exclusion, v => {
    if (v.includes(2)) return new Set(v.includes(4) ? [0, 1] : [0, 1, 4, 5])
    return new Set(v.includes(4) ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5])
  })

  function* check(shape: number[]) {
    const using: Set<ArtifactSetKey> = new Set()
    let mapping: number[][] = [], free: number[] = []
    for (const i of shape) {
      mapping.push([])
      if (i === 5) free.push(mapping.length - 1)
      else mapping[i].push(mapping.length - 1)
    }
    mapping = mapping.filter(v => v.length).sort((a, b) => b.length - a.length)
    let remainingFree = free.length, totalRequiredFree = 0

    // Inception.. because js doesn't like functions inside a for-loop
    function* check(i: number) {
      if (i === mapping.length) {
        return yield* check_free(0)
      }

      for (const set of artSets) {
        if (using.has(set)) continue
        const length = mapping[i].length, allowedSet = allowedSets[set]
        let requiredFree = 0

        if (allowedSet && !allowedSet.has(length)) {
          // This particular requiredFree/remainingFree dynamic requires that the `allowedSet`
          // has at most one gap. Should there be more, this early exit wouldn't work.
          requiredFree = (range(length + 1, 5).find(l => allowedSet.has(l)) ?? 6) - length
          if (totalRequiredFree + requiredFree > remainingFree) continue // Not enough free slots. Next..
        }

        using.add(set)
        setCounts[set] = mapping[i].length
        mapping[i].forEach(j => result[allSlotKeys[j]] = { kind: "required", sets: new Set([set]) })
        totalRequiredFree += requiredFree

        yield* check(i + 1)

        totalRequiredFree -= requiredFree
        setCounts[set] = 0
        using.delete(set)
      }
    }
    function* check_free(i: number) {
      if (i === free.length) {
        yield { ...result }
        return
      }
      const remaining = free.length - i, isolated: ArtifactSetKey[] = [], missing: ArtifactSetKey[] = [], rejected: ArtifactSetKey[] = []
      let required = 0
      for (const set of artSets) {
        const allowedSet = allowedSets[set], count = setCounts[set]
        if (!allowedSet) continue
        if (range(1, remaining).every(j => !allowedSet.has(count + j))) rejected.push(set)
        else if (!allowedSet.has(count)) {
          required += [...allowedSet].find(x => x > count)! - count
          missing.push(set)
        }
        else if (range(0, remaining).some(j => !allowedSet.has(count + j))) isolated.push(set)
      }
      if (required === remaining) {
        for (const set of missing) {
          setCounts[set]++
          result[allSlotKeys[free[i]]] = { kind: "required", sets: new Set([set]) }
          yield* check_free(i + 1)
          setCounts[set]--
        }
        return
      }
      for (const set of [...isolated, ...missing]) {
        setCounts[set]++
        result[allSlotKeys[free[i]]] = { kind: "required", sets: new Set([set]) }
        yield* check_free(i + 1)
        setCounts[set]--
      }
      result[allSlotKeys[free[i]]] = { kind: "exclude", sets: new Set([...missing, ...rejected, ...isolated]) }
      yield* check_free(i + 1)
    }
    yield* check(0)
  }
  for (const shape of shapes) yield* check(shape)
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
