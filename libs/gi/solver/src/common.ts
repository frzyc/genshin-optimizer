import {
  assertUnreachable,
  notEmpty,
  objKeyMap,
  objMap,
  range,
} from '@genshin-optimizer/common/util'
import {
  type ArtifactSetKey,
  type ArtifactSlotKey,
  allArtifactSlotKeys,
} from '@genshin-optimizer/gi/consts'
import type {
  ArtSetExclusion,
  ArtSetExclusionKey,
} from '@genshin-optimizer/gi/db'
import type { ConstantNode, OptNode } from '@genshin-optimizer/gi/wr'
import {
  allOperations,
  constant,
  constantFold,
  dynRead,
  forEachNodes,
  mapFormulas,
  max,
  min,
  sum,
  threshold,
} from '@genshin-optimizer/gi/wr'

type MicropassOperation =
  | 'reaffine'
  | 'pruneArtRange'
  | 'pruneNodeRange'
  | 'pruneOrder'
export function pruneAll(
  nodes: OptNode[],
  minimum: number[],
  arts: ArtifactsBySlot,
  numTop: number,
  exclusion: ArtSetExclusion,
  forced: Partial<Record<MicropassOperation, boolean>>
): { nodes: OptNode[]; arts: ArtifactsBySlot } {
  let should = forced
  /** If `key` makes progress, all operations in `value` should be performed */
  const deps: Record<
    MicropassOperation,
    Partial<Record<MicropassOperation, true>>
  > = {
    pruneOrder: { pruneNodeRange: true },
    pruneArtRange: { pruneNodeRange: true },
    pruneNodeRange: { reaffine: true },
    reaffine: { pruneOrder: true, pruneArtRange: true, pruneNodeRange: true },
  }
  let count = 0
  while (Object.values(should).some((x) => x) && count++ < 20) {
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

export function pruneExclusion(
  nodes: OptNode[],
  exclusion: ArtSetExclusion
): OptNode[] {
  const maxValues: Partial<Record<keyof typeof exclusion, number>> = {}
  for (const [key, e] of Object.entries(exclusion)) {
    if (!e.includes(4)) continue
    maxValues[key] = e.includes(2) ? 1 : 3
  }
  return mapFormulas(
    nodes,
    (f) => f,
    (f) => {
      if (f.operation !== 'threshold') return f

      const [v, t, pass, fail] = f.operands
      if (v.operation === 'read' && t.operation === 'const') {
        const key = v.path[v.path.length - 1],
          thres = t.value
        if (key in maxValues) {
          const max: number = maxValues[key as keyof typeof maxValues] ?? 0
          if (max < thres) return fail
          if (
            thres === 2 &&
            (exclusion[key as keyof typeof exclusion] ?? []).includes(2)
          )
            return threshold(v, 4, pass, fail)
        }
      }
      return f
    }
  )
}

function reaffine(
  nodes: OptNode[],
  arts: ArtifactsBySlot,
  forceRename = false
): { nodes: OptNode[]; arts: ArtifactsBySlot } {
  const affineNodes = new Set<OptNode>(),
    topLevelAffine = new Set<OptNode>()

  function visit(node: OptNode, isAffine: boolean): OptNode {
    if (isAffine) affineNodes.add(node)
    else
      node.operands.forEach(
        (op) => affineNodes.has(op) && topLevelAffine.add(op)
      )
    return node
  }

  const dynKeys = new Set<string>()

  nodes = mapFormulas(
    nodes,
    (_) => _,
    (f) => {
      const { operation } = f
      switch (operation) {
        case 'read':
          dynKeys.add(f.path[1])
          return visit(f, true)
        case 'add': {
          const affineOps = f.operands.filter((op) => affineNodes.has(op))
          const nonAffineOps = f.operands.filter((op) => !affineNodes.has(op))
          if (nonAffineOps.length === 0) return visit(f, true)
          if (affineOps.length <= 1) return visit(f, false)
          const affine = visit(sum(...affineOps), true)
          return visit(sum(affine, ...nonAffineOps), false)
        }
        case 'mul': {
          const nonConst = f.operands.filter((op) => op.operation !== 'const')
          return visit(
            f,
            nonConst.length === 0 ||
              (nonConst.length === 1 && affineNodes.has(nonConst[0]))
          )
        }
        case 'const':
          return visit(f, true)
        case 'res':
        case 'threshold':
        case 'sum_frac':
        case 'max':
        case 'min':
          return visit(f, false)
        default:
          assertUnreachable(operation)
      }
    }
  )

  nodes
    .filter((node) => affineNodes.has(node))
    .forEach((node) => topLevelAffine.add(node))
  if (
    [...topLevelAffine].every(
      ({ operation }) => operation === 'read' || operation === 'const'
    ) &&
    Object.keys(arts.base).length === dynKeys.size
  )
    return { nodes, arts }

  let current = -1
  function nextDynKey(): string {
    while (dynKeys.has(`${++current}`));
    return `${current}`
  }

  const affine = [...topLevelAffine].filter((f) => f.operation !== 'const')
  const affineMap = new Map(
    affine.map((node) => [
      node as OptNode,
      !forceRename && node.operation === 'read' && node.path[0] === 'dyn'
        ? node
        : dynRead(nextDynKey()),
    ])
  )
  nodes = mapFormulas(
    nodes,
    (f) => affineMap.get(f) ?? f,
    (f) => f
  )

  function reaffineArt(stat: DynStat): DynStat {
    const values = constantFold(
      [...affineMap.keys()],
      {
        dyn: objMap(stat, (value) => constant(value)),
      } as any,
      (_) => true
    )
    return Object.fromEntries(
      [...affineMap.values()].map((v, i) => [
        v.path[1],
        (values[i] as ConstantNode<number>).value,
      ])
    )
  }
  const result = {
    nodes,
    arts: {
      base: reaffineArt(arts.base),
      values: objKeyMap(allArtifactSlotKeys, (slot) =>
        arts.values[slot].map(({ id, set, values }) => ({
          id,
          set,
          values: reaffineArt(values),
        }))
      ),
    },
  }
  const offsets = Object.entries(reaffineArt({}))
  for (const arts of Object.values(result.arts.values))
    for (const { values } of arts)
      for (const [key, baseValue] of offsets) values[key] -= baseValue
  return result
}
/** Remove artifacts that cannot be in top `numTop` builds */
function pruneOrder(
  arts: ArtifactsBySlot,
  numTop: number,
  exclusion: ArtSetExclusion
): ArtifactsBySlot {
  let progress = false
  /**
   * Note:
   * This function assumes that every base (reaffined) stats are monotonically increasing. That is, artifacts
   * with higher stats are better. This remains true as long as the main and substats are in increasing. Set
   * effects that decrease enemy resistance (which is monotonically decreasing) does not violate this assumption
   * as set effects are not handled here.
   */
  const allowRainbow = !exclusion.rainbow?.length,
    keys = Object.keys(arts.base)
  const noSwitchIn = new Set(
    Object.entries(exclusion)
      .filter(([_, v]) => v.length)
      .map(([k]) => k) as ArtifactSetKey[]
  )
  const noSwitchOut = new Set(
    Object.entries(exclusion)
      .filter(([_, v]) => v.includes(2) && !v.includes(4))
      .map(([k]) => k) as ArtifactSetKey[]
  )
  const values = objKeyMap(allArtifactSlotKeys, (slot) => {
    const list = arts.values[slot]
    const newList = list.filter((art) => {
      let count = 0
      return list.every((other) => {
        const otherBetterEqual = keys.every(
          (k) => (other.values[k] ?? 0) >= (art.values[k] ?? 0)
        )
        const otherMaybeBetter = keys.some(
          (k) => (other.values[k] ?? 0) > (art.values[k] ?? 0)
        )
        const otherBetter =
          otherBetterEqual && (otherMaybeBetter || other.id > art.id)
        const canSwitch =
          (allowRainbow &&
            !noSwitchIn.has(other.set!) &&
            !noSwitchOut.has(art.set!)) ||
          art.set === other.set
        if (otherBetter && canSwitch) count++
        return count < numTop
      })
    })
    if (newList.length !== list.length) progress = true
    return newList
  })
  return progress ? { base: arts.base, values } : arts
}
/** Remove artifacts that cannot reach `minimum` in any build */
function pruneArtRange(
  nodes: OptNode[],
  arts: ArtifactsBySlot,
  minimum: number[]
): ArtifactsBySlot {
  const baseRange = Object.fromEntries(
    Object.entries(arts.base).map(([key, x]) => [key, { min: x, max: x }])
  )
  const wrap = { arts }
  while (true) {
    const artRanges = objKeyMap(allArtifactSlotKeys, (slot) =>
      computeArtRange(wrap.arts.values[slot])
    )
    const otherArtRanges = objKeyMap(allArtifactSlotKeys, (key) =>
      addArtRange(
        Object.entries(artRanges)
          .map((a) => (a[0] === key ? baseRange : a[1]))
          .filter((x) => x)
      )
    )

    let progress = false
    const values = objKeyMap(allArtifactSlotKeys, (slot) => {
      const result = wrap.arts.values[slot].filter((art) => {
        const read = addArtRange([computeArtRange([art]), otherArtRanges[slot]])
        const newRange = computeNodeRange(nodes, read)
        return nodes.every(
          (node, i) => newRange.get(node)!.max >= (minimum[i] ?? -Infinity)
        )
      })
      if (result.length !== wrap.arts.values[slot].length) progress = true
      return result
    })
    if (!progress) break
    wrap.arts = { base: wrap.arts.base, values }
  }
  return wrap.arts
}
function pruneNodeRange(nodes: OptNode[], arts: ArtifactsBySlot): OptNode[] {
  const baseRange = Object.fromEntries(
    Object.entries(arts.base).map(([key, x]) => [key, { min: x, max: x }])
  )
  const reads = addArtRange([
    baseRange,
    ...Object.values(arts.values).map((values) => computeArtRange(values)),
  ])
  const nodeRange = computeNodeRange(nodes, reads)

  return mapFormulas(
    nodes,
    (f) => {
      {
        const { min, max } = nodeRange.get(f)!
        if (min === max) return constant(min)
      }
      const { operation } = f
      const operandRanges = f.operands.map((x) => nodeRange.get(x)!)
      switch (operation) {
        case 'threshold': {
          const [value, threshold, pass, fail] = operandRanges
          if (value.min >= threshold.max) return f.operands[2]
          else if (value.max < threshold.min) return f.operands[3]
          if (
            pass.max === pass.min &&
            fail.max === fail.min &&
            pass.min === fail.min &&
            isFinite(pass.min)
          )
            return constant(pass.max)
          break
        }
        case 'min': {
          const newOperands = f.operands.filter((_, i) => {
            const op1 = operandRanges[i]
            return operandRanges.every((op2) => op1.min <= op2.max)
          })
          if (newOperands.length < operandRanges.length)
            return min(...newOperands)
          break
        }
        case 'max': {
          const newOperands = f.operands.filter((_, i) => {
            const op1 = operandRanges[i]
            return operandRanges.every((op2) => op1.max >= op2.min)
          })
          if (newOperands.length < operandRanges.length)
            return max(...newOperands)
          break
        }
      }
      return f
    },
    (f) => f
  )
}
function addArtRange(ranges: DynMinMax[]): DynMinMax {
  const result: DynMinMax = {}
  ranges.forEach((range) => {
    Object.entries(range).forEach(([key, value]) => {
      if (result[key]) {
        result[key].min += value.min
        result[key].max += value.max
      } else result[key] = { ...value }
    })
  })
  return result
}
/**
 * Append two inert corner "artifacts" per extended slot so that any consumer
 * that only derives per-slot stat *ranges* from the artifact lists (e.g.
 * `linearUB`) covers the extended box. The corners must never be treated as
 * real build candidates — do not feed the result to anything that filters,
 * enumerates, or swap-tests artifacts.
 */
export function extendArtRangeArts(
  arts: ArtifactsBySlot,
  extraRange: Partial<Record<ArtifactSlotKey, DynMinMax>>
): ArtifactsBySlot {
  const values = { ...arts.values }
  for (const [slot, box] of Object.entries(extraRange) as [
    ArtifactSlotKey,
    DynMinMax,
  ][]) {
    if (!box) continue
    const lo: DynStat = {}
    const hi: DynStat = {}
    for (const [k, { min, max }] of Object.entries(box)) {
      lo[k] = min
      hi[k] = max
    }
    values[slot] = [
      ...values[slot],
      { id: `!future-lo-${slot}`, values: lo },
      { id: `!future-hi-${slot}`, values: hi },
    ]
  }
  return { base: arts.base, values }
}

/** Per-key union of a slot's stat range with an extra box; keys absent from
 * either side count as 0 (an artifact without the stat). */
export function unionArtRange(range: DynMinMax, extra?: DynMinMax): DynMinMax {
  if (!extra) return range
  const result = { ...range }
  for (const [key, { min, max }] of Object.entries(extra)) {
    const cur = result[key] ?? { min: 0, max: 0 }
    result[key] = { min: Math.min(cur.min, min), max: Math.max(cur.max, max) }
  }
  return result
}
export function computeArtRange(arts: ArtifactBuildData[]): DynMinMax {
  const result: DynMinMax = {}
  if (arts.length) {
    Object.keys(arts[0].values)
      .filter((key) => arts.every((art) => art.values[key]))
      .forEach(
        (key) =>
          (result[key] = { min: arts[0].values[key], max: arts[0].values[key] })
      )
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
export function computeFullArtRange(
  arts: ArtifactsBySlot,
  extraRange?: Partial<Record<ArtifactSlotKey, DynMinMax>>
): DynMinMax {
  const baseRange = Object.fromEntries(
    Object.entries(arts.base).map(([key, x]) => [key, { min: x, max: x }])
  )
  return addArtRange([
    baseRange,
    ...allArtifactSlotKeys.map((slot) =>
      unionArtRange(computeArtRange(arts.values[slot]), extraRange?.[slot])
    ),
  ])
}
export function computeNodeRange(
  nodes: OptNode[],
  reads: DynMinMax
): Map<OptNode, MinMax> {
  const range = new Map<OptNode, MinMax>()

  forEachNodes(
    nodes,
    (_) => {},
    (f) => {
      const { operation } = f
      const operands = f.operands.map((op) => range.get(op)!)
      let current: MinMax
      switch (operation) {
        case 'read':
          if (f.path[0] !== 'dyn')
            throw new Error(
              `Found non-dyn path ${f.path} while computing range`
            )
          current = reads[f.path[1]] ?? { min: 0, max: 0 }
          break
        case 'const':
          current = computeMinMax([f.value])
          break
        case 'add':
        case 'min':
        case 'max':
          current = {
            min: allOperations[operation](operands.map((x) => x.min)),
            max: allOperations[operation](operands.map((x) => x.max)),
          }
          break
        case 'res':
          current = {
            min: allOperations[operation]([operands[0].max]),
            max: allOperations[operation]([operands[0].min]),
          }
          break
        case 'mul':
          current = operands.reduce((accu, current) =>
            computeMinMax([
              accu.min * current.min,
              accu.min * current.max,
              accu.max * current.min,
              accu.max * current.max,
            ])
          )
          break
        case 'threshold':
          if (operands[0].min >= operands[1].max) current = operands[2]
          else if (operands[0].max < operands[1].min) current = operands[3]
          else current = computeMinMax([], [operands[2], operands[3]])
          break
        case 'sum_frac': {
          const [x, c] = operands,
            sum = { min: x.min + c.min, max: x.max + c.max }
          if (sum.min <= 0 && sum.max >= 0)
            current =
              x.min <= 0 && x.max >= 0
                ? { min: NaN, max: NaN }
                : { min: -Infinity, max: Infinity }
          // TODO: Check this
          else
            current = computeMinMax([
              x.min / sum.min,
              x.min / sum.max,
              x.max / sum.min,
              x.max / sum.max,
            ])
          break
        }
        default:
          assertUnreachable(operation)
      }
      range.set(f, current)
    }
  )
  return range
}
function computeMinMax(
  values: readonly number[],
  minMaxes: readonly MinMax[] = []
): MinMax {
  const max = Math.max(...values, ...minMaxes.map((x) => x.max))
  const min = Math.min(...values, ...minMaxes.map((x) => x.min))
  return { min, max }
}

export function filterArts(
  arts: ArtifactsBySlot,
  filters: RequestFilter
): ArtifactsBySlot {
  return {
    base: arts.base,
    values: objKeyMap(allArtifactSlotKeys, (slot) => {
      const filter = filters[slot]
      switch (filter.kind) {
        case 'id':
          return arts.values[slot].filter((art) => filter.ids.has(art.id))
        case 'exclude':
          return arts.values[slot].filter((art) => !filter.sets.has(art.set!))
        case 'required':
          return arts.values[slot].filter((art) => filter.sets.has(art.set!))
      }
    }),
  }
}

export function mergeBuilds(
  builds: SolverBuild[][],
  maxNum: number
): SolverBuild[] {
  return builds
    .flatMap((x) => x)
    .sort((a, b) => b.value - a.value)
    .slice(0, maxNum)
}
export function mergePlot(plots: PlotData[]): PlotData {
  let scale = 0.01
  const reductionScaling = 2,
    maxCount = 1500
  let keys = new Set(
    plots.flatMap((x) =>
      Object.values(x).map((v) => v && Math.round(v.plot! / scale))
    )
  )
  while (keys.size > maxCount) {
    scale *= reductionScaling
    keys = new Set(
      [...keys]
        .filter(notEmpty)
        .map((key) => Math.round(key / reductionScaling))
    )
  }
  const result: PlotData = {}
  for (const plot of plots)
    for (const build of Object.values(plot)) {
      if (!build) continue
      const x = Math.round(build.plot! / scale) * scale
      if (!result[x] || result[x]!.value < build.value) result[x] = build
    }
  return result
}

export function countBuilds(arts: ArtifactsBySlot): number {
  return allArtifactSlotKeys.reduce(
    (_count, slot) => _count * arts.values[slot].length,
    1
  )
}

export function* filterFeasiblePerm(
  filters: Iterable<RequestFilter>,
  _artSets: ArtifactsBySlot
): Iterable<RequestFilter> {
  const artSets = objMap(
    _artSets.values,
    (values) => new Set(values.map((v) => v.set))
  )
  filter_loop: for (const filter of filters) {
    for (const [slot, f] of Object.entries(filter)) {
      const available = artSets[slot]!
      switch (f.kind) {
        case 'required':
          if ([...f.sets].every((s) => !available.has(s))) continue filter_loop
          break
        case 'exclude':
          if ([...available].every((s) => f.sets.has(s!))) continue filter_loop
          break
        case 'id':
          break
      }
    }
    yield filter
  }
}
export function exclusionToAllowed(
  exclusion: number[] | undefined
): Set<number> {
  return new Set(
    exclusion?.includes(2)
      ? exclusion.includes(4)
        ? [0, 1]
        : [0, 1, 4, 5]
      : exclusion?.includes(4)
        ? [0, 1, 2, 3]
        : [0, 1, 2, 3, 4, 5]
  )
}
/** A *disjoint* set of `RequestFilter` satisfying the exclusion rules */
export function* artSetPerm(
  exclusion: ArtSetExclusion,
  artSets: Set<ArtifactSetKey>
): Iterable<RequestFilter> {
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
  const allowedRainbows = exclusionToAllowed(exclusion.rainbow)
  let shapes: number[][] = []
  function populateShapes(
    current: number[],
    list: Set<number>,
    rainbows: number[]
  ) {
    if (current.length === 5) {
      if (allowedRainbows.has(rainbows.length)) shapes.push(current)
      return
    }
    for (const i of list)
      populateShapes(
        [...current, i],
        list,
        rainbows.filter((j) => j !== i)
      )
    populateShapes(
      [...current, current.length],
      new Set([...list, current.length]),
      [...rainbows, current.length]
    )
  }
  populateShapes([0], new Set([0]), [0])
  function indexOfShape(shape: number[], replacing: number) {
    if (range(replacing + 1, 4).some((i) => shape[i] !== 5)) return undefined
    shape = [...shape]
    shape[replacing] = 5
    return shape.reduce((a, b) => a * 6 + b, 0)
  }
  for (let replacing = 4; replacing >= 0; replacing--) {
    const required: Map<number, number> = new Map()
    for (const shape of shapes) {
      const id = indexOfShape(shape, replacing)
      if (id === undefined) continue
      required.set(
        id,
        (required.get(id) ?? new Set(shape.slice(0, replacing)).size + 1) - 1
      )
    }
    for (const [id, remaining] of required.entries()) {
      if (remaining === 0) {
        const shape = [
          ...shapes.find((shape) => indexOfShape(shape, replacing) === id)!,
        ]
        shape[replacing] = 5
        shapes = shapes.filter((shape) => indexOfShape(shape, replacing) !== id)
        shapes.push(shape)
      }
    }
  }

  // Shapes are now calculated and merged, proceed to fill in the sets

  const noFilter = { kind: 'exclude' as const, sets: new Set<ArtifactSetKey>() }
  const result: RequestFilter = objKeyMap(allArtifactSlotKeys, (_) => noFilter)

  const counts = {
    ...objMap(exclusion as Record<ArtSetExclusionKey, (2 | 4)[]>, (_) => 0),
    ...objKeyMap([...artSets], () => 0),
  }
  const allowedCounts = objMap(
    exclusion as Record<ArtSetExclusionKey, (2 | 4)[]>,
    exclusionToAllowed
  )

  function* check(shape: number[]) {
    const used: Set<ArtifactSetKey> = new Set(),
      rainbows: number[] = []
    let groupped: number[][] = []
    for (const i of shape) {
      groupped.push([])
      if (i === 5) rainbows.push(groupped.length - 1)
      else groupped[i].push(groupped.length - 1)
    }
    groupped = groupped
      .filter((v) => v.length)
      .sort((a, b) => b.length - a.length)
    let usableRainbows = rainbows.length

    // Inception.. because js doesn't like functions inside a for-loop
    function* check(i: number): IterableIterator<RequestFilter> {
      if (i === groupped.length) return yield* check_free(0)

      for (const set of artSets) {
        if (used.has(set)) continue
        const length = groupped[i].length,
          allowedSet = allowedCounts[set as ArtSetExclusionKey]
        let requiredRainbows = 0

        if (allowedSet && !allowedSet.has(length)) {
          // Look ahead and see if we have enough rainbows to fill to the next `allowedSet` if we use the current set
          requiredRainbows =
            (range(length + 1, 5).find((l) => allowedSet.has(l)) ?? 6) - length
          if (requiredRainbows > usableRainbows) continue // Not enough rainbows. Next..
        }

        used.add(set)
        counts[set] = groupped[i].length
        groupped[i].forEach(
          (j) =>
            (result[allArtifactSlotKeys[j]] = {
              kind: 'required',
              sets: new Set([set]),
            })
        )
        usableRainbows -= requiredRainbows

        yield* check(i + 1)

        usableRainbows += requiredRainbows
        counts[set] = 0
        used.delete(set)
      }
    }
    // We separate filling rainbow slots from groupped slots because it has an entirely
    // different set of rules regarding what can be filled and what states to be kept.
    function* check_free(i: number): IterableIterator<RequestFilter> {
      const remaining = rainbows.length - i,
        isolated: ArtifactSetKey[] = [],
        missing: ArtifactSetKey[] = [],
        rejected: ArtifactSetKey[] = []
      let required = 0
      for (const set of artSets) {
        const allowedSet = allowedCounts[set as ArtSetExclusionKey],
          count = counts[set]
        if (!allowedSet) continue
        if (range(1, remaining).every((j) => !allowedSet.has(count + j)))
          rejected.push(set)
        else if (!allowedSet.has(count)) {
          required += [...allowedSet].find((x) => x > count)! - count
          missing.push(set)
        } else if (range(0, remaining).some((j) => !allowedSet.has(count + j)))
          isolated.push(set)
      }
      if (required > remaining) return
      if (i === rainbows.length) {
        yield { ...result }
        return
      }
      if (required === remaining) {
        for (const set of missing) {
          counts[set]++
          result[allArtifactSlotKeys[rainbows[i]]] = {
            kind: 'required',
            sets: new Set([set]),
          }
          yield* check_free(i + 1)
          counts[set]--
        }
        return
      }
      for (const set of [...isolated, ...missing]) {
        counts[set]++
        result[allArtifactSlotKeys[rainbows[i]]] = {
          kind: 'required',
          sets: new Set([set]),
        }
        yield* check_free(i + 1)
        counts[set]--
      }
      result[allArtifactSlotKeys[rainbows[i]]] = {
        kind: 'exclude',
        sets: new Set([...missing, ...rejected, ...isolated]),
      }
      yield* check_free(i + 1)
    }
    yield* check(0)
  }
  for (const shape of shapes) yield* check(shape)
}

export type RequestFilter = Record<
  ArtifactSlotKey,
  | { kind: 'required'; sets: Set<ArtifactSetKey> }
  | { kind: 'exclude'; sets: Set<ArtifactSetKey> }
  | { kind: 'id'; ids: Set<string> }
>

export type DynStat = { [key in string]: number }
export type ArtifactBuildData = {
  id: string
  set?: ArtifactSetKey
  values: DynStat
}
export type ArtifactsBySlot = {
  base: DynStat
  values: Record<ArtifactSlotKey, ArtifactBuildData[]>
}

export type PlotData = Partial<Record<number, SolverBuild>>
export interface SolverBuild {
  value: number
  plot?: number
  artifactIds: string[]
}

/**
 * A family of hypothetical future artifacts for one slot: every artifact in
 * the family carries `fixed` (its main stat at the assumed level, its
 * set-count key, …) plus up to `maxSubstats` substats drawn from the
 * `substats` pool, optionally limited by a total roll budget.
 */
export type FutureArtifactProfile = {
  fixed: DynStat
  /** Substat pool: value range per key (e.g. `{min: 0, max: 6 * roll}`). */
  substats: DynMinMax
  /** Max substat keys present simultaneously (default 4). */
  maxSubstats?: number
  /** Cap on total rolls: `Σ_k value_k / rollSize_k <= totalRolls`. */
  rollBudget?: { rollSize: DynStat; totalRolls: number }
}
/** Slot -> future-artifact profiles to track partial builds for. */
export type PartialBuildsRequest = Partial<
  Record<ArtifactSlotKey, FutureArtifactProfile[]>
>
/**
 * Original-stat-space snapshot for partial-build tracking. `preprocess`
 * reaffines the solve's stat space, but future-artifact profiles and their
 * witnesses only make sense in real stat keys, so the tracker and the
 * tighten pass run on this snapshot instead, joined to the solve by
 * artifact ids (which survive reaffine and pruning).
 */
export type PartialBuildsSetup = {
  profiles: PartialBuildsRequest
  /** `[optTarget, ...constraints]`, original stat space */
  nodes: OptNode[]
  /** aligned with `nodes`; `mins[0]` (the opt target's) is `-Infinity` */
  mins: number[]
  /** the artifact pool before any pruning */
  arts: ArtifactsBySlot
}

/** Proof of relevance for a partial build: an explicit artifact from one of
 * the requested profiles at which the partial is the best choice. */
export interface PartialBuildWitness {
  /** the artifact's stats (fixed profile stats + chosen substats) */
  artifact: DynStat
  /** exact opt-target value of the witness + this partial build */
  value: number
  /** `value` minus the better of the solve's best-build value and the best
   * alternative partial's value at the witness. `> 0` certifies this partial
   * is strictly necessary: dropping the witness artifact improves the
   * re-solve answer, and only this partial delivers it. `<= 0` marks a
   * member kept only because the search budget could not certify it
   * covered. */
  margin: number
}
export interface SolverPartialBuild {
  /** One artifact per slot other than the left-out slot. */
  artifactIds: string[]
  /** Bounds of the opt target over the future-artifact bounding box. */
  minValue: number
  maxValue: number
  /** Absent only when the search budget ran out without ever finding a
   * feasible sample point (possible under constraints). */
  witness?: PartialBuildWitness
}
/**
 * Slot -> tight partial builds for that slot, or `undefined` if the
 * candidate frontier overflowed (too many mutually incomparable partials).
 *
 * Guards a top-1 re-solve: when an artifact `x` from the requested profiles
 * drops in the slot, the new best build is
 * `max(the solve's best build, max over this list of optTarget(x + p))` —
 * up to candidates lost to solve-time pruning (a known gap until the
 * pruning is made future-aware).
 */
export type PartialBuildsData = Partial<
  Record<ArtifactSlotKey, SolverPartialBuild[] | undefined>
>

/** Per-worker candidate partial builds, as id combos (one id per slot other
 * than the left-out slot); `undefined` = that slot's frontier overflowed. */
export type PartialBuildCandidates = Partial<
  Record<ArtifactSlotKey, string[][] | undefined>
>

/** Bounding box of every artifact expressible by `profiles`: per-key union
 * over profiles of `fixed` plus the (optional) substat range. */
export function profileBoundingBox(
  profiles: FutureArtifactProfile[]
): DynMinMax {
  const keys = new Set<string>()
  for (const p of profiles) {
    for (const k of Object.keys(p.fixed)) keys.add(k)
    for (const k of Object.keys(p.substats)) keys.add(k)
  }
  const box: DynMinMax = {}
  for (const k of keys) {
    let lo = Infinity
    let hi = -Infinity
    for (const p of profiles) {
      const f = p.fixed[k] ?? 0
      const s = p.substats[k]
      const pLo = f + (s ? Math.min(0, s.min) : 0)
      const pHi = f + (s ? Math.max(0, s.max) : 0)
      if (pLo < lo) lo = pLo
      if (pHi > hi) hi = pHi
    }
    box[k] = { min: lo, max: hi }
  }
  return box
}

/** Union of per-worker candidate frontiers; each worker's frontier covers the
 * builds that worker enumerated, so the deduped union covers them all. A slot
 * that overflowed in any worker is incomplete everywhere (`undefined`). */
export function mergePartialCandidates(
  data: PartialBuildCandidates[]
): PartialBuildCandidates {
  const result: PartialBuildCandidates = {}
  const seen = new Map<ArtifactSlotKey, Set<string>>()
  for (const datum of data) {
    for (const [slot, combos] of Object.entries(datum) as [
      ArtifactSlotKey,
      string[][] | undefined,
    ][]) {
      if (!combos) continue
      const keys = seen.get(slot) ?? seen.set(slot, new Set()).get(slot)!
      const list = (result[slot] ??= [])
      for (const ids of combos) {
        const key = ids.join('|')
        if (keys.has(key)) continue
        keys.add(key)
        list.push(ids)
      }
    }
  }
  // a slot that overflowed anywhere is incomplete everywhere
  for (const datum of data)
    for (const slot of Object.keys(datum) as ArtifactSlotKey[])
      if (datum[slot] === undefined) result[slot] = undefined
  return result
}

export type DynMinMax = { [key in string]: MinMax }
export type MinMax = { min: number; max: number }
