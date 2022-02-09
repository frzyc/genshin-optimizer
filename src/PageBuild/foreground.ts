import Artifact from "../Data/Artifacts/Artifact";
import { SetFilter } from "../Types/Build";
import { allSlotKeys, ArtifactSetKey } from "../Types/consts";
import { deepClone, objectKeyMap, objectMap } from "../Util/Util";
import { countBuilds, filterArts } from "./common";
import type { ArtifactBuildData, ArtifactsBySlot, RequestFilter } from "./background";
import { allMainStatKeys, allSubstats, ICachedArtifact } from "../Types/artifact_WR";
import { setReadNodeKeys } from "../Formula/utils";
import { input } from "../Formula";

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
        /* TODO: Use accurate value */
        ...Object.fromEntries(art.substats.map(substat =>
          [substat.key, substat.key.endsWith('_') ? substat.value / 100 : substat.value]))
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
export function* breakSetPermBySet(_arts: ArtifactsBySlot, perms: Iterable<RequestFilter>, limit: number): Iterable<RequestFilter> {
  if (limit < 100) limit = 100

  for (const perm of perms) {
    const list = [perm]

    while (list.length) {
      const currentFilter = list.pop()!
      const arts = filterArts(_arts, currentFilter)
      const count = countBuilds(arts)
      if (count <= limit) {
        if (count)
          yield currentFilter
        continue
      }

      const canSplitBySet = allSlotKeys
        // TODO: Cache this loop
        .map(slot => ({ slot, sets: new Set(arts.values[slot].map(x => x.set)) }))
        .filter(({ sets }) => sets.size > 1)
        .sort((a, b) => a.sets.size - b.sets.size)[0]
      if (canSplitBySet) {
        const { sets, slot } = canSplitBySet
        list.push(...[...sets].map(set => ({
          ...currentFilter, [slot]: { kind: "required", sets: new Set([set]) }
        })))
        continue
      }
      const counts = allSlotKeys
        .map(slot => ({ slot, length: arts.values[slot].length }))
        .filter(x => x.length > 1)
      const minSlot = counts.reduce((a, b) => a.length < b.length ? a : b)
      const numPerSlot = Math.max(Math.floor(limit * minSlot.length / count), 1)
      const ids = arts.values[minSlot.slot].map(x => x.id)
      const chunk = Array(Math.ceil(ids.length / numPerSlot)).fill(0).map(_ => new Set<string>())
      ids.forEach((id, i) => chunk[Math.floor(i / numPerSlot)].add(id))
      list.push(...chunk.map(ids => ({ ...currentFilter, [minSlot.slot]: { kind: "id", ids } })))
    }
  }
}

const noFilter = { kind: "exclude" as const, sets: new Set<ArtifactSetKey>() }
