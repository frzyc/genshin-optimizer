import { ArtCharDatabase } from "../Database/Database";
import { forEachNodes, mapFormulas } from "../Formula/internal";
import { allOperations, constantFold } from "../Formula/optimization";
import { ConstantNode, NumNode } from "../Formula/type";
import { constant, customRead, max, min } from "../Formula/utils";
import { allSlotKeys, ArtifactSetKey, SlotKey } from "../Types/consts";
import Artifact from "../Data/Artifacts/Artifact";
import { assertUnreachable, objectFromKeyMap } from "../Util/Util";
import type { ArtifactBuildData, ArtifactsBySlot, Build, DynStat, PlotData, RequestFilter } from "./Worker";
import { SetFilter } from "../Types/Build";

export function reaffine(nodes: NumNode[], arts: ArtifactsBySlot): { nodes: NumNode[], arts: ArtifactsBySlot } {
  const affineNodes = new Set<NumNode>(), topLevelAffine = new Set<NumNode>()

  function visit(node: NumNode, isAffine: boolean) {
    if (isAffine) affineNodes.add(node)
    else node.operands.forEach(_op => {
      const op = _op as NumNode
      affineNodes.has(op) && topLevelAffine.add(op)
    })
  }

  const dynKeys = new Set<string>()

  forEachNodes(nodes, _ => { }, f => {
    const operation = f.operation
    switch (operation) {
      case "read":
        if (f.type !== "number" || f.path[0] !== "dyn" || f.accu !== "add")
          throw new Error(`Found unsupported ${operation} node at path ${f.path} when computing affine nodes`)
        dynKeys.add(f.path[1])
        visit(f, true)
        break
      case "add": visit(f, f.operands.every(op => affineNodes.has(op))); break
      case "mul": {
        const nonConst = f.operands.filter(op => op.operation !== "const")
        visit(f, nonConst.length === 0 || (nonConst.length === 1 && affineNodes.has(nonConst[0])))
        break
      }
      case "const":
        if (typeof f.value === "string" || f.value === undefined)
          throw new Error(`Found constant ${f.value} while compacting`)
        visit(f as NumNode, true); break
      case "res": case "threshold_add": case "sum_frac":
      case "max": case "min": visit(f, false); break
      case "data": case "subscript": case "lookup": case "match": case "prio":
        throw new Error(`Found unsupported ${operation} node when computing affine nodes`)
      default: assertUnreachable(operation)
    }
  })

  let current = -1
  function nextDynKey(): string {
    while (dynKeys.has(`${++current}`));
    return `${current}`
  }

  nodes.forEach(node => affineNodes.has(node) && topLevelAffine.add(node))
  const affine = [...topLevelAffine].filter(f => f.operation !== "const")
  const affineMap = new Map(affine.map(node => [node, { ...customRead(["dyn", `${nextDynKey()}`]), accu: "add" as const }]))
  nodes = mapFormulas(nodes, f => affineMap.get(f as NumNode) ?? f, f => f)

  function reaffineArt(stat: DynStat): DynStat {
    const values = constantFold([...affineMap.keys()], {
      dyn: Object.fromEntries(Object.entries(stat).map(([key, value]) => [key, constant(value)]))
    } as any, _ => true)
    return Object.fromEntries([...affineMap.values()].map((v, i) => [v.path[1], (values[i] as ConstantNode<number>).value]))
  }
  const result = {
    nodes, arts: {
      base: reaffineArt(arts.base),
      values: objectFromKeyMap(allSlotKeys, slot =>
        arts.values[slot].map(({ id, set, values }) => ({ id, set, values: reaffineArt(values) })))
    }
  }
  for (const arts of Object.values(result.arts.values))
    for (const { values } of arts)
      for (const [key, baseValue] of Object.entries(result.arts.base))
        values[key] -= baseValue
  return result
}
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
/** Remove artifacts that cannot be in top `numTop` builds */
export function pruneOrder(arts: ArtifactsBySlot, numTop: number): ArtifactsBySlot {
  let progress = false
  const values = objectFromKeyMap(allSlotKeys, slot => {
    const list = arts.values[slot]
    const newList = list.filter(art => {
      let count = 0
      return list.every(other => {
        const greaterEqual = Object.entries(other.values).every(([k, o]) => o >= art.values[k])
        const greater = Object.entries(other.values).some(([k, o]) => o > art.values[k])
        if (greaterEqual && (greater || other.id > art.id)) count++
        return count < numTop
      })
    })
    if (newList.length !== list.length) progress = true
    return newList
  })
  return progress ? { base: arts.base, values } : arts
}
/** Remove artifacts that cannot reach `minimum` in any build */
export function pruneRange(nodes: NumNode[], arts: ArtifactsBySlot, minimum: number[]): ArtifactsBySlot {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, { min: x, max: x }]))
  const wrap = { arts }
  while (true) {
    const artRanges = objectFromKeyMap(allSlotKeys, slot => computeArtRange(wrap.arts.values[slot]))
    const otherArtRanges = objectFromKeyMap(allSlotKeys, key =>
      addArtRange(Object.entries(artRanges).map(a => a[0] === key ? baseRange : a[1]).filter(x => x)))

    let progress = false

    const values = objectFromKeyMap(allSlotKeys, slot => {
      const result = wrap.arts.values[slot].filter(art => {
        const read = addArtRange([computeArtRange([art]), otherArtRanges[slot]])
        const newRange = computeNodeRange(nodes, read)
        return nodes.every((node, i) => newRange.get(node)!.min >= minimum[i])
      })
      if (result.length !== wrap.arts.values[slot].length)
        progress = true
      return result
    })
    if (!progress) return wrap.arts // Make sure we return the original `arts` if there is no progress
    wrap.arts = { base: wrap.arts.base, values }
  }
}
export function pruneNodeRange(nodes: NumNode[], arts: ArtifactsBySlot): NumNode[] {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, value]) => [key, { min: value, max: value }]))
  const reads = addArtRange([baseRange, ...Object.values(arts.values).map(values => computeArtRange(values))])
  const nodeRange = computeNodeRange(nodes, reads)

  return mapFormulas(nodes, f => {
    const { operation } = f
    const operandRanges = f.operands.map(x => nodeRange.get(x)!)
    switch (operation) {
      case "threshold_add": {
        const [value, threshold] = operandRanges
        if (value.min >= threshold.max) return f.operands[2]
        else if (value.max < threshold.min) return constant(0)
        break
      }
      case "min": {
        const newOperands = f.operands.filter((_, i) => {
          const op1 = operandRanges[i]
          return operandRanges.every((op2, j) => op1.min <= op2.max)
        })
        if (newOperands.length < operandRanges.length) return min(...newOperands)
        break
      }
      case "max": {
        const newOperands = f.operands.filter((_, i) => {
          const op1 = operandRanges[i]
          return operandRanges.every(op2 => op1.max >= op2.min)
        })
        if (newOperands.length < operandRanges.length) return max(...newOperands)
        break
      }
    }
    return f
  }, f => f)
}
function addArtRange(ranges: DynMinMax[]): DynMinMax {
  const result: DynMinMax = {}
  ranges.forEach(range =>
    Object.entries(range).forEach(([key, value]) => {
      if (result[key]) {
        result[key].min += value.min
        result[key].max += value.max
      } else result[key] = { ...value }
    }))
  return result
}
function computeArtRange(arts: ArtifactBuildData[]): DynMinMax {
  const result: DynMinMax = {}
  arts.forEach(({ values }) => {
    Object.entries(values).forEach(([key, value]) => {
      if (result[key]) {
        if (result[key].max < value) result[key].max = value
        if (result[key].min > value) result[key].min = value
      } else result[key] = { min: value, max: value }
    })
  })

  return result
}
export function computeNodeRange(nodes: NumNode[], reads: DynMinMax): Map<NumNode, MinMax> {
  const range = new Map<NumNode, MinMax>()

  forEachNodes(nodes, _ => { }, _f => {
    const f = _f as NumNode
    const { operation } = f
    const operands = f.operands.map(op => range.get(op)!)
    let current: MinMax
    switch (operation) {
      case "read":
        if (f.path[0] !== "dyn")
          throw new Error(`Found non-dyn path ${f.path} while computing range`)
        current = reads[f.path[1] as any as number]
        break
      case "const": current = computeMinMax([f.value]); break
      case "subscript": current = computeMinMax(f.list); break
      case "add": case "min": case "max":
        current = {
          min: allOperations[operation](operands.map(x => x.min)),
          max: allOperations[operation](operands.map(x => x.max)),
        }; break
      case "res": current = {
        min: allOperations[operation]([operands[0].max]),
        max: allOperations[operation]([operands[0].min]),
      }; break
      case "mul": current = operands.reduce((accu, current) => computeMinMax([
        accu.min * current.min, accu.min * current.max,
        accu.max * current.min, accu.max * current.max,
      ])); break
      case "threshold_add":
        if (operands[0].min >= operands[1].max) current = operands[2]
        else if (operands[0].max < operands[1].min) current = computeMinMax([0])
        else current = computeMinMax([0], [operands[2]])
        break
      case "sum_frac": {
        const [x, c] = operands, sum = { min: x.min + c.min, max: x.max + c.max }
        if (sum.min <= 0 && sum.max >= 0)
          current = (x.min <= 0 && x.max >= 0) ? { min: NaN, max: NaN } : { min: -Infinity, max: Infinity }
        else
          // TODO: Check this
          current = computeMinMax([
            x.min / sum.min, x.min / sum.max,
            x.max / sum.min, x.max / sum.max
          ])
        break
      }
      case "data": case "lookup": case "match":
        throw new Error(`Unsupported ${operation} node`)
      default: assertUnreachable(operation)
    }
    range.set(f, current)
  })
  return range
}
function computeMinMax(values: readonly number[], minMaxes: readonly MinMax[] = []): MinMax {
  const max = Math.max(...values, ...minMaxes.map(x => x.max))
  const min = Math.min(...values, ...minMaxes.map(x => x.min))
  return { min, max }
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
      if (count <= this.limit) {
        return currentFilter
      }

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
export function filterArts(arts: ArtifactsBySlot, filters: RequestFilter): ArtifactsBySlot {
  return {
    base: arts.base,
    values: objectFromKeyMap(allSlotKeys, slot => {
      const filter = filters[slot]
      switch (filter.kind) {
        case "id": return arts.values[slot].filter(art => filter.ids.has(art.id))
        case "exclude": return arts.values[slot].filter(art => !filter.sets.has(art.set))
        case "required": return arts.values[slot].filter(art => filter.sets.has(art.set))
      }
    })
  }
}
export function countBuilds(arts: ArtifactsBySlot): number {
  return allSlotKeys.reduce((_count, slot) => _count * arts.values[slot].length, 1)
}
export function mergeBuilds(builds: Build[][], maxNum: number): Build[] {
  return builds.flatMap(x => x).sort((a, b) => b.value - a.value).slice(0, maxNum)
}
export function mergePlot(plots: PlotData[]): PlotData {
  const wrap = { scale: 0.01 }
  let reductionScaling = 2, maxCount = 1500
  let keys = new Set(plots.flatMap(x => Object.keys(x).map(k => Math.round(parseFloat(k) / wrap.scale))))
  while (keys.size > maxCount) {
    wrap.scale *= reductionScaling
    keys = new Set([...keys].map(key => Math.round(key / wrap.scale)))
  }
  const result: PlotData = {}
  for (const plot of plots)
    for (const [_x, y] of Object.entries(plot)) {
      const x = Math.round(parseFloat(_x) / wrap.scale) * wrap.scale
      if (!result[x] || result[x]!.value < y.value)
        result[x] = y
    }

  return result
}

type DynMinMax = { [key in string]: MinMax }
type MinMax = { min: number, max: number }
