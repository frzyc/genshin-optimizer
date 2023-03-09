import type { Tag } from '../tag'
import type {
  AnyNode,
  Const,
  DynamicTag,
  Lookup,
  Match,
  Max,
  Min,
  NumNode,
  Prod,
  Read,
  ReRead,
  StrNode,
  Subscript,
  Sum,
  SumFrac,
  TagOverride,
  Threshold,
} from './type'

type _value = number | string
type Num = NumNode | number
type Str = StrNode | string
type Val = AnyNode | _value

export function constant(val: number): Const<number>
export function constant(val: string): Const<string>
export function constant(val: _value): Const<_value>
export function constant(val: _value): Const<_value> {
  return { op: 'const', x: [], br: [], ex: val }
}

function arithmetic<Op extends string>(op: Op, x: Num[]) {
  return { op, x: toVs(x), br: [] }
}
/** x0 + x1 + ... */
export const sum = (...x: Num[]): Sum => arithmetic('sum', x)
/** x0 * x1 * ... */
export const prod = (...x: Num[]): Prod => arithmetic('prod', x)
/** min( x0, x1, ... ) */
export const min = (...x: Num[]): Min => arithmetic('min', x)
/** max( x0, x1, ... ) */
export const max = (...x: Num[]): Max => arithmetic('max', x)
/** x / (x + c) */
export const sumfrac = (x: Num, c: Num): SumFrac =>
  arithmetic('sumfrac', [x, c])

/** v1 == v2 ? eq : neq */
export function cmpEq(v1: Num, v2: Num, eq: Num, neq?: Num): Match<NumNode>
export function cmpEq(v1: Num, v2: Num, eq: Str, neq: Str): Match<StrNode>
export function cmpEq(v1: Str, v2: Str, eq: Num, neq?: Num): Match<NumNode>
export function cmpEq(v1: Str, v2: Str, eq: Str, neq: Str): Match<StrNode>
export function cmpEq(v1: Val, v2: Val, eq: Val, neq: Val = 0): Match<AnyNode> {
  return { op: 'match', x: toVs([eq, neq]), br: toVs([v1, v2]) }
}
/** v1 != v2 ? neq : eq */
export function cmpNE(v1: Num, v2: Num, neq: Num, eq?: Num): Match<NumNode>
export function cmpNE(v1: Num, v2: Num, neq: Str, eq: Str): Match<StrNode>
export function cmpNE(v1: Str, v2: Str, neq: Num, eq?: Num): Match<NumNode>
export function cmpNE(v1: Str, v2: Str, neq: Str, eq: Str): Match<StrNode>
export function cmpNE(v1: Val, v2: Val, neq: Val, eq: Val = 0): Match<AnyNode> {
  return { op: 'match', x: toVs([eq, neq]), br: toVs([v1, v2]) }
}

/** v1 >= v2 ? ge : lt */
function thres(v1: Num, v2: Num, ge: Val, lt: Val): Threshold<AnyNode> {
  return { op: 'thres', x: toVs([ge, lt]), br: toVs([v1, v2]) }
}
/** v1 >= v2 ? ge : lt */
export function cmpGE(v1: Num, v2: Num, ge: Num, lt?: Num): Threshold<NumNode>
export function cmpGE(v1: Num, v2: Num, ge: Str, lt: Str): Threshold<StrNode>
export function cmpGE(
  v1: Num,
  v2: Num,
  ge: Val,
  lt: Val = 0
): Threshold<AnyNode> {
  return thres(v1, v2, ge, lt)
}
/** v1 < v2 ? lt : ge */
export function cmpLT(v1: Num, v2: Num, lt: Num, ge?: Num): Threshold<NumNode>
export function cmpLT(v1: Num, v2: Num, lt: Str, ge: Str): Threshold<StrNode>
export function cmpLT(
  v1: Num,
  v2: Num,
  lt: Val,
  ge: Val = 0
): Threshold<AnyNode> {
  return thres(v1, v2, ge, lt)
}
/** v1 <= v2 ? le : gt */
export function cmpLE(v1: Num, v2: Num, le: Num, gt?: Num): Threshold<NumNode>
export function cmpLE(v1: Num, v2: Num, le: Str, gt: Str): Threshold<StrNode>
export function cmpLE(
  v1: Num,
  v2: Num,
  le: Val,
  gt: Val = 0
): Threshold<AnyNode> {
  return thres(v2, v1, le, gt)
}
/** v1 > v2 ? gt : le */
export function cmpGT(v1: Num, v2: Num, gt: Num, le?: Num): Threshold<NumNode>
export function cmpGT(v1: Num, v2: Num, gt: Str, le: Str): Threshold<StrNode>
export function cmpGT(
  v1: Num,
  v2: Num,
  gt: Val,
  le: Val = 0
): Threshold<AnyNode> {
  return thres(v2, v1, le, gt)
}

/** table[index] ?? defaultNode */
export function lookup(
  index: StrNode,
  table: Record<string, Num>,
  defaultV?: Num
): Lookup<NumNode>
export function lookup(
  index: StrNode,
  table: Record<string, Str>,
  defaultV?: Str
): Lookup<StrNode>
export function lookup(
  index: StrNode,
  table: Record<string, Val>,
  defaultV?: Val
): Lookup<AnyNode> {
  return {
    op: 'lookup',
    br: [toV(index)],
    ex: Object.fromEntries(Object.keys(table).map((key, i) => [key, i + 1])),
    x: toVs([defaultV ?? NaN, ...Object.values(table)]),
  }
}
/** table[index] */
export function subscript(index: NumNode, table: number[]): Subscript<number>
export function subscript(index: NumNode, table: string[]): Subscript<string>
export function subscript(
  index: NumNode,
  table: number[] | string[]
): Subscript<number | string> {
  return { op: 'subscript', ex: table, x: [], br: [toV(index)] }
}

// Tagging

export function tag(v: Num, tag: Tag): TagOverride<NumNode>
export function tag(v: Str, tag: Tag): TagOverride<StrNode>
export function tag(v: Val, tag: Tag): TagOverride<AnyNode> {
  return { op: 'tag', x: [toV(v)], br: [], tag }
}
export function dynTag(v: Num, tag: Record<string, Str>): DynamicTag<NumNode>
export function dynTag(v: Str, tag: Record<string, Str>): DynamicTag<StrNode>
export function dynTag(v: Val, tag: Record<string, Str>): DynamicTag<AnyNode> {
  return {
    op: 'dtag',
    x: [toV(v)],
    br: toVs(Object.values(tag)),
    ex: Object.keys(tag),
  }
}

export function read(tag: Tag, accu: Read['accu']): Read {
  return { op: 'read', x: [], br: [], tag, accu }
}
export function reread(tag: Tag): ReRead {
  return { op: 'reread', tag }
}

function toV(val: Num): NumNode
function toV(val: Str): StrNode
function toV(val: Val): AnyNode
function toV(val: Val): AnyNode {
  if (typeof val === 'number') return constant(val)
  if (typeof val === 'string') return constant(val)
  return val
}
function toVs(vals: Num[]): NumNode[]
function toVs(vals: Str[]): StrNode[]
function toVs(vals: Val[]): AnyNode[]
function toVs(vals: Val[]): AnyNode[] {
  return vals.map(toV)
}
