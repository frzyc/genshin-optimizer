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
export function exclusionToAllowed(exclusion: number[] | undefined): Set<number> {
  return new Set(exclusion?.includes(2)
    ? exclusion.includes(4) ? [0, 1] : [0, 1, 4, 5]
    : exclusion?.includes(4) ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5])
}
export function* filterFeasiblePerm(filters: Iterable<RequestFilter>, _artSets: ArtifactsBySlot): Iterable<RequestFilter> {
  const artSets = objectMap(_artSets.values, values => new Set(values.map(v => v.set)))
  filter_loop: for (const filter of filters) {
    for (const [slot, f] of Object.entries(filter)) {
      const available = artSets[slot]!
      switch (f.kind) {
        case "required": if ([...f.sets].every(s => !available.has(s))) continue filter_loop; break
        case "exclude": if ([...available].every(s => f.sets.has(s!))) continue filter_loop; break
        case "id": break
      }
    }
    yield filter
  }
}
/** A *disjoint* set of `RequestFilter` satisfying the exclusion rules */
export function* artSetPerm(exclusion: Dict<ArtifactSetKey | "rainbow", number[]>, _artSets: ArtifactSetKey[]): Iterable<RequestFilter> {
  /**
   * This generation algorithm is separated into two parts:
   * - "Shape" generation
   *   - It first generates all build "shapes", e.g., AABBC, ABBCD
   *   - It then filters the generated shapes according to the rainbow exclusion, e.g., removes ABBCD if excluding 3 rainbows
   *   - It then merges the remaining shapes into wildcards, e.g. AABAA + AABAB + AABAC => AABA*
   * - Shape filling
   *   - From the given shapes, it tries to fill in all non-rainbow slots, e.g., slots A and B of AABBC, with actual artifacts
   *   - It then fills the rainbow slots, e.g., slot C of AABBC while ensuring the exclusion rule of each sets
   */
  const artSets = [...new Set(_artSets)], allowedRainbows = exclusionToAllowed(exclusion.rainbow)
  let shapes: number[][] = []
  function populateShapes(current: number[], list: Set<number>, rainbows: number[]) {
    if (current.length === 5) {
      if (allowedRainbows.has(rainbows.length))
        shapes.push(current)
      return
    }
    for (const i of list) populateShapes([...current, i], list, rainbows.filter(j => j !== i))
    populateShapes([...current, current.length], new Set([...list, current.length]), [...rainbows, current.length])
  }
  populateShapes([0], new Set([0]), [0])
  function indexOfShape(shape: number[], replacing: number) {
    if (range(replacing + 1, 4).some(i => shape[i] !== 5))
      return undefined
    shape = [...shape]
    shape[replacing] = 5
    return shape.reduce((a, b) => a * 6 + b, 0)
  }
  for (let replacing = 4; replacing >= 0; replacing--) {
    const required: Map<number, number> = new Map()
    for (const shape of shapes) {
      const id = indexOfShape(shape, replacing)
      if (id === undefined) continue
      required.set(id, (required.get(id) ?? new Set(shape.slice(0, replacing)).size + 1) - 1)
    }
    for (const [id, remaining] of required.entries()) {
      if (remaining === 0) {
        const shape = [...shapes.find(shape => indexOfShape(shape, replacing) === id)!]
        shape[replacing] = 5
        shapes = shapes.filter(shape => indexOfShape(shape, replacing) !== id)
        shapes.push(shape)
      }
    }
  }

  // Shapes are now calculated and merged, proceed to fill in the sets

  const noFilter = { kind: "exclude" as const, sets: new Set<ArtifactSetKey>() }
  const result: RequestFilter = objectKeyMap(allSlotKeys, _ => noFilter)

  const counts = { ...objectMap(exclusion, _ => 0), ...objectKeyMap(artSets, _ => 0) }
  const allowedCounts = objectMap(exclusion, exclusionToAllowed)

  function* check(shape: number[]) {
    const used: Set<ArtifactSetKey> = new Set()
    let groupped: number[][] = [], rainbows: number[] = []
    for (const i of shape) {
      groupped.push([])
      if (i === 5) rainbows.push(groupped.length - 1)
      else groupped[i].push(groupped.length - 1)
    }
    groupped = groupped.filter(v => v.length).sort((a, b) => b.length - a.length)
    let usableRainbows = rainbows.length

    // Inception.. because js doesn't like functions inside a for-loop
    function* check(i: number) {
      if (i === groupped.length)
        return yield* check_free(0)

      for (const set of artSets) {
        if (used.has(set)) continue
        const length = groupped[i].length, allowedSet = allowedCounts[set]
        let requiredRainbows = 0

        if (allowedSet && !allowedSet.has(length)) {
          // Look ahead and see if we have enough rainbows to fill to the next `allowedSet` if we use the current set
          requiredRainbows = (range(length + 1, 5).find(l => allowedSet.has(l)) ?? 6) - length
          if (requiredRainbows > usableRainbows) continue // Not enough rainbows. Next..
        }

        used.add(set)
        counts[set] = groupped[i].length
        groupped[i].forEach(j => result[allSlotKeys[j]] = { kind: "required", sets: new Set([set]) })
        usableRainbows -= requiredRainbows

        yield* check(i + 1)

        usableRainbows += requiredRainbows
        counts[set] = 0
        used.delete(set)
      }
    }
    // We separate filling rainbow slots from groupped slots because it has an entirely
    // different set of rules regarding what can be filled and what states to be kept.
    function* check_free(i: number) {
      const remaining = rainbows.length - i, isolated: ArtifactSetKey[] = [], missing: ArtifactSetKey[] = [], rejected: ArtifactSetKey[] = []
      let required = 0
      for (const set of artSets) {
        const allowedSet = allowedCounts[set], count = counts[set]
        if (!allowedSet) continue
        if (range(1, remaining).every(j => !allowedSet.has(count + j))) rejected.push(set)
        else if (!allowedSet.has(count)) {
          required += [...allowedSet].find(x => x > count)! - count
          missing.push(set)
        }
        else if (range(0, remaining).some(j => !allowedSet.has(count + j))) isolated.push(set)
      }
      if (required > remaining) return
      if (i === rainbows.length) {
        yield { ...result }
        return
      }
      if (required === remaining) {
        for (const set of missing) {
          counts[set]++
          result[allSlotKeys[rainbows[i]]] = { kind: "required", sets: new Set([set]) }
          yield* check_free(i + 1)
          counts[set]--
        }
        return
      }
      for (const set of [...isolated, ...missing]) {
        counts[set]++
        result[allSlotKeys[rainbows[i]]] = { kind: "required", sets: new Set([set]) }
        yield* check_free(i + 1)
        counts[set]--
      }
      result[allSlotKeys[rainbows[i]]] = { kind: "exclude", sets: new Set([...missing, ...rejected, ...isolated]) }
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
