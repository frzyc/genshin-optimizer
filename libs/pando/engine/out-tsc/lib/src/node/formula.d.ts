import type { Lookup, Match, Max, Min, Prod, Sum, SumFrac, Threshold } from '../node';
type Arithmetics = Sum | Prod | Min | Max | SumFrac;
type Branching<Output> = Match<Output> | Threshold<Output> | Lookup<Output>;
export declare const arithmetic: Record<Arithmetics['op'] | 'unique', (x: number[]) => number>;
export declare const branching: Record<Branching<unknown>['op'], (br: (number | string)[], ex: any) => number>;
export {};
//# sourceMappingURL=formula.d.ts.map