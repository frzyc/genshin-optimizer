import type { AnyNode, NumNode, StrNode, OP as TaggedOP } from '../node';
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>;
/** Simplify `n` */
export declare function simplify<I extends OP>(n: NumNode<I>[]): NumNode<I>[];
export declare function simplify<I extends OP>(n: StrNode<I>[]): StrNode<I>[];
export declare function simplify<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[];
/** Combine nested `sum`/`prod`/`min`/`max`, e.g., turn `sum(..., sum(...))` into `sum(...)` */
export declare function flatten<I extends OP>(n: NumNode<I>[]): NumNode<I>[];
export declare function flatten<I extends OP>(n: StrNode<I>[]): StrNode<I>[];
export declare function flatten<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[];
/** Combine constants in `sum`/`prod`/`min`/`max`, e.g., turn `sum(1, 2, ...)` into `sum(3, ...)` */
export declare function combineConst<I extends OP>(n: NumNode<I>[]): NumNode<I>[];
export declare function combineConst<I extends OP>(n: StrNode<I>[]): StrNode<I>[];
export declare function combineConst<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[];
/** Reuse nodes if they share the same computation with another node */
export declare function deduplicate<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[];
export {};
//# sourceMappingURL=simplify.d.ts.map