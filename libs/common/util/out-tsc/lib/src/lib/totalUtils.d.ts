type Entry = {
    total: number;
    current: number;
};
type CatTotalKey = string | number | symbol;
export declare function bulkCatTotal(catTotals: Record<CatTotalKey, readonly CatTotalKey[]>, cb: (ctMap: Record<CatTotalKey, Record<CatTotalKey, Entry>>) => void): Record<string | number, Record<CatTotalKey, string>>;
export declare function catTotal<T extends CatTotalKey>(keys: readonly T[], cb: (ct: Record<T, Entry>) => void): Record<T, string>;
export {};
//# sourceMappingURL=totalUtils.d.ts.map