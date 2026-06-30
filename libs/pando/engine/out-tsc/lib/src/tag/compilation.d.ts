import { entryRef } from './symb';
import type { Tag, TagCategory, TagValue } from './type';
/**
 * Serializable data for `TagMapKeys`. The format is not stabilized.
 * Use `compileTagMapKeys` to construct a valid object.
 */
export type RawTagMapKeys = {
    tagLen: number;
    data: Record<TagCategory, {
        offset: number;
        mask: number;
        ids: Record<TagValue, number>;
    }>;
};
/**
 * Serializable data for `TagMapSubsetValues`. The format is not
 * stabilized. Use `compileTagMapValues` to construct a valid object.
 */
export type RawTagMapValues<V> = {
    [key in string]?: RawTagMapValues<V>;
} & {
    [entryRef]?: TagMapEntry<V>[];
};
/** Uncompiled entry for `TagMap<V>` */
export type TagMapEntry<V, T = Tag> = {
    tag: T;
    value: V;
};
/** Uncompiled entries for `TagMap<V>` */
export type TagMapEntries<V, T = Tag> = TagMapEntry<V, T>[];
export declare function compileTagMapKeys(tags: readonly ({
    category: TagCategory;
    values: Set<TagValue>;
} | undefined)[]): RawTagMapKeys;
export declare function compileTagMapValues<V>(_keys: RawTagMapKeys, entries: TagMapEntries<V>): RawTagMapValues<V>;
export declare function mergeTagMapValues<V>(entries: RawTagMapValues<V>[]): RawTagMapValues<V>;
//# sourceMappingURL=compilation.d.ts.map