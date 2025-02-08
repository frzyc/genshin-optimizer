import type { AnyNode, NumNode, OP as TaggedOP } from '../node'
import { calculation, constant, mapBottomUp, max, min, traverse } from '../node'
import { assertUnreachable } from '../util'
import { combineConst } from './simplify'
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>
const { arithmetic, branching } = calculation

type Component = Record<string, number>
type Builds = Component[][]
type Tonicity = { inc: boolean; dec: boolean }
type Range = { min: number; max: number }

type CompRanges = Record<string, Range>[]
type NodeRanges = Map<AnyNode<OP>, Range>
type Tonicities = Map<string, Tonicity>

export type CustomInfo = {
  range: (r: Range[]) => Range
  tonicity: (r: Range[]) => Tonicity[]
}
export const customInfo: Record<string, CustomInfo> = {}

export function prune<I extends OP>(
  nodes: NumNode<I>[],
  builds: Builds,
  cat: string,
  minimum: number[],
  _keepTop: number
): { nodes: NumNode<I>[]; builds: Builds } {
  while (true) {
    const oldNodes = nodes
    const oldBuilds = builds

    let compRanges = builds.map(getCompRanges)
    nodes = pruneBranches(nodes, getNodeRanges(nodes, cat, compRanges))
    compRanges = builds.map(getCompRanges)
    pruneCompRange(builds, nodes, minimum, cat, compRanges)
    nodes = combineConst(nodes)

    if (oldNodes === nodes && oldBuilds == builds) break
  }
  return { nodes, builds }
}

/** Remove branches that are never chosen */
function pruneBranches<I extends OP>(
  n: NumNode<I>[],
  ranges: NodeRanges
): NumNode<I>[] {
  return mapBottomUp(n, (n, o) => {
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
        if (x.length !== n.x.length) return min(...(x as any)) as NumNode<I>
        break
      }
      case 'max': {
        const threshold = ranges.get(o)!.min
        const x = n.x.filter((_, i) => ranges.get(o.x[i])!.max >= threshold)
        if (x.length === 1) return x[0]
        if (x.length !== n.x.length) return max(...(x as any)) as NumNode<I>
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
}

/** Remove components that do not meet the `minimum` requirements in any builds */
function pruneCompRange<C extends Component>(
  builds: C[][],
  nodes: NumNode<OP>[],
  minimum: number[],
  cat: string,
  compRanges: CompRanges | undefined
): C[][] {
  const old = builds
  builds = [...builds]
  compRanges ??= builds.map(getCompRanges)
  let progress = true
  while (progress) {
    progress = false
    builds.forEach((comp, i) => {
      const new_comp = comp.filter((c) => {
        compRanges[i] = getCompRanges([c])
        const ranges = getNodeRanges(nodes, cat, compRanges)
        return nodes.some((n, i) => ranges.get(n)!.max >= minimum[i])
      })
      if (new_comp.length != comp.length) {
        builds[i] = new_comp
        compRanges[i] = getCompRanges(new_comp)
        progress = true
      }
    })
  }
  return old.every((c, i) => c.length === builds[i].length) ? old : builds
}

/** Get range assuming any item in `comp` can be selected */
function getCompRanges(comp: Component[]): CompRanges[number] {
  const iter = comp.values()
  const first = iter.next().value
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
function getNodeRanges(
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

function _getTonicities(
  n: NumNode<OP>[],
  cat: string,
  ranges: NodeRanges
): Tonicities {
  const t = new Map<AnyNode<OP>, Tonicity>()
  const marked: { node: AnyNode<OP>; inc: boolean }[] = []
  const result = new Map<string, Tonicity>()

  function mark(node: AnyNode<OP>, inc: boolean) {
    if (!t.has(node)) t.set(node, { inc: false, dec: false })
    const ton = t.get(node)!
    if (inc) {
      if (!ton.inc) {
        ton.inc = true
        marked.push({ node, inc })
      }
    } else {
      if (!ton.dec) {
        ton.dec = true
        marked.push({ node, inc })
      }
    }
  }

  // Cannot use `traverse` because each node is visited twice, once for `inc` and once for `dec`
  n.forEach((n) => mark(n, true))
  while (marked.length) {
    const { node, inc } = marked.pop()!
    switch (node.op) {
      case 'read':
        result.set(node.tag[cat]!, t.get(node)!)
        break
      case 'const':
      case 'subscript':
        break
      case 'sum':
      case 'min':
      case 'max':
        node.x.forEach((n) => mark(n, inc))
        break
      case 'match':
        node.x.forEach((n) => mark(n, inc))
        node.br.forEach((n) => mark(n, true))
        node.br.forEach((n) => mark(n, false))
        break
      case 'thres': {
        node.x.forEach((n) => mark(n, inc))
        const ge = ranges.get(node.x[0])!
        const lt = ranges.get(node.x[1])!
        // if `br` is not marked, both branches are equal
        if (ge.max > lt.min) {
          mark(node.br[0], inc)
          mark(node.br[1], !inc)
        }
        if (ge.min < lt.max) {
          mark(node.br[0], !inc)
          mark(node.br[1], inc)
        }
        break
      }
      case 'sumfrac': {
        const [x, c] = node.x.map((n) => ranges.get(n)!)
        // if `x` is not marked, `c == 0` and `node == 1`
        if (c.min < 0) mark(node.x[0], !inc)
        if (c.max > 0) mark(node.x[0], inc)
        // if `c` is not marked, `x == 0` and `node == 0`
        if (x.min < 0) mark(node.x[1], inc)
        if (x.max > 0) mark(node.x[1], !inc)
        break
      }
      case 'lookup':
        node.x.forEach((n) => mark(n, inc))
        node.br.forEach((n) => mark(n, true))
        node.br.forEach((n) => mark(n, false))
        break
      case 'prod': {
        const r = ranges.get(node)!
        if (r.min < 0 && r.max > 0) {
          // unsupported zero-crossing
          node.x.forEach((n) => mark(n, true))
          node.x.forEach((n) => mark(n, false))
        } else {
          const pos = r.min >= 0
          const neg = r.max <= 0
          node.x.forEach((n) => {
            const nr = ranges.get(n)!
            const npos = nr.min >= 0
            const nneg = nr.max <= 0
            if ((pos && npos) || (neg && nneg)) mark(n, inc)
            if ((pos && nneg) || (neg && npos)) mark(n, !inc)
          })
        }
        break
      }
      case 'custom':
        customInfo[node.ex]
          .tonicity(node.x.map((n) => ranges.get(n)!))
          .forEach((t, i) => {
            if (t.inc) mark(node.x[i], inc)
            if (t.dec) mark(node.x[i], !inc)
          })
        break
      default:
        assertUnreachable(node)
    }
  }
  return result
}
