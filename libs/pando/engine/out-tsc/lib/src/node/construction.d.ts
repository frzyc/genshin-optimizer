import type { Tag } from '../tag';
import type { AnyNode, BaseRead, Const, Custom, DynamicTag, Lookup, Match, Max, Min, NumNode, OP, Prod, ReRead, StrNode, Subscript, Sum, SumFrac, TagOverride, TagValRead, Threshold } from './type';
type _value = number | string;
type Num<P extends OP> = NumNode<P> | number;
type Str<P extends OP> = StrNode<P> | string;
type Val<P extends OP> = AnyNode<P> | _value;
export declare function constant(val: number): Const<number>;
export declare function constant(val: string): Const<string>;
export declare function constant(val: _value): Const<_value>;
/** x0 + x1 + ... */
export declare const sum: <P extends OP = never>(...x: Num<P>[]) => Sum<P | "sum">;
/** x0 * x1 * ... */
export declare const prod: <P extends OP = never>(...x: Num<P>[]) => Prod<P | "prod">;
/** min( x0, x1, ... ) */
export declare const min: <P extends OP = never>(...x: Num<P>[]) => Min<P | "min">;
/** max( x0, x1, ... ) */
export declare const max: <P extends OP = never>(...x: Num<P>[]) => Max<P | "max">;
/** x / (x + c) */
export declare const sumfrac: <P extends OP = never>(x: Num<P>, c: Num<P>) => SumFrac<P | "sumfrac">;
/** v1 == v2 ? eq : neq */
export declare function cmpEq<P extends OP = never>(v1: Num<P>, v2: Num<P>, eq: Num<P>, neq?: Num<P>): Match<NumNode<P>, P | 'match'>;
export declare function cmpEq<P extends OP = never>(v1: Num<P>, v2: Num<P>, eq: Str<P>, neq: Str<P>): Match<StrNode<P>, P | 'match'>;
export declare function cmpEq<P extends OP = never>(v1: Str<P>, v2: Str<P>, eq: Num<P>, neq?: Num<P>): Match<NumNode<P>, P | 'match'>;
export declare function cmpEq<P extends OP = never>(v1: Str<P>, v2: Str<P>, eq: Str<P>, neq: Str<P>): Match<StrNode<P>, P | 'match'>;
/** v1 != v2 ? neq : eq */
export declare function cmpNE<P extends OP = never>(v1: Num<P>, v2: Num<P>, neq: Num<P>, eq?: Num<P>): Match<NumNode<P>, P | 'match'>;
export declare function cmpNE<P extends OP = never>(v1: Num<P>, v2: Num<P>, neq: Str<P>, eq: Str<P>): Match<StrNode<P>, P | 'match'>;
export declare function cmpNE<P extends OP = never>(v1: Str<P>, v2: Str<P>, neq: Num<P>, eq?: Num<P>): Match<NumNode<P>, P | 'match'>;
export declare function cmpNE<P extends OP = never>(v1: Str<P>, v2: Str<P>, neq: Str<P>, eq: Str<P>): Match<StrNode<P>, P | 'match'>;
/** v1 >= v2 ? ge : lt */
export declare function cmpGE<P extends OP = never>(v1: Num<P>, v2: Num<P>, ge: Num<P>, lt?: Num<P>): Threshold<NumNode<P>, P | 'thres'>;
export declare function cmpGE<P extends OP = never>(v1: Num<P>, v2: Num<P>, ge: Str<P>, lt: Str<P>): Threshold<StrNode<P>, P | 'thres'>;
/** v1 < v2 ? lt : ge */
export declare function cmpLT<P extends OP = never>(v1: Num<P>, v2: Num<P>, lt: Num<P>, ge?: Num<P>): Threshold<NumNode<P>, P | 'thres'>;
export declare function cmpLT<P extends OP = never>(v1: Num<P>, v2: Num<P>, lt: Str<P>, ge: Str<P>): Threshold<StrNode<P>, P | 'thres'>;
/** v1 <= v2 ? le : gt */
export declare function cmpLE<P extends OP = never>(v1: Num<P>, v2: Num<P>, le: Num<P>, gt?: Num<P>): Threshold<NumNode<P>, P | 'thres'>;
export declare function cmpLE<P extends OP = never>(v1: Num<P>, v2: Num<P>, le: Str<P>, gt: Str<P>): Threshold<StrNode<P>, P | 'thres'>;
/** v1 > v2 ? gt : le */
export declare function cmpGT<P extends OP = never>(v1: Num<P>, v2: Num<P>, gt: Num<P>, le?: Num<P>): Threshold<NumNode<P>, P | 'thres'>;
export declare function cmpGT<P extends OP = never>(v1: Num<P>, v2: Num<P>, gt: Str<P>, le: Str<P>): Threshold<StrNode<P>, P | 'thres'>;
/** table[index] ?? defaultNode */
export declare function lookup<P extends OP>(index: Str<P>, table: Record<string, Num<P>>, defaultV?: Num<P>): Lookup<NumNode<P>, P | 'lookup'>;
export declare function lookup<P extends OP>(index: Str<P>, table: Record<string, Str<P>>, defaultV?: Str<P>): Lookup<StrNode<P>, P | 'lookup'>;
/** table[index] */
export declare function subscript<P extends OP>(index: Num<P>, table: number[]): Subscript<number, P | 'subscript'>;
export declare function subscript<P extends OP>(index: Num<P>, table: string[]): Subscript<string, P | 'subscript'>;
/** Compute `v` using `{current tag}/tag` */
export declare function tag<P extends OP = never>(v: Num<P>, tag: Tag): TagOverride<NumNode<P>, P | 'tag'>;
export declare function tag<P extends OP = never>(v: Str<P>, tag: Tag): TagOverride<StrNode<P>, P | 'tag'>;
export declare function tag<P extends OP = never>(v: Val<P>, tag: Tag): TagOverride<AnyNode<P>, P | 'tag'>;
/**
 * Compute `v` using `{current tag}/tag`.
 * Unlike `tag()` function, the `tag` here is a node computed by Pando.
 * Prefer `tag` over this, when possible.
 */
export declare function dynTag<P extends OP = never>(v: Num<P>, tag: Record<string, Str<P>>): DynamicTag<NumNode<P>, P | 'dtag'>;
export declare function dynTag<P extends OP = never>(v: Str<P>, tag: Record<string, Str<P>>): DynamicTag<StrNode<P>, P | 'dtag'>;
export declare function dynTag<P extends OP = never>(v: Val<P>, tag: Record<string, Str<P>>): DynamicTag<AnyNode<P>, P | 'dtag'>;
/** Current tag value at `cat:`, or `''` of not available */
export declare function tagVal(cat: string): TagValRead;
/** Gather entries matching `{current tag}/Tag`, then combine the results with `ex` */
export declare function read(tag: Tag, ex?: BaseRead['ex']): BaseRead;
/** (Entry-only) trigger another gather with `{current tag}/tag` */
export declare function reread(tag: Tag): ReRead;
/** Custop node calculating `op(v)` */
export declare function custom<P extends OP = never>(op: string, ...v: Num<P>[]): Custom<NumNode<P>, P | 'custom'>;
export declare function custom<P extends OP = never>(op: string, ...v: Str<P>[]): Custom<StrNode<P>, P | 'custom'>;
export declare function custom<P extends OP = never>(op: string, ...v: Val<P>[]): Custom<AnyNode<P>, P | 'custom'>;
export {};
//# sourceMappingURL=construction.d.ts.map