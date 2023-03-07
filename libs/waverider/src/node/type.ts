import type { Tag } from '../tag'

export type OP = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac' |
  'subscript' | 'lookup' | 'thres' | 'match' |
  'tag' | 'dtag' | 'read'
interface Base<op extends OP, X, Br = never> {
  op: op    // Operation Name
  x: X[]    // Arguments
  br: Br[]  // Branching Arguments
  ex?: any  // Extra information for calculation
}

export interface Const<V> extends Base<'const', never> {
  ex: V
}

// Arithmetics

/** x0 + x1 + ... */
export interface Sum<PermitOP extends OP = OP> extends Base<'sum' & PermitOP, NumNode<PermitOP>> { }
/** x0 * x1 * ... */
export interface Prod<PermitOP extends OP = OP> extends Base<'prod' & PermitOP, NumNode<PermitOP>> { }
/** min( x0, x1, ... ) */
export interface Min<PermitOP extends OP = OP> extends Base<'min' & PermitOP, NumNode<PermitOP>> { }
/** max( x0, x1, ... ) */
export interface Max<PermitOP extends OP = OP> extends Base<'max' & PermitOP, NumNode<PermitOP>> { }
/** x0 / ( x0 + x1 ) */
export interface SumFrac<PermitOP extends OP = OP> extends Base<'sumfrac' & PermitOP, NumNode<PermitOP>> { }
/** ex[x0] */
export interface Subscript<Type extends number | string, PermitOP extends OP = OP> extends Base<'subscript' & PermitOP, never, NumNode<PermitOP>> {
  ex: Type[]
}

// Branching

/** br0 >= br1 ? x0 : x1 */
export interface Threshold<Output, PermitOP extends OP = OP> extends Base<'thres' & PermitOP, Output, NumNode<PermitOP>> { }
/** br0 == br1 ? x0 : x1 */
export interface Match<Output, PermitOP extends OP = OP> extends Base<'match' & PermitOP, Output, AnyNode<PermitOP>> { }
/** x[ex[br0]] ?? x0 */
export interface Lookup<Output, PermitOP extends OP = OP> extends Base<'lookup' & PermitOP, Output, StrNode<PermitOP>> {
  ex: Record<string, number>
}

// Tagging

export interface TagOverride<Output, PermitOP extends OP = OP> extends Base<'tag' & PermitOP, Output> {
  ex?: never
  tag: Tag
}
export interface DynamicTag<Output, PermitOP extends OP = OP> extends Base<'dtag' & PermitOP, Output, StrNode<PermitOP>> {
  ex: string[]
}
export interface Read extends Base<'read', never> {
  ex?: never
  tag: Tag
  accu: (Sum | Prod | Min | Max)['op'] | undefined
}
export interface ReRead {
  op: 'reread'
  tag: Tag
}

export type NumNode<PermitOP extends OP = OP> = Const<number> | Sum<PermitOP> | Prod<PermitOP> | Max<PermitOP> | Min<PermitOP> | SumFrac<PermitOP> |
  Threshold<NumNode<PermitOP>, PermitOP> | Match<NumNode<PermitOP>, PermitOP> | Lookup<NumNode<PermitOP>, PermitOP> | Subscript<number, PermitOP> |
  TagOverride<NumNode<PermitOP>, PermitOP> | DynamicTag<NumNode<PermitOP>, PermitOP> | Read
export type StrNode<PermitOP extends OP = OP> = Const<string> |
  Threshold<StrNode<PermitOP>, PermitOP> | Match<StrNode<PermitOP>, PermitOP> | Lookup<StrNode<PermitOP>, PermitOP> | Subscript<string, PermitOP> |
  TagOverride<StrNode<PermitOP>, PermitOP> | DynamicTag<StrNode<PermitOP>, PermitOP> | Read
export type AnyNode<PermitOP extends OP = OP> = Const<number | string> | Sum<PermitOP> | Prod<PermitOP> | Max<PermitOP> | Min<PermitOP> | SumFrac<PermitOP> |
  Threshold<AnyNode<PermitOP>, PermitOP> | Match<AnyNode<PermitOP>, PermitOP> | Lookup<AnyNode<PermitOP>, PermitOP> | Subscript<number | string, PermitOP> |
  TagOverride<AnyNode<PermitOP>, PermitOP> | DynamicTag<AnyNode<PermitOP>, PermitOP> | Read

export type NumOP = NumNode['op']
export type StrOP = StrNode['op']
export type AnyOP = AnyNode['op']
