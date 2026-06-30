import type { DebugCalculator } from '../debug';
import type { DedupTag, RawTagMapKeys, RawTagMapValues, Tag } from '../tag';
import { TagMapSubsetValues } from '../tag';
import type { AnyNode, BaseRead, NumNode, ReRead, StrNode } from './type';
export type TagCache<M> = DedupTag<PreRead<M>>;
export type PreRead<M> = Partial<Record<NonNullable<BaseRead['ex']>, CalcResult<number | string, M>>> & {
    pre: CalcResult<number | string, M>[];
};
export type CalcResult<V, M> = {
    val: V;
    meta: M;
};
export declare class Calculator<M = any> {
    nodes: TagMapSubsetValues<AnyNode | ReRead>;
    cache: DedupTag<PreRead<M>>;
    calc: DedupTag<this>;
    constructor(rawKeys: RawTagMapKeys, ...values: RawTagMapValues<AnyNode | ReRead>[]);
    withTag(tag: Tag): this;
    gather<V extends number | string = number | string>(tag: Tag): CalcResult<V, M>[];
    compute(n: NumNode): CalcResult<number, M>;
    compute(n: StrNode): CalcResult<string, M>;
    compute(n: AnyNode): CalcResult<number | string, M>;
    _gather(cache: TagCache<M>): PreRead<M>;
    _compute(n: StrNode, cache: TagCache<M>): CalcResult<string, M>;
    _compute(n: NumNode, cache: TagCache<M>): CalcResult<number, M>;
    _compute(n: AnyNode, cache: TagCache<M>): CalcResult<number | string, M>;
    defaultAccu(_tag: Tag): BaseRead['ex'];
    markGathered(_tag: Tag, _entryTag: Tag, _n: AnyNode | undefined, result: CalcResult<number | string, M>): CalcResult<number | string, M>;
    computeMeta(_n: AnyNode, _value: number | string, _x: (CalcResult<number | string, M> | undefined)[], _br: CalcResult<number | string, M>[], _tag: Tag | undefined): M;
    toDebug(): DebugCalculator;
}
//# sourceMappingURL=calc.d.ts.map