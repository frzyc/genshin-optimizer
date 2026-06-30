import type { Tag, TagMapEntry } from '../tag';
import type { BaseRead } from './type';
export declare class TypedRead<T extends Tag> implements BaseRead {
    op: "read";
    x: never[];
    br: never[];
    tag: T;
    ex: BaseRead['ex'];
    constructor(tag: T, ex: BaseRead['ex']);
    /** Callback for when a tag `<cat>:<val>` is generated */
    register<C extends keyof T & string>(_cat: C, _val: T[C]): void;
    /** Return an instance with given `tag` and `ex` */
    ctor(tag: T, ex: BaseRead['ex']): this;
    with<C extends keyof T & string & string>(cat: C, val: T[C]): this;
    withTag(tag: T): this;
    withAll<C extends keyof T & string>(cat: C, keys: (T[C] & string)[]): Record<T[C] & string, this>;
    withAll<C extends keyof T & string, V>(cat: C, keys: (T[C] & string)[], transform: (r: this, k: T[C] & string) => V): Record<T[C] & string, V>;
    withAll<C extends keyof T & string, V, Base>(cat: C, keys: (T[C] & string)[], transform: (r: this, k: T[C] & string) => V, base: Base): {
        [k in (T[C] & string) | keyof Base]: k extends keyof Base ? Base[k] : V;
    };
    toEntry<V>(value: V): TagMapEntry<V, T>;
    get accu(): "sum" | "prod" | "min" | "max" | "unique" | "infer";
    get prod(): this;
    get sum(): this;
    get max(): this;
    get min(): this;
    get unique(): this;
    get infer(): this;
}
//# sourceMappingURL=read.d.ts.map