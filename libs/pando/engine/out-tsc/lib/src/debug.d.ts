import type { AnyNode, BaseRead, CalcResult, PreRead, TagCache } from './node';
import { Calculator as BaseCalculator } from './node';
import type { Tag } from './tag';
type TagStr = (tag: Tag, ex?: any) => string;
type Predicate = (debug: DebugMeta) => boolean;
export interface DebugMeta {
    readSeq?: string;
    formula: string;
    deps: DebugMeta[];
    omitted: DebugMeta[];
    val: number | string;
    x: DebugMeta[];
    br: DebugMeta[];
    comp: string;
    pivot: boolean;
    toJSON: (this: DebugMeta) => any;
}
export declare class DebugCalculator extends BaseCalculator<DebugMeta> {
    tagStr: TagStr;
    filter: Predicate;
    defaultAccu: (tag: Tag) => BaseRead['ex'];
    gathering: Set<TagCache<DebugMeta>>;
    constructor(calc: BaseCalculator<any>, tagStr?: TagStr, filter?: Predicate);
    withTag(_tag: Tag): this;
    _gather(cache: TagCache<DebugMeta>): PreRead<DebugMeta>;
    __gather(cache: TagCache<DebugMeta>): PreRead<DebugMeta>;
    _compute(n: AnyNode, cache: TagCache<DebugMeta>): CalcResult<any, DebugMeta>;
    markGathered(tag: Tag, entryTag: Tag, _n: AnyNode | undefined, result: CalcResult<number | string, DebugMeta>): CalcResult<number | string, DebugMeta>;
    computeMeta(n: AnyNode, val: number | string, _x: (CalcResult<number | string, DebugMeta> | undefined)[], _br: CalcResult<number | string, DebugMeta>[], tag: Tag | undefined): DebugMeta;
}
export {};
//# sourceMappingURL=debug.d.ts.map