import type { Tag } from '../tag'
import type {
  AnyNode,
  Const,
  Custom,
  DynamicTag,
  Lookup,
  Match,
  Max,
  Min,
  NumNode,
  OP,
  Prod,
  Read,
  ReRead,
  StrNode,
  Subscript,
  Sum,
  SumFrac,
  TagOverride,
  TagValRead,
  Threshold,
} from './type'

type _value = number | string
type Num<P extends OP> = NumNode<P> | number
type Str<P extends OP> = StrNode<P> | string
type Val<P extends OP> = AnyNode<P> | _value

// Convenient empty arguments
const x = Object.freeze([]) as never[]
const br = Object.freeze([]) as never[]

export function constant(val: number): Const<number>
export function constant(val: string): Const<string>
export function constant(val: _value): Const<_value>
export function constant(val: _value): Const<_value> {
  return { op: 'const', x, br, ex: val }
}

/** x0 + x1 + ... */
export const sum = <P extends OP = never>(...x: Num<P>[]): Sum<P | 'sum'> =>
  arithmetic('sum', x)
/** x0 * x1 * ... */
export const prod = <P extends OP = never>(...x: Num<P>[]): Prod<P | 'prod'> =>
  arithmetic('prod', x)
/** min( x0, x1, ... ) */
export const min = <P extends OP = never>(...x: Num<P>[]): Min<P | 'min'> =>
  arithmetic('min', x)
/** max( x0, x1, ... ) */
export const max = <P extends OP = never>(...x: Num<P>[]): Max<P | 'max'> =>
  arithmetic('max', x)
/** x / (x + c) */
export const sumfrac = <P extends OP = never>(
  x: Num<P>,
  c: Num<P>
): SumFrac<P | 'sumfrac'> => arithmetic('sumfrac', [x, c])
function arithmetic<Op extends string, P extends OP>(op: Op, x: Num<P>[]) {
  return { op, x: toVs(x), br }
}

/** v1 == v2 ? eq : neq */
export function cmpEq<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  eq: Num<P>,
  neq?: Num<P>
): Match<NumNode<P>, P | 'match'>
export function cmpEq<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  eq: Str<P>,
  neq: Str<P>
): Match<StrNode<P>, P | 'match'>
export function cmpEq<P extends OP = never>(
  v1: Str<P>,
  v2: Str<P>,
  eq: Num<P>,
  neq?: Num<P>
): Match<NumNode<P>, P | 'match'>
export function cmpEq<P extends OP = never>(
  v1: Str<P>,
  v2: Str<P>,
  eq: Str<P>,
  neq: Str<P>
): Match<StrNode<P>, P | 'match'>
export function cmpEq<P extends OP = never>(
  v1: Val<P>,
  v2: Val<P>,
  eq: Val<P>,
  neq: Val<P> = 0
): Match<AnyNode<P>, P | 'match'> {
  return { op: 'match', x: toVs([eq, neq]), br: toVs([v1, v2]) }
}
/** v1 != v2 ? neq : eq */
export function cmpNE<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  neq: Num<P>,
  eq?: Num<P>
): Match<NumNode<P>, P | 'match'>
export function cmpNE<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  neq: Str<P>,
  eq: Str<P>
): Match<StrNode<P>, P | 'match'>
export function cmpNE<P extends OP = never>(
  v1: Str<P>,
  v2: Str<P>,
  neq: Num<P>,
  eq?: Num<P>
): Match<NumNode<P>, P | 'match'>
export function cmpNE<P extends OP = never>(
  v1: Str<P>,
  v2: Str<P>,
  neq: Str<P>,
  eq: Str<P>
): Match<StrNode<P>, P | 'match'>
export function cmpNE<P extends OP = never>(
  v1: Val<P>,
  v2: Val<P>,
  neq: Val<P>,
  eq: Val<P> = 0
): Match<AnyNode<P>, P | 'match'> {
  return { op: 'match', x: toVs([eq, neq]), br: toVs([v1, v2]) }
}

/** v1 >= v2 ? ge : lt */
export function cmpGE<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  ge: Num<P>,
  lt?: Num<P>
): Threshold<NumNode<P>, P | 'thres'>
export function cmpGE<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  ge: Str<P>,
  lt: Str<P>
): Threshold<StrNode<P>, P | 'thres'>
export function cmpGE<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  ge: Val<P>,
  lt: Val<P> = 0
): Threshold<AnyNode<P>, P | 'thres'> {
  return thres(v1, v2, ge, lt)
}
/** v1 < v2 ? lt : ge */
export function cmpLT<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  lt: Num<P>,
  ge?: Num<P>
): Threshold<NumNode<P>, P | 'thres'>
export function cmpLT<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  lt: Str<P>,
  ge: Str<P>
): Threshold<StrNode<P>, P | 'thres'>
export function cmpLT<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  lt: Val<P>,
  ge: Val<P> = 0
): Threshold<AnyNode<P>, P | 'thres'> {
  return thres(v1, v2, ge, lt)
}
/** v1 <= v2 ? le : gt */
export function cmpLE<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  le: Num<P>,
  gt?: Num<P>
): Threshold<NumNode<P>, P | 'thres'>
export function cmpLE<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  le: Str<P>,
  gt: Str<P>
): Threshold<StrNode<P>, P | 'thres'>
export function cmpLE<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  le: Val<P>,
  gt: Val<P> = 0
): Threshold<AnyNode<P>, P | 'thres'> {
  return thres(v2, v1, le, gt)
}
/** v1 > v2 ? gt : le */
export function cmpGT<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  gt: Num<P>,
  le?: Num<P>
): Threshold<NumNode<P>, P | 'thres'>
export function cmpGT<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  gt: Str<P>,
  le: Str<P>
): Threshold<StrNode<P>, P | 'thres'>
export function cmpGT<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  gt: Val<P>,
  le: Val<P> = 0
): Threshold<AnyNode<P>, P | 'thres'> {
  return thres(v2, v1, le, gt)
}
/** v1 >= v2 ? ge : lt */
function thres<P extends OP = never>(
  v1: Num<P>,
  v2: Num<P>,
  ge: Val<P>,
  lt: Val<P>
): Threshold<AnyNode<P>, P | 'thres'> {
  return { op: 'thres', x: toVs([ge, lt]), br: toVs([v1, v2]) }
}

/** table[index] ?? defaultNode */
export function lookup<P extends OP>(
  index: Str<P>,
  table: Record<string, Num<P>>,
  defaultV?: Num<P>
): Lookup<NumNode<P>, P | 'lookup'>
export function lookup<P extends OP>(
  index: Str<P>,
  table: Record<string, Str<P>>,
  defaultV?: Str<P>
): Lookup<StrNode<P>, P | 'lookup'>
export function lookup<P extends OP>(
  index: Str<P>,
  table: Record<string, Val<P>>,
  defaultV?: Val<P>
): Lookup<AnyNode<P>, P | 'lookup'> {
  return {
    op: 'lookup',
    br: [toV(index)],
    ex: Object.fromEntries(Object.keys(table).map((key, i) => [key, i + 1])),
    x: toVs([defaultV ?? NaN, ...Object.values(table)]),
  }
}
/** table[index] */
export function subscript<P extends OP>(
  index: Num<P>,
  table: number[]
): Subscript<number, P | 'subscript'>
export function subscript<P extends OP>(
  index: Num<P>,
  table: string[]
): Subscript<string, P | 'subscript'>
export function subscript<P extends OP>(
  index: Num<P>,
  table: number[] | string[]
): Subscript<_value, P | 'subscript'> {
  return { op: 'subscript', ex: table, x, br: [toV(index)] }
}

// Tagging

export function tag<P extends OP = never>(
  v: Num<P>,
  tag: Tag
): TagOverride<NumNode<P>, P | 'tag'>
export function tag<P extends OP = never>(
  v: Str<P>,
  tag: Tag
): TagOverride<StrNode<P>, P | 'tag'>
export function tag<P extends OP = never>(
  v: Val<P>,
  tag: Tag
): TagOverride<AnyNode<P>, P | 'tag'>
export function tag<P extends OP = never>(
  v: Val<P>,
  tag: Tag
): TagOverride<AnyNode<P>, P | 'tag'> {
  return { op: 'tag', x: [toV(v)], br, tag }
}
export function dynTag<P extends OP = never>(
  v: Num<P>,
  tag: Record<string, Str<P>>
): DynamicTag<NumNode<P>, P | 'dtag'>
export function dynTag<P extends OP = never>(
  v: Str<P>,
  tag: Record<string, Str<P>>
): DynamicTag<StrNode<P>, P | 'dtag'>
export function dynTag<P extends OP = never>(
  v: Val<P>,
  tag: Record<string, Str<P>>
): DynamicTag<AnyNode<P>, P | 'dtag'>
export function dynTag<P extends OP = never>(
  v: Val<P>,
  tag: Record<string, Str<P>>
): DynamicTag<AnyNode<P>, P | 'dtag'> {
  return {
    op: 'dtag',
    x: [toV(v)],
    br: toVs(Object.values(tag)),
    ex: Object.keys(tag),
  }
}
export function tagVal(cat: string): TagValRead {
  return { op: 'vtag', x, br, ex: cat }
}

export function read(tag: Tag, ex: Read['ex']): Read {
  return { op: 'read', x, br, tag, ex }
}
export function reread(tag: Tag): ReRead {
  return { op: 'reread', tag }
}

export function custom<P extends OP = never>(
  op: string,
  ...v: Num<P>[]
): Custom<NumNode<P>, P | 'custom'>
export function custom<P extends OP = never>(
  op: string,
  ...v: Str<P>[]
): Custom<StrNode<P>, P | 'custom'>
export function custom<P extends OP = never>(
  op: string,
  ...v: Val<P>[]
): Custom<AnyNode<P>, P | 'custom'>
export function custom<P extends OP = never>(
  op: string,
  ...v: Val<P>[]
): Custom<AnyNode<P>, P | 'custom'> {
  return { op: 'custom', x: toVs(v), br, ex: op }
}

function toVs<P extends OP>(vals: Num<P>[]): NumNode<P>[]
function toVs<P extends OP>(vals: Str<P>[]): StrNode<P>[]
function toVs<P extends OP>(vals: Val<P>[]): AnyNode<P>[]
function toVs<P extends OP>(vals: Val<P>[]): AnyNode<P>[] {
  return vals.map(toV<P>)
}
function toV<P extends OP>(val: Num<P>): NumNode<P>
function toV<P extends OP>(val: Str<P>): StrNode<P>
function toV<P extends OP>(val: Val<P>): AnyNode<P>
function toV<P extends OP>(val: Val<P>): AnyNode<P> {
  if (typeof val === 'number') return constant(val)
  if (typeof val === 'string') return constant(val)
  return val
}
