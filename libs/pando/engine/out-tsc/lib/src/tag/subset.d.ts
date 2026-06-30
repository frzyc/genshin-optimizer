import type { RawTagMapValues, TagMapEntries, TagMapEntry } from './compilation';
import type { TagId } from './keys';
import { entryRef } from './symb';
type Leaf<V> = {
    [entryRef]: TagMapEntry<V>[];
};
/**
 * `TagMap` specialized in finding entries with matching tags, ignoring
 * extraneous tag categories in the entry tags. Operates on `TagId`
 * instead of `Tag`.
 */
export declare class TagMapSubsetValues<V> {
    root: Internal<V>;
    constructor(tagLen: number, compiled: RawTagMapValues<V>);
    /** All entry values whose tags matching `id`. Missing entry tag categories are ignored */
    subset(id: TagId): V[];
    /** All entries whose tags matching `id`. Missing entry tag categories are ignored */
    entries(id: TagId): TagMapEntries<V>;
    _subset(id: TagId, callback: (_: Leaf<V>) => void): void;
}
declare class Internal<V> {
    children: {
        mask: number;
        map: Map<number, Internal<V>>;
    }[];
    leaf?: Leaf<V>;
    constructor(remLen: number, vals: RawTagMapValues<V>);
    subset(id: number): Internal<V>[];
}
export {};
//# sourceMappingURL=subset.d.ts.map