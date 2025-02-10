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
import type { Monotonicity, Range } from '../util'
import { assertUnreachable, customOps } from '../util'
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>
const { arithmetic, branching } = calculation

type Component = Record<string, number>

type CompRanges = Record<string, Range>[]
type NodeRanges = Map<AnyNode<OP>, Range>
type Monotonicities = Map<string, Monotonicity>

/**
 * Reduce the complexity of the optimization problem,
 * returning a new optimization with the same `topN` builds
 * @param nodes
 *    A set of nodes used for minimum constraints, objective function, and other calculations.
 *    The nodes must be in the order [min constraints, other calc, obj functions].
 * @param builds
 *    A set of components used to construct the builds. Any string keys may be removed in the
 *    resulting `builds`, but all `Symbol` keys are transferred to the new build components.
 * @param cat Tag category used by `compile` in the actual computation
 * @param minimum Minimum constraint values for min constraints nodes.
 * @param _topN The number of top builds to keep.
 * @returns
 *    A new values for `nodes`, `builds`, and `minimum`. The returned values are incompatible
 *    with the passed-in arguments (DO NOT mix them). Build components may change, so all
 *    related computation needs to pass in to `nodes` as well, else they'll become unusable.
 */
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

export class State<I extends OP, C extends Component> {
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
    return (this._compRanges ??= this.builds.map(computeCompRanges))
  }
  get nodeRanges(): NodeRanges {
    return (this._nodeRanges ??= computeNodeRanges(
      this.nodes,
      this.cat,
      this.compRanges
    ))
  }
  get monotonicities(): Monotonicities {
    return (this._monotonicities ??= getMonotonicities(
      this.nodes[this.nodes.length - 1],
      this.cat,
      this.nodeRanges
    ))
  }
}

/** Remove branches that are never chosen */
export function pruneBranches(state: State<OP, Component>) {
  const { nodes, nodeRanges } = state
  const result = mapBottomUp(nodes, (n, o) => {
    const r = nodeRanges.get(o)!
    if (r.min === r.max) return o.op === 'const' ? n : constant(r.min)
    switch (o.op) {
      case 'thres': {
        const [value, threshold] = o.br.map((n) => nodeRanges.get(n)!)
        if (value.min >= threshold.max) return n.x[0]
        if (value.max < threshold.min) return n.x[1]
        break
      }
      case 'min': {
        const x = n.x.filter((_, i) => nodeRanges.get(o.x[i])!.min <= r.max)
        if (x.length === 1) return x[0]
        if (x.length !== n.x.length) return min(...(x as any)) as NumNode<OP>
        break
      }
      case 'max': {
        const x = n.x.filter((_, i) => nodeRanges.get(o.x[i])!.max >= r.min)
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
        if (n.br[0].op === 'const') return constant(n.ex[n.br[0].ex])
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
export function pruneRange(
  state: State<OP, Component>,
  minimum: number[]
): number[] {
  const { nodeRanges, cat } = state
  const builds = [...state.builds]
  const compRanges = [...state.compRanges]

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

  let progress = false
  builds.forEach((comp, i) => {
    const newComp = comp.filter((c) => {
      compRanges[i] = computeCompRanges([c])
      const ranges = computeNodeRanges(nodes, cat, compRanges)
      return minimum.every((m, i) => ranges.get(nodes[i])!.max >= m)
    })
    if (newComp.length != comp.length) {
      builds[i] = newComp
      compRanges[i] = computeCompRanges(newComp)
      progress = true
    }
  })
  if (progress) state.setBuilds(builds, compRanges)
  return minimum
}

const offset = Symbol()
/**
 * Replace `read`/`sum`/`prod` combination with appropriate, smaller `read` nodes when appropriate
 * If changes are made, components `builds` will be replaced with new values with all string keys
 * replaced. Owned `Symbol` keys are transferred from the old `builds` components to the new ones.
 */
export function reaffine(state: State<OP, Component>) {
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
    // Make sure `n` contains a variable, i.e., `w` has some string keys
    if (w && Object.keys(w).length) topWeights.set(n, w)
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
      let [best, bestFreq] = [0, 0]
      for (const [v, f] of freq)
        if (f > bestFreq || (v === 0 && f >= bestFreq))
          [best, bestFreq] = [v, f]
      if (best !== 0) {
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
  const first = iter.next().value
  if (!first) return {}
  const result = Object.fromEntries(
    Object.entries(first).map(([k, v]) => [k, { min: v, max: v }])
  )
  for (const component of iter) {
    for (const [k, r] of Object.entries(result)) {
      const v = component[k] ?? 0
      if (r.min > v) r.min = v
      if (r.max < v) r.max = v
    }
    for (const [k, v] of Object.entries(component))
      if (!(k in result))
        result[k] = { min: Math.min(0, v), max: Math.max(0, v) }
  }
  return result
}

/** Get possible ranges of each node */
function computeNodeRanges(
  nodes: NumNode<OP>[],
  cat: string,
  compRanges: CompRanges
): NodeRanges {
  const result = new Map<AnyNode<OP>, Range>()
  traverse(nodes, (n, visit) => {
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
      case 'subscript': {
        if (typeof n.ex[0] !== 'number') r = { min: NaN, max: NaN }
        else {
          // Note: this assumes there is no NaN in the array
          r = { min: Infinity, max: -Infinity }
          let { min: start, max: last } = result.get(n.br[0])!
          start = Math.max(0, Math.ceil(start))
          last = Math.min(last, n.ex.length - 1)
          for (let i = start; i <= last; i++) {
            const v = n.ex[i] as number
            if (r.min > v) r.min = v
            if (r.max < v) r.max = v
          }
          if (r.min > r.max) r = { min: NaN, max: NaN }
        }
        break
      }
      case 'lookup':
        // Note: this assumes that `default` branch is never reached if not presented
        if (isNaN(mins[0]) && isNaN(maxs[0])) {
          mins.splice(0, 1)
          maxs.splice(0, 1)
        }
        r = { min: Math.min(...mins), max: Math.max(...maxs) }
        break
      case 'custom':
        r = customOps[n.ex]!.range(ranges)
        break
      default:
        assertUnreachable(n)
    }
    result.set(n, r)
  })
  return result
}

function getMonotonicities(
  node: NumNode<OP>,
  cat: string,
  nodeRanges: NodeRanges
): Monotonicities {
  const mon = new Map<AnyNode<OP>, Monotonicity>()
  const toVisit: { node: AnyNode<OP>; inc: boolean }[] = [{ node, inc: true }]
  const result = new Map<string, Monotonicity>()

  // `inc` if `node` is strictly increasing in *some* valid regions.
  // `!inc` if `node` is strictly decreasing in *some* valid regions.
  // Consequently, if both `inc` and `!inc` are called on the same
  // node, the node itself is non-monotonic.
  function visit(node: AnyNode<OP>, inc: boolean) {
    if (!mon.has(node)) mon.set(node, { inc: true, dec: true })
    const m = mon.get(node)!
    if (inc && m.dec) m.dec = false
    else if (!inc && m.inc) m.inc = false
    else return // no update
    toVisit.push({ node, inc })
  }

  // Cannot use `traverse` because each node is visited twice, once for `inc` and once for `dec`
  while (toVisit.length) {
    const { node, inc } = toVisit.pop()!
    switch (node.op) {
      case 'read':
        result.set(node.tag[cat]!, mon.get(node)!)
        break
      case 'const':
        break
      case 'sum':
      case 'min':
      case 'max':
        node.x.forEach((n) => visit(n, inc))
        break
      case 'thres': {
        node.x.forEach((n) => visit(n, inc))
        const ge = nodeRanges.get(node.x[0])!
        const lt = nodeRanges.get(node.x[1])!
        // if `br` is not visited, both branches are constants and equal
        if (ge.max > lt.min) {
          visit(node.br[0], inc)
          visit(node.br[1], !inc)
        }
        if (ge.min < lt.max) {
          visit(node.br[0], !inc)
          visit(node.br[1], inc)
        }
        break
      }
      case 'sumfrac': {
        const [x, c] = node.x.map((n) => nodeRanges.get(n)!)
        // if `x` is not visited, `c == 0` and `node == 1`
        if (c.min < 0) visit(node.x[0], !inc)
        if (c.max > 0) visit(node.x[0], inc)
        // if `c` is not visited, `x == 0` and `node == 0`
        if (x.min < 0) visit(node.x[1], inc)
        if (x.max > 0) visit(node.x[1], !inc)
        break
      }
      case 'prod': {
        const r = nodeRanges.get(node)!
        const pos = r.min > 0
        if (!pos && r.max >= 0) {
          // unsupported zero-touching
          node.x.forEach((n) => visit(n, true))
          node.x.forEach((n) => visit(n, false))
        } else
          node.x.forEach((n) =>
            visit(n, (pos === inc) === nodeRanges.get(n)!.min > 0)
          )
        break
      }
      case 'match':
      case 'lookup':
        node.x.forEach((n) => visit(n, inc))
        node.br.forEach((n) => visit(n, true))
        node.br.forEach((n) => visit(n, false))
        break
      case 'subscript': {
        const {
          br: [br],
          ex: arr,
        } = node
        if (typeof arr[0] === 'number') {
          let { min: start, max: last } = nodeRanges.get(br)!
          start = Math.max(0, Math.ceil(start))
          last = Math.min(last, arr.length - 1)
          for (let i = start + 1; i <= last; i++)
            if (arr[i - 1] < arr[i]) {
              visit(br, inc)
              break
            }
          for (let i = start + 1; i <= last; i++)
            if (arr[i - 1] > arr[i]) {
              visit(br, !inc)
              break
            }
        } else {
          visit(br, true)
          visit(br, false)
        }
        break
      }
      case 'custom':
        customOps[node.ex]
          .monotonicity(node.x.map((n) => nodeRanges.get(n)!))
          .forEach((t, i) => {
            if (!t.inc) visit(node.x[i], !inc)
            if (!t.dec) visit(node.x[i], inc)
          })
        break
      default:
        assertUnreachable(node)
    }
  }
  return result
}
