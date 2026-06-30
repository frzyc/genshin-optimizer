import type { AnyNode, NumNode, OP as TaggedOP } from '../node';
import type { Monotonicity, Range } from '../util';
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>;
export type Candidate<ID = number> = {
    id: ID;
} & Record<string, number>;
type CndRanges = Record<string, Range>[];
type NodeRanges = Map<AnyNode<OP>, Range>;
type Monotonicities = Map<string, Monotonicity>;
type PruneResult<I extends OP, ID> = {
    nodes: NumNode<I>[];
    minimum: number[];
    candidates: Candidate<ID>[][];
    cndRanges: CndRanges;
    monotonicities: Monotonicities;
};
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
export declare function prune<I extends OP, ID>(nodes: NumNode<I>[], candidates: Candidate<ID>[][], dynTagCat: string, minimum: number[], topN: number): PruneResult<I, ID>;
export declare class State<I extends OP, ID> implements PruneResult<I, ID> {
    #private;
    minimum: number[];
    cat: string;
    progress: boolean;
    constructor(nodes: NumNode<I>[], minimum: number[], candidates: Candidate<ID>[][], cat: string);
    get nodes(): NumNode<I>[];
    set nodes(nodes: NumNode<I>[]);
    get candidates(): Candidate<ID>[][];
    set candidates(candidates: Candidate<ID>[][]);
    get cndRanges(): CndRanges;
    set cndRanges(cndRanges: CndRanges);
    get nodeRanges(): NodeRanges;
    get monotonicities(): Monotonicities;
}
/** Remove branches that are never chosen */
export declare function pruneBranches<ID>(state: State<OP, ID>): void;
/**
 * - Remove candidates that do not meet the `minimum` requirements in any builds
 * - Remove top-level nodes whose `minimum` requirements are met by every build
 */
export declare function pruneRange<ID>(state: State<OP, ID>, numReq: number): void;
/** Remove candidates that are never in the `topN` builds */
export declare function pruneBottom<ID>(state: State<OP, ID>, topN: number): void;
/**
 * Replace `read`/`sum`/`prod` combinations with smaller `read` nodes. If changes are made,
 * `candidates` will be replaced with new values with all string keys replaced, maintaining only 'id'.
 */
export declare function reaffine<ID>(state: State<OP, ID>): void;
export {};
//# sourceMappingURL=prune.d.ts.map