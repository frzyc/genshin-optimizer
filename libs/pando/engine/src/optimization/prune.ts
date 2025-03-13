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
import { ArrayMap, assertUnreachable, customOps, isDebug } from '../util'
import { simplify } from './simplify'
const { arithmetic, branching } = calculation

type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>

// The downside of this is that object literal will not work if `ID` is not `number`, you need to cast it
export type Candidate<ID = number> = { id: ID } & Record<string, number>

type CndRanges = Record<string, Range>[]
type NodeRanges = Map<AnyNode<OP>, Range>
type Monotonicities = Map<string, Monotonicity>

type PruneResult<I extends OP, ID> = {
  nodes: NumNode<I>[]
  minimum: number[]
  candidates: Candidate<ID>[][]

  cndRanges: CndRanges
  monotonicities: Monotonicities
}

/**
 * Reduce the complexity of the optimization problem
 *
 *     maximize constraints[0]
 *     s.t. constraints[0..minimum.length] >= minimum
 *
 * returning a new optimization with the same `topN` builds
 * @param nodes
 *    A set of nodes used for minimum constraints, objective function, and other calculations.
 *    The nodes must be in the order [minConstraints, other calc], and `minConstraint[0]` is
 *    the obj function.
 * @param candidates Candidates used to construct the builds. Keys in `candidates` except 'id' may be removed in the results.
 * @param dynTagCat Tag category used by `compile` in the actual computation
 * @param minimum Minimum values for min constraint nodes.
 * @param topN The number of top builds to keep.
 * @returns
 *    A new values for `nodes`, `candidates`, and `minimum`. The returned values are incompatible
 *    with the passed-in arguments (DO NOT mix them). Candidates may also change, so all related
 *    computation needs to pass in to `nodes` as well, else they'll become unusable. `minConstraints`
 *    in `nodes` may be removed, excepts for `minConstraints[0]` if the constraint is always satisfied.
 */
export function prune<I extends OP, ID>(
  nodes: NumNode<I>[],
  candidates: Candidate<ID>[][],
  dynTagCat: string,
  minimum: number[],
  topN: number
): PruneResult<I, ID> {
  const state = new State(nodes, minimum, candidates, dynTagCat)
  while (state.progress) {
    state.progress = false
    pruneBranches(state)
    pruneRange(state, 1)
    reaffine(state)
    pruneBottom(state, topN)
  }
  state.nodes = simplify(state.nodes)
  return state
}

export class State<I extends OP, ID> implements PruneResult<I, ID> {
  #nodes: NumNode<I>[]
  minimum: number[]
  #candidates: Candidate<ID>[][]
  cat: string

  progress = true
  #cndRanges: CndRanges | undefined
  #nodeRanges: NodeRanges | undefined
  #monotonicities: Monotonicities | undefined

  constructor(
    nodes: NumNode<I>[],
    minimum: number[],
    candidates: Candidate<ID>[][],
    cat: string
  ) {
    this.#nodes = nodes
    this.minimum = minimum
    this.#candidates = candidates
    this.cat = cat
  }

  get nodes(): NumNode<I>[] {
    return this.#nodes
  }
  set nodes(nodes: NumNode<I>[]) {
    if (this.#nodes === nodes) return
    this.progress = true
    this.#nodes = nodes
    this.#nodeRanges = this.#monotonicities = undefined
  }

  get candidates(): Candidate<ID>[][] {
    return this.#candidates
  }
  set candidates(candidates: Candidate<ID>[][]) {
    if (this.candidates === candidates) return
    this.progress = true
    this.#candidates = candidates
    this.#cndRanges = this.#nodeRanges = this.#monotonicities = undefined
  }

  get cndRanges(): CndRanges {
    return (this.#cndRanges ??= this.candidates.map(computeCndRanges))
  }
  set cndRanges(cndRanges: CndRanges) {
    this.#cndRanges = cndRanges
  }
  get nodeRanges(): NodeRanges {
    return (this.#nodeRanges ??= computeNodeRanges(
      this.nodes,
      this.cat,
      this.cndRanges
    ))
  }
  get monotonicities(): Monotonicities {
    return (this.#monotonicities ??= getMonotonicities(
      this.nodes.slice(0, this.minimum.length),
      this.cat,
      this.nodeRanges
    ))
  }
}

/** Remove branches that are never chosen */
export function pruneBranches<ID>(state: State<OP, ID>) {
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
  state.nodes = result
}

/**
 * - Remove candidates that do not meet the `minimum` requirements in any builds
 * - Remove top-level nodes whose `minimum` requirements are met by every build
 */
export function pruneRange<ID>(state: State<OP, ID>, numReq: number) {
  const { nodeRanges, minimum: oldMin, cat } = state
  const candidates = [...state.candidates]
  const cndRanges = [...state.cndRanges]

  const nodes: NumNode<OP>[] = []
  const minimum: number[] = []
  let hasNonTrivialConstraint = false
  state.nodes.forEach((n, i) => {
    if (i < oldMin.length) {
      if (oldMin[i] > nodeRanges.get(n)!.min) hasNonTrivialConstraint = true
      else if (i >= numReq) return
      minimum.push(oldMin[i])
    }
    nodes.push(n)
  })
  if (minimum.length != oldMin.length) {
    state.nodes = nodes
    state.minimum = minimum
  }

  if (!hasNonTrivialConstraint) return

  let progress = false
  candidates.forEach((cnds, i) => {
    const oldCndRange = cndRanges[i]
    const newCnds = cnds.filter((c) => {
      cndRanges[i] = computeCndRanges([c])
      const ranges = computeNodeRanges(nodes, cat, cndRanges)
      return minimum.every((m, i) => ranges.get(nodes[i])!.max >= m)
    })
    if (newCnds.length != cnds.length) {
      candidates[i] = newCnds
      cndRanges[i] = computeCndRanges(newCnds)
      progress = true
    } else cndRanges[i] = oldCndRange
  })
  if (progress) {
    state.candidates = candidates
    state.cndRanges = cndRanges
  }
}

/** Remove candidates that are never in the `topN` builds */
export function pruneBottom<ID>(state: State<OP, ID>, topN: number) {
  const monotonicities = [...state.monotonicities]
  type Val = { incomp: number[]; inc: Record<string, number>; c: Candidate<ID> }
  const vals = state.candidates.map((comp) =>
    comp.map((c) => {
      const out: Val = { incomp: [], inc: {}, c }
      for (const [cat, m] of monotonicities)
        if (m.inc) out.inc[cat] = c[cat] ?? 0 // increasing
        else if (m.dec) out.inc[cat] = -(c[cat] ?? 0) // decreasing
        else out.incomp.push(c[cat] ?? 0) // incomparable
      return out
    })
  )
  const sample = vals[0][0]
  if (sample === undefined) return
  const cats = Object.keys(sample.inc)
  const revCats = [...cats].reverse()
  const hasIncomp = !!sample.incomp.length

  const candidates = vals.map((vals) => {
    const groups = new ArrayMap<number, Val[]>()
    if (hasIncomp) {
      vals.forEach((val) => {
        const ref = groups.ref(val.incomp)
        if (ref.value) ref.value.push(val)
        else ref.value = [val]
      })
    } else groups.ref([]).value = vals

    return [...groups.values()].flatMap((vals) => {
      vals.sort(({ inc: a }, { inc: b }) => {
        const cat = revCats.find((cat) => a[cat] !== b[cat])
        return cat === undefined ? 0 : b[cat] - a[cat] // assume non-NaN
      })
      return vals.filter(({ inc }, i) => {
        let betterCount = 0
        for (let j = 0, extra = i - topN; j <= extra + betterCount; j++) {
          const other = vals[j].inc
          if (cats.every((cat) => other[cat] >= inc[cat]))
            if (++betterCount >= topN) return false
        }
        return true
      })
    })
  })

  if (candidates.some((cnds, i) => cnds.length != state.candidates[i].length))
    state.candidates = candidates.map((cnds) => cnds.map((val) => val.c))
}

const offset = Symbol()
/**
 * Replace `read`/`sum`/`prod` combinations with smaller `read` nodes. If changes are made,
 * `candidates` will be replaced with new values with all string keys replaced, maintaining only 'id'.
 */
export function reaffine<ID>(state: State<OP, ID>) {
  const { nodes, cat, candidates } = state
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
  const shouldChange = [...topWeights.keys()].some((n) => {
    if (n.op === 'const' || n.op === 'read') return false
    if (n.op === 'sum' && n.x.length === 2)
      if (n.x[0].op === 'const' && n.x[1].op === 'read') return false
      else if (n.x[1].op === 'const' && n.x[0].op === 'read') return false
    return true
  })
  if (!shouldChange) return

  // { cat1:w1 cat2:w2 .. } => "!cat1:<w1>:cat2:<w2>:.." with PUA chars
  // instead of `!` and `:` to minimize the chance of them being in some `cat`s
  let readNames = new Map(
    [...topWeights.values()].map((w) => {
      const keys = Object.keys(w).sort()
      if (keys.length === 1 && w[keys[0]] === 1) return [w, keys[0]]
      // skip `w[offset]` because it doesn't go into the new `Read` nodes
      return [w, '\u{F33D}' + keys.flatMap((k) => [k, w[k]]).join('\u{F00D}')]
    })
  )
  if (!isDebug('calc')) {
    // "!cat1:<w1>:cat2:<w2>:.." => "cX" (skipped in debug mode)
    const map = new Map([...readNames.values()].map((id, i) => [id, `c${i}`]))
    readNames = new Map([...readNames].map(([w, id]) => [w, map.get(id)!]))
  }

  const weightNodes = new Map<Weight, NumNode<OP>>()
  for (const [w, name] of readNames) {
    const node = read({ [cat]: name })
    weightNodes.set(w, w[offset] !== 0 ? sum(w[offset], node) : node)
  }
  state.candidates = candidates.map((cnds) =>
    cnds.map((c) => {
      const result = { id: c['id'] } as Candidate<ID>
      readNames.forEach((name, w) => {
        if (name in result) return // same weight, different offsets
        result[name] = Object.entries(w).reduce(
          (acu, [k, v]) => acu + (c[k] ?? 0) * v,
          0
        )
      })
      return result
    })
  )
  state.nodes = mapBottomUp(nodes, (n, o) => {
    const w = topWeights.get(o)
    return w ? weightNodes.get(w)! : n
  })
}

/** Get range assuming any item in `cnds` can be selected */
function computeCndRanges<ID>(cnds: Candidate<ID>[]): CndRanges[number] {
  // CAUTION:
  // This is the only place where `id` is treated as non-opaque (comparable)
  // objects. If `c1.id < c2.id` may crash, we have to change the algorithm
  // or exclude `id` specifically. We don't care if the comparison result is
  // gibberish, though, so long as it succeeds.
  const iter = (cnds as Candidate[]).values()
  const first: Candidate | undefined = iter.next().value
  if (!first) return {}
  const result = Object.fromEntries(
    Object.entries(first).map(([k, v]) => [k, { min: v, max: v }])
  )
  for (const c of iter) {
    for (const [k, r] of Object.entries(result)) {
      const v = c[k] ?? 0
      if (r.min > v) r.min = v
      if (r.max < v) r.max = v
    }
    for (const [k, v] of Object.entries(c))
      if (!(k in result))
        result[k] = { min: Math.min(0, v), max: Math.max(0, v) }
  }
  return result
}

/** Get possible ranges of each node */
function computeNodeRanges(
  nodes: NumNode<OP>[],
  cat: string,
  cndRanges: CndRanges
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
        for (const { [n.tag[cat]!]: range } of cndRanges)
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
  nodes: NumNode<OP>[],
  cat: string,
  nodeRanges: NodeRanges
): Monotonicities {
  const mon = new Map<AnyNode<OP>, Monotonicity>()
  const toVisit: { node: AnyNode<OP>; inc: boolean }[] = []
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

  nodes.forEach((node) => visit(node, true))
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
        if (r.min < 0 && r.max > 0) {
          // unsupported zero-crossing
          node.x.forEach((n) => visit(n, true))
          node.x.forEach((n) => visit(n, false))
        } else {
          const absInc = inc === r.max > 0 // |node| is increasing in some regions
          node.x.forEach((n) => visit(n, absInc === nodeRanges.get(n)!.max > 0))
        }
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
