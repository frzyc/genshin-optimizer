import type { RawTagMapKeys } from './compilation';
import type { Tag } from './type';
export type TagId = Int32Array;
/** Mapping from `Tag` to a faster internal representation `TagId`. */
export declare class TagMapKeys {
    data: RawTagMapKeys['data'];
    tagLen: RawTagMapKeys['tagLen'];
    constructor(compiled: RawTagMapKeys);
    /** Returns a corresponding `TagId` */
    get(tag: Tag): TagId;
    /** Returns a corresponding `TagId` and its bitmask (excluding `null`) */
    getMask(tag: Tag): {
        id: TagId;
        mask: TagId;
    };
    /** Create a new `TagId` where values in `id` are replaced with `extra` */
    combine(id: TagId, extra: Tag): {
        id: TagId;
        firstReplacedByte: number;
    };
}
//# sourceMappingURL=keys.d.ts.map