export type Unit = '' | '%' | 's';
/**
 * Print out a number in percent with fixed decimal places
 */
export declare function valueString(value: number, unit?: Unit, fixed?: number): string;
export declare function isPercentStat<Key extends string>(key: Key): boolean;
export declare function getUnitStr<Key extends string>(key: Key): Unit;
export declare function statKeyToFixed(statKey: string): 1 | 0;
export declare function roundStat(value: number, statKey: string): number;
//# sourceMappingURL=numDisplay.d.ts.map