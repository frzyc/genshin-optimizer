import { type Tag } from '../tag';
import type { Calculator } from './calc';
import type { AnyNode, BaseRead, NumNode, StrNode, OP as TaggedOP } from './type';
/**
 * Most of functions here cache the calculation/traversal, and will skip any nodes
 * that they visit more than once. This caching will not work on nodes containing
 * `Tag`-related nodes. So they are disallowed by default here, as reflected in
 * this `OP` redeclaration.
 */
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>;
export type NumTagFree = NumNode<OP>;
export type StrTagFree = StrNode<OP>;
export type AnyTagFree = AnyNode<OP>;
/**
 * Apply all tag-related nodes from `n` calculation and replace `Read` nodes where
 * `dynTag(tag)` is not truthy. The replaced `Read` nodes are not evaluated further.
 *
 * The resulting nodes becomes "Tag"-free and can be evaluated without the need for
 * a calculator, given appropriate values for the replaced `Read` nodes.
 */
export declare function detach(n: NumNode[], calc: Calculator, dynTag: (_: Tag) => Tag | undefined): NumTagFree[];
export declare function detach(n: StrNode[], calc: Calculator, dynTag: (_: Tag) => Tag | undefined): StrTagFree[];
export declare function detach(n: AnyNode[], calc: Calculator, dynTag: (_: Tag) => Tag | undefined): AnyTagFree[];
export declare function mapBottomUp<I extends OP, O extends OP>(n: NumNode<I>[], map: (_: AnyNode<I>, old: AnyNode<I>) => AnyNode<O>): NumNode<O>[];
export declare function mapBottomUp<I extends OP, O extends OP>(n: StrNode<I>[], map: (_: AnyNode<I>, old: AnyNode<I>) => AnyNode<O>): StrNode<O>[];
export declare function mapBottomUp<I extends OP, O extends OP>(n: AnyNode<I>[], map: (_: AnyNode<I>, old: AnyNode<I>) => AnyNode<O>): AnyNode<O>[];
export declare function map<I extends TaggedOP, O>(n: AnyNode<I>[], map: (n: AnyNode<I>, map: (n: AnyNode<I>) => O) => O): O[];
export declare function traverse<P extends TaggedOP>(n: AnyNode<P>[], visit: (n: AnyNode<P>, visit: (n: AnyNode<P>) => void) => void): void;
/**
 * Generates a custom function, "cuz speed".
 *
 * @param n
 * @param dynTagCat
 * @param slotCount
 * @param initial
 * @param header
 * @returns a custom function that accepts an array `_` of data.
 *
 * NOTE: `slotCount` === `_.length` for optimization reasons.
 */
export declare function compile(n: NumTagFree[], dynTagCat: string, slotCount: number): (_: Record<string, number>[]) => number[];
export declare function compile(n: StrTagFree[], dynTagCat: string, slotCount: number): (_: Record<string, string>[]) => string[];
export declare function compile(n: AnyTagFree[], dynTagCat: string, slotCount: number): (_: Record<string, any>[]) => any[];
export declare function compileDiff(n: AnyTagFree, dynTagCat: string, diffTags: string[], slotCount: number): (_: Record<string, any>[]) => any[];
/**
 * Returns a JS code that represents computation of `n`. The value of each
 * node `n` is written to a variable with the name `names.get(n)`. Variables
 * prefixed with `prefix`, and read nodes are computed using `readStr`.
 */
export declare function executionStr(n: AnyTagFree[], prefix: string, readStr: (_: BaseRead) => string): {
    str: string;
    names: Map<AnyTagFree, string>;
};
export {};
//# sourceMappingURL=transform.d.ts.map