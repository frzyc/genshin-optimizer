import Artifact from "../Data/Artifacts/Artifact";
import { ArtCharDatabase } from "../Database/Database";
import { SetFilter } from "../Types/Build";
import { allSlotKeys, ArtifactSetKey } from "../Types/consts";
import { objectFromKeyMap } from "../Util/Util";
import { filterArts } from "./common";
import type { ArtifactBuildData, ArtifactsBySlot, RequestFilter } from "./background";

export function compactArtifacts(db: ArtCharDatabase, mainStatAssumptionLevel: number): ArtifactsBySlot {
  const result: ArtifactsBySlot = {
    base: {},
    values: { flower: [], plume: [], goblet: [], circlet: [], sands: [] }
  }
  const keys = new Set<string>()

  for (const art of db._getArts()) {
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
  result.base = Object.fromEntries([...keys].map(key => [key, 0]))
  return result
}
const noFilter = { kind: "exclude" as const, sets: new Set<ArtifactSetKey>() }
export class SetPerm {
  arts: ArtifactsBySlot
  limit: number
  list: RequestFilter[] = []

  constructor(arts: ArtifactsBySlot, filters: SetFilter[], limit: number) {
    this.arts = arts
    this.limit = limit
    const list = this.list

    const dummy = objectFromKeyMap(allSlotKeys, _ => noFilter)
    function check(request: RequestFilter, filters: Dict<ArtifactSetKey, number>[], remainingSlots: number) {
      if (!filters.length) return
      if (filters.some(filter => !Object.keys(filter).length)) {
        list.push(request)
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
        check(newRequest, newFilters, remainingSlots - 1)
      }
      {
        const newRequest = { ...request, [slot]: { kind: "exclude", sets: keys } }
        const newFilters = filters.filter(filter =>
          Object.values(filter).reduce((a, b) => a + b, 0) < remainingSlots)
        check(newRequest, newFilters, remainingSlots - 1)
      }
    }
    check(dummy, filters.map(filter => {
      const result: Dict<ArtifactSetKey, number> = {}
      filter.forEach(({ key, num }) => key && num && (result[key] = (result[key] ?? 0) + num))
      return result
    }), 5)
  }
  nextPerm(): RequestFilter | undefined {
    while (true) {
      if (!this.list.length) return

      const currentFilter = this.list.pop()!
      const arts = filterArts(this.arts, currentFilter)
      const count = countBuilds(arts)
      if (!count) continue
      if (count <= this.limit)
        return currentFilter

      const canSplitBySet = allSlotKeys
        // TODO: Cache this loop
        .map(slot => ({ slot, sets: new Set(arts.values[slot].map(x => x.set)) }))
        .filter(({ sets }) => sets.size > 1)
        .sort((a, b) => a.sets.size - b.sets.size)[0]
      if (canSplitBySet) {
        const { sets, slot } = canSplitBySet
        this.list.push(...[...sets].map(set => ({
          ...currentFilter, [slot]: { kind: "required", sets: new Set([set]) }
        })))
        continue
      }
      const counts = allSlotKeys
        .map(slot => ({ slot, length: arts.values[slot].length }))
        .filter(x => x.length > 1)
      const minSlot = counts.reduce((a, b) => a.length < b.length ? a : b)
      const numPerSlot = Math.max(Math.floor(this.limit * minSlot.length / count), 1)
      const ids = arts.values[minSlot.slot].map(x => x.id)
      const chunk = Array(Math.ceil(ids.length / numPerSlot)).fill(0).map(_ => new Set<string>())
      ids.forEach((id, i) => chunk[Math.floor(i / numPerSlot)].add(id))
      this.list.push(...chunk.map(ids => ({ ...currentFilter, [minSlot.slot]: { kind: "id", ids } })))
    }
  }
}
export function countBuilds(arts: ArtifactsBySlot): number {
  return allSlotKeys.reduce((_count, slot) => _count * arts.values[slot].length, 1)
}
