type SortConfig<T> = (id: T) => number | string;
export type SortConfigs<Keys extends string, T> = Record<Keys, SortConfig<T>>;
export declare function sortFunction<Keys extends string, T>(sortbyKeys: Keys[], ascending: boolean, configs: SortConfigs<Keys, T>, ascendingBypass?: Keys[]): (a: T, b: T) => number;
type FilterConfig<T> = (obj: T, filter: any, filters: {
    [str: string]: any;
}) => boolean;
export type FilterConfigs<Keys extends string, T> = Record<Keys, FilterConfig<T>>;
export declare function filterFunction<Keys extends string, T>(filterOptions: Partial<Record<Keys, any>>, filterConfigs: FilterConfigs<Keys, T>): (obj: T) => boolean;
export {};
//# sourceMappingURL=sortFilters.d.ts.map