import { ArtCharDatabase } from "../Database/Database";
import { dataObjForArtifact, mergeData } from "../Formula/api";
import { forEachNodes, mapFormulas } from "../Formula/internal";
import { allOperations, constantFold } from "../Formula/optimization";
import { ConstantNode, Data, NumNode, StrNode } from "../Formula/type";
import { customRead } from "../Formula/utils";
import { allSlotKeys, ArtifactSetKey } from "../Types/consts";
import { assertUnreachable, objectFromKeyMap } from "../Util/Util";
import { ArtifactsBySlot, Build, PlotData, RequestFilter } from "./Worker";

export function compactNodes(nodes: NumNode[]): CompactNodes {
  const affineNodes = new Set<NumNode>(), topLevelAffine = new Set<NumNode>()

  function visit(node: NumNode, isAffine: boolean) {
    if (isAffine) affineNodes.add(node)
    else node.operands.forEach(_op => {
      const op = _op as NumNode
      affineNodes.has(op) && topLevelAffine.add(op)
    })
  }

  forEachNodes(nodes, _ => { }, f => {
    const operation = f.operation
    switch (operation) {
      case "read":
        if (f.type !== "number")
          throw new Error(`Found unsupported ${operation} node when computing affine nodes`)
        visit(f, f.accu === "add"); break
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

  nodes.forEach(node => affineNodes.has(node) && topLevelAffine.add(node))
  const affine = [...topLevelAffine].filter(f => f.operation !== "const")
  const affineMap = new Map(affine.map((node, i) => [node, customRead(["aff", `${i}`])]))
  nodes = mapFormulas(nodes, f => affineMap.get(f as NumNode) ?? f, f => f)
  return { nodes, affine }
}
export function compactArtifacts(db: ArtCharDatabase, affine: NumNode[], data: Data, mainStatAssumptionLevel: number): ArtifactsBySlot {
  const result: ArtifactsBySlot = { flower: [], plume: [], goblet: [], circlet: [], sands: [] }
  const base = (constantFold(affine, data, _ => true) as ConstantNode<number>[])
    .map(x => x.value)

  for (const art of db._getArts()) {
    const artData = dataObjForArtifact(art, mainStatAssumptionLevel)
    result[art.slotKey].push({
      id: art.id, set: art.setKey,
      values: (constantFold(affine, mergeData([data, artData]), _ => true) as ConstantNode<number>[])
        .map((x, i) => x.value - base[i])
    })
  }
  return result
}
/** Remove artifacts that cannot be in top `numTop` builds */
export function pruneOrder(arts: ArtifactsBySlot, numTop: number): ArtifactsBySlot {
  let progress = false
  const newArts = objectFromKeyMap(allSlotKeys, slot => {
    const list = arts[slot]
    const newList = list.filter(art => {
      let count = 0
      return list.every(other => {
        const greaterEqual = other.values.every((o, i) => o >= art.values[i])
        const greater = other.values.some((o, i) => o > art.values[i])
        if (greaterEqual && (greater || other.id > art.id)) count++
        return count < numTop
      })
    })
    if (newList.length !== list.length) progress = true
    return newList
  })
  return progress ? newArts : arts
}
/** Remove artifacts that cannot reach `minimum` in any build */
export function pruneRange(nodes: NumNode[], arts: ArtifactsBySlot, minimum: number[]): ArtifactsBySlot {
  while (true) {
    const artRanges = objectFromKeyMap(allSlotKeys, slot => arts[slot].reduce((prev, cur) =>
      prev.map((value, i) => computeMinMax([cur.values[i]], [value])),
      Array(arts[slot][0].values.length).fill({ min: Infinity, max: -Infinity })))
    const otherArtRanges = objectFromKeyMap(allSlotKeys, key => allSlotKeys
      .map(other => key === other ? [...artRanges[other]].fill({ min: 0, max: 0 }) : artRanges[other])
      .reduce((accu, other) => accu.map((x, i) => ({ min: x.min + other[i].min, max: x.max + other[i].max }))))

    let progress = false

    const newArts = objectFromKeyMap(allSlotKeys, slot => {
      const result = arts[slot].filter(art => {
        const read = otherArtRanges[slot].map((x, i) => ({ min: art.values[i] + x.min, max: art.values[i] + x.max }))
        const newRange = computeRange(nodes, read)
        return nodes.every((node, i) => newRange.get(node)!.min >= minimum[i])
      })
      if (result.length !== arts[slot].length)
        progress = true
      return result
    })
    if (!progress) return arts // Make sure we return the original `arts` if there is no progress
    arts = newArts
  }
}
export function computeRange(nodes: NumNode[], reads: MinMax[]): Map<NumNode, MinMax> {
  const range = new Map<NumNode, MinMax>()

  forEachNodes(nodes, _ => { }, _f => {
    const f = _f as NumNode
    const { operation } = f
    const operands = f.operands.map(op => range.get(op)!)
    let current: MinMax
    switch (operation) {
      case "read": current = reads[f.path[1] as any as number]; break
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
export function* setPermutations(setFilters: Dict<ArtifactSetKey, number>): Iterable<RequestFilter> {
  const list = [{
    value: [] as (ArtifactSetKey | "other")[],
    remaining: setFilters,
    otherRemaining: Object.values(setFilters).reduce((a, b) => a - b, 5)
  }]
  const otherCommand = { kind: "exclude", sets: new Set(Object.keys(setFilters)) } as const

  while (list.length) {
    const { value, remaining, otherRemaining } = list.pop()!
    if (!Object.keys(remaining).length) {
      yield objectFromKeyMap(allSlotKeys, (_, i) => {
        const set = value[i]
        if (set === "other") return otherCommand
        if (!set) return { kind: "exclude", sets: new Set() }
        return { kind: "required", sets: new Set([set]) }
      })
      continue
    }
    for (const set of ["other" as const, ...Object.keys(remaining)]) {
      if (set === "other" && !otherRemaining) continue

      const newValue = [...value, set], newRemaining = { ...remaining }
      let newOtherRemaining = otherRemaining
      if (set !== "other") {
        newRemaining[set]! -= 1
        if (newRemaining[set]! <= 0) delete newRemaining[set]
      } else newOtherRemaining -= 1
      list.push({ value: newValue, remaining: newRemaining, otherRemaining: newOtherRemaining })
    }
  }
}
export function filterArts(arts: ArtifactsBySlot, filters: RequestFilter): ArtifactsBySlot {
  return objectFromKeyMap(allSlotKeys, slot => {
    const filter = filters[slot]
    switch (filter.kind) {
      case "id": return arts[slot].filter(art => filter.ids.has(art.id))
      case "exclude": return arts[slot].filter(art => !filter.sets.has(art.set))
      case "required": return arts[slot].filter(art => filter.sets.has(art.set))
    }
  })
}
export function countBuilds(arts: ArtifactsBySlot): number {
  return allSlotKeys.reduce((_count, slot) => arts[slot].length, 1)
}
export function mergeBuilds(builds: Build[][], maxNum: number): Build[] {
  return builds.flatMap(x => x).sort((a, b) => b.value - a.value).slice(0, maxNum)
}
export function mergePlot(plots: PlotData[]): PlotData {
  let scale = 0.01, reductionScaling = 2, maxCount = 1500
  let keys = new Set(plots.flatMap(x => Object.keys(x).map(k => Math.round(parseFloat(k) / scale))))
  while (keys.size > maxCount) {
    scale *= reductionScaling
    keys = new Set([...keys].map(key => Math.round(key / scale)))
  }
  const result: PlotData = {}
  for (const plot of plots)
    for (const [_x, y] of Object.entries(plot)) {
      const x = Math.round(parseFloat(_x) / scale) * scale
      if (!result[x] || result[x]!.value < y.value)
        result[x] = y
    }

  return result
}

type MinMax = { min: number, max: number }
type CompactNodes = { nodes: NumNode[], affine: NumNode[] }
