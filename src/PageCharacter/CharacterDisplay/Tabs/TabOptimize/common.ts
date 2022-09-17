import { ArtSetExclusion } from "../../../../Database/Data/BuildsettingData";
import { forEachNodes, mapFormulas } from "../../../../Formula/internal";
import { allOperations, constantFold } from "../../../../Formula/optimization";
import { ConstantNode, NumNode } from "../../../../Formula/type";
import { constant, customRead, max, min } from "../../../../Formula/utils";
import { allSlotKeys, ArtifactSetKey, SlotKey } from "../../../../Types/consts";
import { assertUnreachable, objectKeyMap, objectMap, range } from "../../../../Util/Util";

type DynMinMax = { [key in string]: MinMax }
type MinMax = { min: number, max: number }

type MicropassOperation = "reaffine" | "pruneArtRange" | "pruneNodeRange" | "pruneOrder"
export function pruneAll(nodes: NumNode[], minimum: number[], arts: ArtifactsBySlot, numTop: number, exclusion: ArtSetExclusion, forced: Dict<MicropassOperation, boolean>): { nodes: NumNode[], arts: ArtifactsBySlot } {
  let should = forced
  /** If `key` makes progress, all operations in `value` should be performed */
  const deps: StrictDict<MicropassOperation, Dict<MicropassOperation, true>> = {
    pruneOrder: { pruneNodeRange: true },
    pruneArtRange: { pruneNodeRange: true },
    pruneNodeRange: { reaffine: true },
    reaffine: { pruneOrder: true, pruneArtRange: true, pruneNodeRange: true }
  }
  let count = 0
  while (Object.values(should).some(x => x) && count++ < 20) {
    if (should.pruneOrder) {
      delete should.pruneOrder
      const newArts = pruneOrder(arts, numTop, exclusion)
      if (arts !== newArts) {
        arts = newArts
        should = { ...should, ...deps.pruneOrder }
      }
    }
    if (should.pruneArtRange) {
      delete should.pruneArtRange
      const newArts = pruneArtRange(nodes, arts, minimum)
      if (arts !== newArts) {
        arts = newArts
        should = { ...should, ...deps.pruneArtRange }
      }
    }
    if (should.pruneNodeRange) {
      delete should.pruneNodeRange
      const newNodes = pruneNodeRange(nodes, arts)
      if (nodes !== newNodes) {
        nodes = newNodes
        should = { ...should, ...deps.pruneNodeRange }
      }
    }
    if (should.reaffine) {
      delete should.reaffine
      const { nodes: newNodes, arts: newArts } = reaffine(nodes, arts)
      if (nodes !== newNodes || arts !== newArts) {
        nodes = newNodes
        arts = newArts
        should = { ...should, ...deps.reaffine }
      }
    }
  }
  return { nodes, arts }
}

function reaffine(nodes: NumNode[], arts: ArtifactsBySlot, forceRename: boolean = false): { nodes: NumNode[], arts: ArtifactsBySlot } {
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
      case "res": case "threshold": case "sum_frac":
      case "max": case "min": visit(f, false); break
      case "data": case "subscript": case "lookup": case "match": case "prio": case "small":
        throw new Error(`Found unsupported ${operation} node when computing affine nodes`)
      default: assertUnreachable(operation)
    }
  })

  if ([...topLevelAffine].every(({ operation }) => operation === "read" || operation === "const") &&
    Object.keys(arts.base).length === dynKeys.size)
    return { nodes, arts }

  let current = -1
  function nextDynKey(): string {
    while (dynKeys.has(`${++current}`));
    return `${current}`
  }

  nodes.forEach(node => affineNodes.has(node) && topLevelAffine.add(node))
  const affine = [...topLevelAffine].filter(f => f.operation !== "const")
  const affineMap = new Map(affine.map(node => [node,
    !forceRename && node.operation === "read" && node.path[0] === "dyn"
      ? node
      : { ...customRead(["dyn", `${nextDynKey()}`]), accu: "add" as const }]))
  nodes = mapFormulas(nodes, f => affineMap.get(f as NumNode) ?? f, f => f)

  function reaffineArt(stat: DynStat): DynStat {
    const values = constantFold([...affineMap.keys()], {
      dyn: objectMap(stat, (value) => constant(value))
    } as any, _ => true)
    return Object.fromEntries([...affineMap.values()].map((v, i) => [v.path[1], (values[i] as ConstantNode<number>).value]))
  }
  const result = {
    nodes, arts: {
      base: reaffineArt(arts.base),
      values: objectKeyMap(allSlotKeys, slot =>
        arts.values[slot].map(({ id, set, values }) => ({ id, set, values: reaffineArt(values) })))
    }
  }
  const offsets = Object.entries(reaffineArt({}))
  for (const arts of Object.values(result.arts.values))
    for (const { values } of arts)
      for (const [key, baseValue] of offsets)
        values[key] -= baseValue
  return result
}
/** Remove artifacts that cannot be in top `numTop` builds */
export function pruneOrder(arts: ArtifactsBySlot, numTop: number, exclusion: ArtSetExclusion): ArtifactsBySlot {
  let progress = false
  const noRainbow = !exclusion.rainbow?.length
  const noSwitchIn = new Set(Object.entries(exclusion).filter(([_, v]) => v.length).map(([k]) => k) as ArtifactSetKey[])
  const noSwitchOut = new Set(Object.entries(exclusion).filter(([_, v]) => v.includes(2) && !v.includes(4)).map(([k]) => k) as ArtifactSetKey[])
  const values = objectKeyMap(allSlotKeys, slot => {
    const list = arts.values[slot]
    const newList = list.filter(art => {
      let count = 0
      return list.every(other => {
        const greaterEqual = Object.entries(other.values).every(([k, o]) => o >= art.values[k])
        const greater = Object.entries(other.values).some(([k, o]) => o > art.values[k])
        if (greaterEqual && (greater || other.id > art.id) &&
          ((noRainbow && !noSwitchIn.has(other.set!) && !noSwitchOut.has(art.set!)) || art.set === other.set))
          count++
        return count < numTop
      })
    })
    if (newList.length !== list.length) progress = true
    return newList
  })
  return progress ? { base: arts.base, values } : arts
}
/** Remove artifacts that cannot reach `minimum` in any build */
function pruneArtRange(nodes: NumNode[], arts: ArtifactsBySlot, minimum: number[]): ArtifactsBySlot {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, { min: x, max: x }]))
  const wrap = { arts }
  while (true) {
    const artRanges = objectKeyMap(allSlotKeys, slot => computeArtRange(wrap.arts.values[slot]))
    const otherArtRanges = objectKeyMap(allSlotKeys, key =>
      addArtRange(Object.entries(artRanges).map(a => a[0] === key ? baseRange : a[1]).filter(x => x)))

    let progress = false
    const values = objectKeyMap(allSlotKeys, slot => {
      const result = wrap.arts.values[slot].filter(art => {
        const read = addArtRange([computeArtRange([art]), otherArtRanges[slot]])
        const newRange = computeNodeRange(nodes, read)
        return nodes.every((node, i) => newRange.get(node)!.max >= (minimum[i] ?? -Infinity))
      })
      if (result.length !== wrap.arts.values[slot].length)
        progress = true
      return result
    })
    if (!progress) break
    wrap.arts = { base: wrap.arts.base, values }
  }
  return wrap.arts
}
function pruneNodeRange(nodes: NumNode[], arts: ArtifactsBySlot): NumNode[] {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, { min: x, max: x }]))
  const reads = addArtRange([baseRange, ...Object.values(arts.values).map(values => computeArtRange(values))])
  const nodeRange = computeNodeRange(nodes, reads)

  return mapFormulas(nodes, f => {
    const { operation } = f
    const operandRanges = f.operands.map(x => nodeRange.get(x)!)
    switch (operation) {
      case "threshold": {
        const [value, threshold, pass, fail] = operandRanges
        if (value.min >= threshold.max) return f.operands[2]
        else if (value.max < threshold.min) return f.operands[3]
        if (pass.max === pass.min &&
          fail.max === fail.min &&
          pass.min === fail.min && isFinite(pass.min))
          return constant(pass.max)
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
  ranges.forEach(range => {
    Object.entries(range).forEach(([key, value]) => {
      if (result[key]) {
        result[key].min += value.min
        result[key].max += value.max
      } else result[key] = { ...value }
    })
  })
  return result
}
function computeArtRange(arts: ArtifactBuildData[]): DynMinMax {
  const result: DynMinMax = {}
  if (arts.length) {
    Object.keys(arts[0].values)
      .filter(key => arts.every(art => art.values[key]))
      .forEach(key => result[key] = { min: arts[0].values[key], max: arts[0].values[key] })
    arts.forEach(({ values }) => {
      for (const [key, value] of Object.entries(values)) {
        if (!result[key]) result[key] = { min: 0, max: value }
        else {
          if (result[key].max < value) result[key].max = value
          if (result[key].min > value) result[key].min = value
        }
      }
    })
  }
  return result
}
function computeNodeRange(nodes: NumNode[], reads: DynMinMax): Map<NumNode, MinMax> {
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
        current = reads[f.path[1]] ?? { min: 0, max: 0 }
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
      case "threshold":
        if (operands[0].min >= operands[1].max) current = operands[2]
        else if (operands[0].max < operands[1].min) current = operands[3]
        else current = computeMinMax([], [operands[2], operands[3]])
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

export function filterArts(arts: ArtifactsBySlot, filters: RequestFilter): ArtifactsBySlot {
  return {
    base: arts.base,
    values: objectKeyMap(allSlotKeys, slot => {
      const filter = filters[slot]
      switch (filter.kind) {
        case "id": return arts.values[slot].filter(art => filter.ids.has(art.id))
        case "exclude": return arts.values[slot].filter(art => !filter.sets.has(art.set!))
        case "required": return arts.values[slot].filter(art => filter.sets.has(art.set!))
      }
    })
  }
}

export function mergeBuilds(builds: Build[][], maxNum: number): Build[] {
  return builds.flatMap(x => x).sort((a, b) => b.value - a.value).slice(0, maxNum)
}
export function mergePlot(plots: PlotData[]): PlotData {
  let scale = 0.01, reductionScaling = 2, maxCount = 1500
  let keys = new Set(plots.flatMap(x => Object.values(x).map(v => Math.round(v.plot! / scale))))
  while (keys.size > maxCount) {
    scale *= reductionScaling
    keys = new Set([...keys].map(key => Math.round(key / reductionScaling)))
  }
  const result: PlotData = {}
  for (const plot of plots)
    for (const build of Object.values(plot)) {
      const x = Math.round(build.plot! / scale) * scale
      if (!result[x] || result[x]!.value < build.value)
        result[x] = build
    }
  return result
}

export function countBuilds(arts: ArtifactsBySlot): number {
  return allSlotKeys.reduce((_count, slot) => _count * arts.values[slot].length, 1)
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
export function exclusionToAllowed(exclusion: number[] | undefined): Set<number> {
  return new Set(exclusion?.includes(2)
    ? exclusion.includes(4) ? [0, 1] : [0, 1, 4, 5]
    : exclusion?.includes(4) ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5])
}
/** A *disjoint* set of `RequestFilter` satisfying the exclusion rules */
export function* artSetPerm(exclusion: ArtSetExclusion, _artSets: ArtifactSetKey[]): Iterable<RequestFilter> {
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

export type RequestFilter = StrictDict<SlotKey,
  { kind: "required", sets: Set<ArtifactSetKey> } |
  { kind: "exclude", sets: Set<ArtifactSetKey> } |
  { kind: "id", ids: Set<string> }
>

export type DynStat = { [key in string]: number }
export type ArtifactBuildData = {
  id: string
  set?: ArtifactSetKey
  values: DynStat
}
export type ArtifactsBySlot = { base: DynStat, values: StrictDict<SlotKey, ArtifactBuildData[]> }

export type PlotData = Dict<number, Build>
export interface Build {
  value: number
  plot?: number
  artifactIds: string[]
}
