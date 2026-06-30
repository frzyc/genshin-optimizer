import type { RawTagMapKeys, RawTagMapValues } from './compilation';
import { TagMapKeys } from './keys';
import { TagMapSubsetValues } from './subset';
import type { Tag } from './type';
export * from './compilation';
export * from './dedup';
export * from './keys';
export * from './subset';
export * from './type';
/** `TagMap` specialized in finding entries with matching tags, ignoring extraneous tag categories in the entry tags. */
export declare class TagMapSubset<V> {
    keys: TagMapKeys;
    values: TagMapSubsetValues<V>;
    constructor(keys: RawTagMapKeys, values: RawTagMapValues<V>);
    subset(tag: Tag): V[];
}
//# sourceMappingURL=index.d.ts.map