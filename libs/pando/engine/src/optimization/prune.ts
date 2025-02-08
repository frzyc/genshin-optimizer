import type { AnyNode, NumNode, OP as TaggedOP } from '../node'
import {
  calculation,
  constant,
  mapBottomUp,
  max,
  min,
  read,
  sum,
  traverse,
} from '../node'
import { assertUnreachable } from '../util'
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>
const { arithmetic, branching } = calculation

type Component = Record<string, number>
type Monotonicity = { inc: boolean; dec: boolean }
type Range = { min: number; max: number }

type CompRanges = Record<string, Range>[]
type NodeRanges = Map<AnyNode<OP>, Range>
type Monotonicities = Map<string, Monotonicity>

export type CustomInfo = {
  range: (r: Range[]) => Range
  monotonicity: (r: Range[]) => Monotonicity[]
}
export const customInfo: Record<string, CustomInfo> = {}

export function prune<I extends OP, C extends Component>(
  nodes: NumNode<I>[],
  builds: C[][],
  cat: string,
  minimum: number[],
  _keepTop: number
): { nodes: NumNode<I>[]; builds: Omit<C, string>[][]; minimum: number[] } {
  const state = new State(nodes, builds, cat)
  while (state.progress) {
    state.progress = false
    pruneBranches(state)
    minimum = pruneRange(state, minimum)
    reaffine(state)
  }
  return { nodes: state.nodes, builds: state.builds, minimum }
}

class State<I extends OP, C extends Component> {
  nodes: NumNode<I>[]
  builds: Omit<C, string>[][]
  cat: string

  progress = true
  _compRanges: CompRanges | undefined
  _nodeRanges: NodeRanges | undefined
  _monotonicities: Monotonicities | undefined

  constructor(nodes: NumNode<I>[], builds: C[][], cat: string) {
    this.nodes = nodes
    this.builds = builds
    this.cat = cat
  }

  setNodes(nodes: NumNode<I>[]) {
    if (this.nodes === nodes) return
    this.progress = true
    this.nodes = nodes
    this._nodeRanges = undefined
    this._monotonicities = undefined
  }

  setBuilds(builds: Omit<C, string>[][], compRanges?: CompRanges) {
    if (this.builds === builds) return
    this.progress = true
    this.builds = builds
    this._compRanges = compRanges
    this._nodeRanges = undefined
    this._monotonicities = undefined
  }

  get compRanges(): CompRanges {
    this._compRanges ??= this.builds.map(computeCompRanges)
    return this._compRanges
  }

  get nodeRanges(): NodeRanges {
    this._nodeRanges ??= computeNodeRanges(
      this.nodes,
      this.cat,
      this.compRanges
    )
    return this._nodeRanges
  }

  get monotonicities(): Monotonicities {
    this._monotonicities ??= _getMonotonicities(
      this.nodes,
      this.cat,
      this.nodeRanges
    )
    return this._monotonicities
  }
}

/** Remove branches that are never chosen */
function pruneBranches(state: State<OP, Component>) {
  const { nodes, nodeRanges: ranges } = state
  const result = mapBottomUp(nodes, (n, o) => {
    {
      const { min, max } = ranges.get(o)!
      if (min === max) return o.op === 'const' ? n : constant(min)
    }
    switch (o.op) {
      case 'thres': {
        const [value, threshold] = o.br.map((n) => ranges.get(n)!)
        if (value.min >= threshold.max) return n.x[0]
        if (value.max < threshold.min) return n.x[1]
        break
      }
      case 'min': {
        const threshold = ranges.get(o)!.max
        const x = n.x.filter((_, i) => ranges.get(o.x[i])!.min <= threshold)
        if (x.length === 1) return x[0]
        if (x.length !== n.x.length) return min(...(x as any)) as NumNode<OP>
        break
      }
      case 'max': {
        const threshold = ranges.get(o)!.min
        const x = n.x.filter((_, i) => ranges.get(o.x[i])!.max >= threshold)
        if (x.length === 1) return x[0]
        if (x.length !== n.x.length) return max(...(x as any)) as NumNode<OP>
        break
      }
      case 'match':
      case 'lookup':
        if (n.br.every((n) => n.op === 'const')) {
          const br = n.br.map((n) => n.ex)
          return n.x[branching[o.op](br, o.ex)]
        }
        break
      case 'subscript':
        if (n.br[0].op === 'const') return n.ex[n.br[0].ex]
        break
    }
    return n
  })
  state.setNodes(result)
}

/**
 * - Remove components that do not meet the `minimum` requirements in any builds
 * - Remove top-level nodes whose `minimum` requirements are met by every build
 * - Returns new `minimum` appropriate for the new `state.nodes`
 */
function pruneRange(state: State<OP, Component>, minimum: number[]): number[] {
  const { nodeRanges, cat } = state
  let builds = [...state.builds]
  let compRanges = [...state.compRanges]

  const nodes: NumNode<OP>[] = []
  const newMinimum: number[] = []
  state.nodes.forEach((n, i) => {
    if (i < minimum.length)
      if (minimum[i] <= nodeRanges.get(n)!.min) return
      else newMinimum.push(minimum[i])
    nodes.push(n)
  })
  if (newMinimum.length != minimum.length) {
    state.setNodes(nodes)
    minimum = newMinimum
  }

  if (!minimum.length) return minimum

  builds.forEach((comp, i) => {
    const new_comp = comp.filter((c) => {
      compRanges[i] = computeCompRanges([c])
      const ranges = computeNodeRanges(nodes, cat, compRanges)
      return nodes.every((n, i) => ranges.get(n)!.max >= minimum[i])
    })
    if (new_comp.length != comp.length) {
      builds[i] = new_comp
      compRanges[i] = computeCompRanges(new_comp)
      state.setBuilds(builds, compRanges)
    }
  })

  return minimum
}

const offset = Symbol()
function reaffine(state: State<OP, Component>) {
  const { nodes, cat, builds } = state
  type Weight = Record<string | typeof offset, number>
  const weights = new Map<AnyNode<OP>, Weight>()
  traverse(nodes, (n, visit) => {
    n.x.forEach(visit)
    n.br.forEach(visit)

    if (n.br.length) return
    const x = n.x.map((n) => weights.get(n)!)
    if (x.some((w) => !w)) return

    let weight: Weight
    switch (n.op) {
      case 'sum': {
        weight = { [offset]: x.reduce((acu, w) => acu + w[offset], 0) }
        for (const w of x)
          for (const [k, v] of Object.entries(w))
            weight[k] = (weight[k] ?? 0) + v
        break
      }
      case 'prod': {
        const idx = n.x.findIndex((n) => n.op !== 'const')
        if (n.x.find((n, i) => n.op !== 'const' && i !== idx)) return // multiple non-const terms
        weight = { ...x[idx] }
        const factor = x.reduce((f, w, i) => (i === idx ? f : f * w[offset]), 1)
        if (factor != 1) {
          Object.keys(weight).forEach((k) => (weight[k] *= factor))
          weight[offset] *= factor
        }
        break
      }
      case 'read':
        weight = { [n.tag[cat]!]: 1, [offset]: 0 }
        break
      case 'const':
        if (typeof n.ex !== 'number') return
        weight = { [offset]: n.ex }
        break
      default:
        return
    }
    weights.set(n, weight)
  })

  const topWeights = new Map<AnyNode<OP>, Weight>()
  traverse(nodes, (n, visit) => {
    const w = weights.get(n)
    if (w) topWeights.set(n, w)
    else {
      n.x.forEach(visit)
      n.br.forEach(visit)
    }
  })

  const weightNames = new Map(
    [...topWeights.values()].map((w, i) => [w, `c${i}`])
  )
  const newBuilds = builds.map((comp) =>
    (comp as Component[]).map((c) => {
      const result: Component = {}
      // Preserve non-string keys
      for (const s of Object.getOwnPropertySymbols(c))
        result[s as any] = (c as any)[s]
      weightNames.forEach((name, w) => {
        result[name] = Object.entries(w).reduce(
          (acu, [k, v]) => acu + (c[k] ?? 0) * v,
          0
        )
      })
      return result
    })
  )

  let shouldChange = false
  for (const comp of newBuilds) {
    for (const [w, name] of weightNames) {
      const freq = new Map<number, number>()
      for (const c of comp) freq.set(c[name], (freq.get(c[name]) ?? 0) + 1)
      let best = 0
      let bestFreq = 0
      for (const [v, f] of freq)
        if (f > bestFreq || (f >= bestFreq && best !== 0))
          [best, bestFreq] = [v, f]
      if (best != 0) {
        for (const c of comp) {
          c[name] -= best
          if (c[name] === 0) delete c[name]
        }
        w[offset] += best
        shouldChange = true
      }
    }
  }

  if (!shouldChange) {
    for (const n of topWeights.keys()) {
      if (n.op === 'const' || n.op === 'read') continue
      if (n.op === 'sum' && n.x.length === 2)
        if (n.x[0].op === 'const' && n.x[1].op === 'read') continue
        else if (n.x[1].op === 'const' && n.x[0].op === 'read') continue
      shouldChange = true
      break
    }
  }

  if (!shouldChange) return

  const weightNodes = new Map<Weight, NumNode<OP>>()
  for (const [w, name] of weightNames) {
    let node: NumNode<OP> = read({ [cat]: name }, undefined)
    if (w[offset] !== 0) node = sum(w[offset], node)
    weightNodes.set(w, node)
  }

  state.setBuilds(newBuilds)
  state.setNodes(
    mapBottomUp(nodes, (n, o) => {
      const w = topWeights.get(o)
      return w ? weightNodes.get(w)! : n
    })
  )
}

/** Get range assuming any item in `comp` can be selected */
function computeCompRanges(comp: Component[]): CompRanges[number] {
  const iter = comp.values()
  const first: Component = iter.next().value
  if (!first) return {}
  const result = Object.fromEntries(
    Object.entries(first).map(([k, v]) => [k, { min: v, max: v }])
  )
  for (const component of iter)
    for (const [k, v] of Object.entries(component)) {
      let r = result[k]
      if (!r) result[k] = r = { min: 0, max: 0 }
      if (r.min > v) r.min = v
      if (r.max < v) r.max = v
    }
  return result
}

/** Get possible ranges of each node */
function computeNodeRanges(
  n: AnyNode<OP>[],
  cat: string,
  compRanges: CompRanges
): NodeRanges {
  const result = new Map<AnyNode<OP>, Range>()
  traverse(n, (n, visit) => {
    n.x.forEach(visit)
    n.br.forEach(visit)
    const ranges = n.x.map((n) => result.get(n)!)
    const mins = ranges.map((r) => r.min)
    const maxs = ranges.map((r) => r.max)

    function cornerRange(
      op: keyof typeof arithmetic,
      [x0, x1]: [Range, Range]
    ): Range {
      const calc = arithmetic[op]
      const vals = [
        calc([x0.min, x1.min], undefined),
        calc([x0.min, x1.max], undefined),
        calc([x0.max, x1.min], undefined),
        calc([x0.max, x1.max], undefined),
      ]
      return { min: Math.min(...vals), max: Math.max(...vals) }
    }

    let r: Range
    switch (n.op) {
      case 'const':
        if (typeof n.ex === 'number') r = { min: n.ex, max: n.ex }
        else r = { min: NaN, max: NaN }
        break
      case 'subscript':
        r = {
          min: Math.min(...(n.ex as number[])),
          max: Math.max(...(n.ex as number[])),
        }
        break
      case 'sum':
        r = {
          min: mins.reduce((a, b) => a + b, 0),
          max: maxs.reduce((a, b) => a + b, 0),
        }
        break
      case 'prod':
        r = { min: 1, max: 1 }
        r = ranges.reduce((r, xr) => cornerRange(n.op, [r, xr]), r)
        break
      case 'min':
      case 'max':
        r = { min: Math[n.op](...mins), max: Math[n.op](...maxs) }
        break
      case 'match':
      case 'thres':
      case 'lookup':
        r = { min: Math.min(...mins), max: Math.max(...maxs) }
        break
      case 'sumfrac':
        if (mins[0] + mins[1] > 0 || maxs[0] + maxs[1] < 0)
          r = cornerRange(n.op, ranges as [Range, Range])
        // Degenerate if `x + c` touches zero
        else r = { min: NaN, max: NaN }
        break
      case 'read': {
        r = { min: 0, max: 0 }
        for (const { [n.tag[cat]!]: range } of compRanges)
          if (range) {
            r.min += range.min
            r.max += range.max
          }
        break
      }
      case 'custom':
        r = customInfo[n.ex]!.range(ranges)
        break
      default:
        assertUnreachable(n)
    }
    result.set(n, r)
  })
  return result
}

function _getMonotonicities(
  n: NumNode<OP>[],
  cat: string,
  ranges: NodeRanges
): Monotonicities {
  const mon = new Map<AnyNode<OP>, Monotonicity>()
  const toVisit: { node: AnyNode<OP>; ty: boolean }[] = []
  const result = new Map<string, Monotonicity>()

  // `ty` if inc or non-monotonic. `!ty` if dec or non-monotonic.
  // When visited with both `ty` values, `node` is non-monotonic.
  function visit(node: AnyNode<OP>, ty: boolean) {
    if (!mon.has(node)) mon.set(node, { inc: true, dec: true })
    const ton = mon.get(node)!
    toVisit.push({ node, ty })
    if (ty && ton.dec) ton.dec = false
    else if (!ty && ton.inc) ton.inc = false
    else toVisit.pop() // no update
  }

  // Cannot use `traverse` because each node is visited twice, once for `inc` and once for `dec`
  n.forEach((n) => visit(n, true))
  while (toVisit.length) {
    const { node, ty } = toVisit.pop()!
    switch (node.op) {
      case 'read':
        result.set(node.tag[cat]!, mon.get(node)!)
        break
      case 'const':
      case 'subscript':
        break
      case 'sum':
      case 'min':
      case 'max':
        node.x.forEach((n) => visit(n, ty))
        break
      case 'match':
      case 'lookup':
        node.x.forEach((n) => visit(n, ty))
        node.br.forEach((n) => visit(n, true))
        node.br.forEach((n) => visit(n, false))
        break
      case 'thres': {
        node.x.forEach((n) => visit(n, ty))
        const ge = ranges.get(node.x[0])!
        const lt = ranges.get(node.x[1])!
        // if `br` is not visited, both branches are equal
        if (ge.max > lt.min) {
          visit(node.br[0], ty)
          visit(node.br[1], !ty)
        }
        if (ge.min < lt.max) {
          visit(node.br[0], !ty)
          visit(node.br[1], ty)
        }
        break
      }
      case 'sumfrac': {
        const [x, c] = node.x.map((n) => ranges.get(n)!)
        // if `x` is not visited, `c == 0` and `node == 1`
        if (c.min < 0) visit(node.x[0], !ty)
        if (c.max > 0) visit(node.x[0], ty)
        // if `c` is not visited, `x == 0` and `node == 0`
        if (x.min < 0) visit(node.x[1], ty)
        if (x.max > 0) visit(node.x[1], !ty)
        break
      }
      case 'prod': {
        const r = ranges.get(node)!
        const pos = r.min > 0
        if (!pos && r.max >= 0) {
          // unsupported zero-touching
          node.x.forEach((n) => visit(n, true))
          node.x.forEach((n) => visit(n, false))
        } else
          node.x.forEach((n) =>
            visit(n, (pos === ty) === ranges.get(n)!.min > 0)
          )
        break
      }
      case 'custom':
        customInfo[node.ex]
          .monotonicity(node.x.map((n) => ranges.get(n)!))
          .forEach((t, i) => {
            if (!t.inc) visit(node.x[i], !ty)
            if (!t.dec) visit(node.x[i], ty)
          })
        break
      default:
        assertUnreachable(node)
    }
  }
  return result
}
