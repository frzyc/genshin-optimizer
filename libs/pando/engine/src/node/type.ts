/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Tag } from '../tag'

export type OP =
  | 'const'
  | 'sum'
  | 'prod'
  | 'min'
  | 'max'
  | 'sumfrac'
  | 'subscript'
  | 'lookup'
  | 'thres'
  | 'match'
  | 'tag'
  | 'dtag'
  | 'vtag'
  | 'read'
  | 'custom'
interface Base<op extends OP, X, Br = never> {
  op: op // Operation Name
  x: X[] // Arguments
  br: Br[] // Branching Arguments
  ex?: any // Extra information for calculation
  tag?: Tag // Tag used by read- and tag-related nodes
}

export interface Const<V> extends Base<'const', never> {
  ex: V
}

// Arithmetics

/** x0 + x1 + ... */
export interface Sum<PermitOP extends OP = OP>
  extends Base<'sum' & PermitOP, NumNode<PermitOP>> {}
/** x0 * x1 * ... */
export interface Prod<PermitOP extends OP = OP>
  extends Base<'prod' & PermitOP, NumNode<PermitOP>> {}
/** min( x0, x1, ... ) */
export interface Min<PermitOP extends OP = OP>
  extends Base<'min' & PermitOP, NumNode<PermitOP>> {}
/** max( x0, x1, ... ) */
export interface Max<PermitOP extends OP = OP>
  extends Base<'max' & PermitOP, NumNode<PermitOP>> {}
/** x0 / ( x0 + x1 ) */
export interface SumFrac<PermitOP extends OP = OP>
  extends Base<'sumfrac' & PermitOP, NumNode<PermitOP>> {}

// Branching

/** br0 >= br1 ? x0 : x1 */
export interface Threshold<Output, PermitOP extends OP = OP>
  extends Base<'thres' & PermitOP, Output, NumNode<PermitOP>> {}
/** br0 == br1 ? x0 : x1 */
export interface Match<Output, PermitOP extends OP = OP>
  extends Base<'match' & PermitOP, Output, AnyNode<PermitOP>> {}
/** x[ex[br0]] ?? x0 */
export interface Lookup<Output, PermitOP extends OP = OP>
  extends Base<'lookup' & PermitOP, Output, StrNode<PermitOP>> {
  ex: Record<string, number>
}
/** ex[br0] */
export interface Subscript<
  Type extends number | string,
  PermitOP extends OP = OP
> extends Base<'subscript' & PermitOP, never, NumNode<PermitOP>> {
  ex: Type[]
}

// Tagging

/** x0 with attached static tag */
export interface TagOverride<Output, PermitOP extends OP = OP>
  extends Base<'tag' & PermitOP, Output> {
  ex?: never
  tag: Tag
}
/** x0 with attached dynamic tag { [ex[i]]: br[i] } */
export interface DynamicTag<Output, PermitOP extends OP = OP>
  extends Base<'dtag' & PermitOP, Output, StrNode<PermitOP>> {
  ex: string[]
}
/** Tag value associated with a category, or '' of the value does not exist */
export interface TagValRead<PermitOP extends OP = OP>
  extends Base<'vtag' & PermitOP, never> {
  ex: string
}
export interface Read extends Base<'read', never> {
  /** Accumulator for multiple matches */
  ex: (Sum | Prod | Min | Max)['op'] | undefined
  tag: Tag
}
export interface ReRead {
  op: 'reread'
  tag: Tag
}

/**
 * Custom computation with `ex` identifying the computation.
 * The argument type must be the same as the result type.
 */
export interface Custom<Output, PermitOP extends OP = OP>
  extends Base<'custom' & PermitOP, Output> {
  ex: string
}

export type NumNode<PermitOP extends OP = OP> =
  | Const<number>
  | Sum<PermitOP>
  | Prod<PermitOP>
  | Max<PermitOP>
  | Min<PermitOP>
  | SumFrac<PermitOP>
  | Threshold<NumNode<PermitOP>, PermitOP>
  | Match<NumNode<PermitOP>, PermitOP>
  | Lookup<NumNode<PermitOP>, PermitOP>
  | Subscript<number, PermitOP>
  | TagOverride<NumNode<PermitOP>, PermitOP>
  | DynamicTag<NumNode<PermitOP>, PermitOP>
  | Read
  | Custom<NumNode<PermitOP>, PermitOP>
export type StrNode<PermitOP extends OP = OP> =
  | Const<string>
  | Threshold<StrNode<PermitOP>, PermitOP>
  | Match<StrNode<PermitOP>, PermitOP>
  | Lookup<StrNode<PermitOP>, PermitOP>
  | Subscript<string, PermitOP>
  | TagOverride<StrNode<PermitOP>, PermitOP>
  | DynamicTag<StrNode<PermitOP>, PermitOP>
  | TagValRead<PermitOP>
  | Read
  | Custom<StrNode<PermitOP>, PermitOP>
export type AnyNode<PermitOP extends OP = OP> =
  | Const<number | string>
  | Sum<PermitOP>
  | Prod<PermitOP>
  | Max<PermitOP>
  | Min<PermitOP>
  | SumFrac<PermitOP>
  | Threshold<AnyNode<PermitOP>, PermitOP>
  | Match<AnyNode<PermitOP>, PermitOP>
  | Lookup<AnyNode<PermitOP>, PermitOP>
  | Subscript<number | string, PermitOP>
  | TagOverride<AnyNode<PermitOP>, PermitOP>
  | DynamicTag<AnyNode<PermitOP>, PermitOP>
  | TagValRead<PermitOP>
  | Read
  | Custom<AnyNode<PermitOP>, PermitOP>

export type NumOP = NumNode['op']
export type StrOP = StrNode['op']
export type AnyOP = AnyNode['op']
