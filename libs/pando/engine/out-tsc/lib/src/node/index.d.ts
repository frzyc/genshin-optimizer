export * from './calc';
export * from './construction';
export * from './read';
export * from './transform';
export * from './type';
export declare const calculation: {
    arithmetic: Record<"sum" | "prod" | "min" | "max" | "sumfrac" | "unique", (x: number[]) => number>;
    branching: Record<"lookup" | "thres" | "match", (br: (number | string)[], ex: any) => number>;
};
//# sourceMappingURL=index.d.ts.map