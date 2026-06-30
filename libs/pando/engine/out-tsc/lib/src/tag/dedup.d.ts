import type { TagId, TagMapKeys } from './keys';
import type { Tag } from './type';
export type DedupTag<V = never> = Leaf<V>;
/**
 * A group of deduplicated tags. `DedupTag`s of the same `Tag`
 * are guaranteed to be the same reference.
 */
export declare class DedupTags<V = never> {
    root: Internal<V>;
    keys: TagMapKeys;
    constructor(keys: TagMapKeys);
    /** Object associated with `tag` */
    at(tag: Tag): Leaf<V>;
}
declare class Internal<V> {
    parent: Internal<V>;
    children: Map<number, Internal<V>>;
    leaf?: Leaf<V>;
    constructor(parent: Internal<V>);
    child(id: number): Internal<V>;
}
declare class Leaf<V> {
    tag: Tag;
    id: TagId;
    val?: V;
    keys: TagMapKeys;
    internal: Internal<V>;
    constructor(tag: Tag, id: TagId, keys: TagMapKeys, internal: Internal<V>);
    /** Object associated with tag `{ ...this.tag, tag }` */
    with(tag: Tag): Leaf<V>;
}
export {};
//# sourceMappingURL=dedup.d.ts.map